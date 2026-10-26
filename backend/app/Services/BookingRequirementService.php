<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\GodParent;
use App\Models\WeddingSponsor;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingRequirementService
{
    public function __construct(private SmsNotificationService $sms) {}

    public function reviewSummary(Booking $booking): array
    {
        $missing = $this->missing($booking);
        $documents = $booking->documents->where('document_type', '!=', 'payment_receipt');
        $legacyPending = $booking->weddingSponsors->whereNotNull('requirement_file_path')->count()
            + ($booking->baptizand?->godParents->whereNotNull('requirement_file_path')->count() ?? 0);

        return [
            'allApproved' => $missing === [] && $documents->isNotEmpty()
                && $documents->every(fn ($document) => $document->status === 'approved') && $legacyPending === 0,
            'physicalCopiesReceivedAt' => $booking->physical_copies_received_at?->toIso8601String(),
        ];
    }

    public function paymentReady(Booking $booking): bool
    {
        $booking->loadMissing('service');
        if (! in_array($booking->service?->code, ['baptism', 'wedding', 'funeral', 'confirmation', 'first-communion'], true)) {
            return true;
        }

        return $this->paymentSelectionReady($booking)
            && $booking->physical_copies_received_at !== null && $this->reviewSummary($booking)['allApproved'];
    }

    public function paymentSelectionReady(Booking $booking): bool
    {
        $booking->loadMissing('service');
        if (! in_array($booking->service?->code, ['baptism', 'wedding', 'funeral', 'confirmation', 'first-communion'], true)) {
            return true;
        }

        return $booking->scheduleConfirmed() && ! $booking->awaitingDetails();
    }

    public function requirePaymentReady(Booking $booking): void
    {
        if (! $this->paymentReady($booking)) {
            throw ValidationException::withMessages([
                'payment_method' => 'Payment is available after your digital requirements are approved and the parish receives all required physical copies. Until then, you may only save your preferred payment method.',
            ]);
        }
    }

    public function review(Booking $booking, string $action, ?string $key, int $staffId): void
    {
        DB::transaction(function () use ($booking, $action, $key, $staffId) {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            app(BookingScheduleReviewService::class)->requireUnlocked($booking);
            if (! in_array($booking->status, ['pending', 'paid', 'approved'], true)) {
                throw ValidationException::withMessages(['documents' => 'This booking is no longer available for document review.']);
            }
            if ($action === 'receive') {
                if (! $this->reviewSummary($booking)['allApproved']) {
                    throw ValidationException::withMessages(['documents' => 'Approve all digital requirements before receiving physical copies.']);
                }
                if (! $booking->physical_copies_received_at) {
                    $booking->update(['physical_copies_received_at' => now(), 'physical_copies_received_by' => $staffId]);
                }

                return;
            }

            // Convert older sponsor uploads into reviewable documents without moving their files.
            $booking->load(['weddingSponsors', 'baptizand.godParents']);
            $legacy = $booking->weddingSponsors->map(fn ($person) => [$person, 'wedding-sponsor-individual', 'wedding_sponsor_individual'])
                ->concat(($booking->baptizand?->godParents ?? collect())->map(fn ($person) => [$person, 'baptism-godparent-individual', 'baptism_godparent_individual']));
            foreach ($legacy as [$person, $prefix, $type]) {
                if (! $person->requirement_file_path || ($action !== 'approve_all' && $key !== "{$prefix}:{$person->id}")) {
                    continue;
                }
                $document = $booking->documents()->updateOrCreate(
                    ['document_type' => "{$type}_{$person->requirement_type}_{$person->id}"],
                    ['file_name' => $person->requirement_file_name ?: basename($person->requirement_file_path),
                        'file_path' => $person->requirement_file_path, 'status' => 'pending', 'remarks' => null]
                );
                $person->update(['requirement_file_path' => null, 'requirement_file_name' => null]);
                if ($action !== 'approve_all') {
                    $key = "document:{$document->id}";
                }
            }
            $documents = $booking->documents()->where('document_type', '!=', 'payment_receipt');
            if ($action !== 'approve_all') {
                if (! preg_match('/^document:(\d+)$/', $key ?? '', $matches)) {
                    throw ValidationException::withMessages(['document_key' => 'Select a valid requirement.']);
                }
                $document = $documents->whereKey((int) $matches[1])->first();
                if (! $document || $document->status === 'rejected') {
                    throw ValidationException::withMessages(['document_key' => 'Select an uploaded requirement awaiting review.']);
                }
                $document->update(['status' => 'approved', 'remarks' => null]);
            } else {
                $documents->where('status', 'pending')->update(['status' => 'approved', 'remarks' => null]);
            }
            $booking->load(['documents', 'weddingSponsors', 'baptizand.godParents']);
            if ($this->reviewSummary($booking)['allApproved'] && ! $booking->documents_approved_notified_at) {
                $this->sms->queue($booking->loadMissing('user'), 'booking_documents_approved',
                    "St. Lorenzo Ruiz Parish: All digital requirements for booking {$booking->booking_reference} are approved. Please submit the required physical copies to the parish office.");
                $booking->update(['documents_approved_notified_at' => now()]);
            }
        });
    }

    public function missing(Booking $booking): array
    {
        $booking->loadMissing([
            'service',
            'documents',
            'baptizand.godParents',
            'weddingSponsors',
        ]);
        $uploaded = $booking->documents
            ->where('status', '!=', 'rejected')
            ->pluck('document_type')
            ->all();

        return collect($this->definitions($booking))
            ->reject(fn (array $requirement) => count(array_intersect($requirement['types'], $uploaded)) > 0)
            ->values()
            ->all();
    }

    public function allowedTypes(Booking $booking): array
    {
        $defined = collect($this->definitions($booking))->flatMap(fn (array $item) => $item['types']);
        $optional = $booking->service?->code === 'baptism' ? ['baptism_permit', 'no_record_certificate'] : [];

        return $defined->merge($optional)->unique()->values()->all();
    }

    public function notifySubmitted(Booking $booking): void
    {
        if (! $booking->scheduleConfirmed()) {
            return; // The schedule-request SMS already explains the pending review.
        }
        $booking->loadMissing(['user', 'service', 'slot']);
        $slot = $booking->slot;
        if ($booking->status !== 'pending' || ! $slot) {
            return;
        }

        $date = $slot->booking_date->format('F j, Y');
        $time = CarbonImmutable::parse($slot->start_time, 'Asia/Manila')->format('g:i A');
        $reservation = $booking->service->code === 'baptism'
            ? "Your place in the selected baptism session on {$date} at {$time} is reserved"
            : "Your selected schedule on {$date} at {$time} is reserved";
        $nextStep = $this->missing($booking) !== []
            ? 'Please submit all required documents as soon as possible through My Profile.'
            : 'Your submitted documents are awaiting parish staff review. Check My Profile for updates.';

        $this->sms->queue(
            $booking,
            'booking_pending',
            "St. Lorenzo Ruiz Parish: Your {$booking->service->name} booking (Ref: {$booking->booking_reference}) is PENDING. {$reservation}, subject to parish approval. {$nextStep}"
        );
    }

    public function notifyIfIncomplete(Booking $booking): bool
    {
        app(BookingScheduleReviewService::class)->requireUnlocked($booking);
        $missing = $this->missing($booking);

        if ($missing === []) {
            return false;
        }

        $labels = collect($missing)->pluck('label')->join(', ', ' and ');
        $serviceName = $booking->service?->name ?? 'service';
        $this->sms->queue(
            $booking->loadMissing('user'),
            'booking_requirements',
            "St. Lorenzo Ruiz Parish: Reminder for your {$serviceName} booking (Ref: {$booking->booking_reference}). Missing requirements: {$labels}. Please upload them under My Profile for parish staff review. Thank you."
        );

        return true;
    }

    public function requestResubmission(Booking $booking, string $documentKey, string $reason): array
    {
        app(BookingScheduleReviewService::class)->requireUnlocked($booking);
        $reason = preg_replace('/\s+/', ' ', trim($reason));

        $documentType = DB::transaction(function () use ($booking, $documentKey, $reason) {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            app(BookingScheduleReviewService::class)->requireUnlocked($booking);
            if (! in_array($booking->status, ['pending', 'paid'], true)) {
                throw ValidationException::withMessages(['documents' => 'This booking is no longer awaiting review.']);
            }
            $booking->update(['physical_copies_received_at' => null, 'physical_copies_received_by' => null]);
            if (preg_match('/^document:(\d+)$/', $documentKey, $matches)) {
                $document = $booking->documents()->whereKey((int) $matches[1])->first();

                if (! $document || $document->document_type === 'payment_receipt') {
                    throw ValidationException::withMessages([
                        'document_key' => 'Select a valid submitted requirement.',
                    ]);
                }

                if ($document->status === 'rejected') {
                    throw ValidationException::withMessages([
                        'document_key' => 'This requirement is already awaiting resubmission.',
                    ]);
                }

                $document->update(['status' => 'rejected', 'remarks' => $reason]);

                return $document->document_type;
            }

            if (preg_match('/^wedding-sponsor-individual:(\d+)$/', $documentKey, $matches)) {
                $sponsor = WeddingSponsor::query()
                    ->whereKey((int) $matches[1])
                    ->where('booking_id', $booking->id)
                    ->first();

                return $this->rejectSponsorDocument($booking, $sponsor, $reason);
            }

            if (preg_match('/^baptism-godparent-individual:(\d+)$/', $documentKey, $matches)) {
                $godParent = GodParent::query()
                    ->whereKey((int) $matches[1])
                    ->whereHas('baptizand', fn ($query) => $query->where('booking_id', $booking->id))
                    ->first();

                return $this->rejectGodParentDocument($booking, $godParent, $reason);
            }

            throw ValidationException::withMessages([
                'document_key' => 'Select a valid submitted requirement.',
            ]);
        });

        $booking->refresh();
        $booking->unsetRelation('documents');
        $booking->unsetRelation('weddingSponsors');
        $booking->unsetRelation('baptizand');
        $booking->load([
            'user',
            'service',
            'documents',
            'weddingSponsors',
            'baptizand.godParents',
        ]);

        $requirement = collect($this->missing($booking))->first(
            fn (array $item) => in_array($documentType, $item['types'], true)
        );
        $label = $requirement['label'] ?? str($documentType)->headline()->toString();
        $serviceName = $booking->service?->name ?? 'service';

        $this->sms->queue(
            $booking,
            'booking_requirement_resubmission',
            "St. Lorenzo Ruiz Parish: A submitted requirement for your {$serviceName} booking (Ref: {$booking->booking_reference}) needs to be resubmitted. Requirement: {$label}. Reason: {$reason}. Please upload a clear and valid replacement under My Profile. Thank you."
        );

        return ['documentType' => $documentType, 'label' => $label];
    }

    private function rejectSponsorDocument(
        Booking $booking,
        ?WeddingSponsor $sponsor,
        string $reason,
    ): string {
        if (! $sponsor?->requirement_type || ! $sponsor->requirement_file_path) {
            throw ValidationException::withMessages([
                'document_key' => 'This sponsor document is no longer available for review.',
            ]);
        }

        $documentType = "wedding_sponsor_individual_{$sponsor->requirement_type}_{$sponsor->id}";
        $booking->documents()->updateOrCreate(
            ['document_type' => $documentType],
            [
                'file_name' => $sponsor->requirement_file_name
                    ?: basename($sponsor->requirement_file_path),
                'file_path' => $sponsor->requirement_file_path,
                'status' => 'rejected',
                'remarks' => $reason,
            ]
        );
        $sponsor->update([
            'requirement_file_name' => null,
            'requirement_file_path' => null,
        ]);

        return $documentType;
    }

    private function rejectGodParentDocument(
        Booking $booking,
        ?GodParent $godParent,
        string $reason,
    ): string {
        if (! $godParent?->requirement_type || ! $godParent->requirement_file_path) {
            throw ValidationException::withMessages([
                'document_key' => 'This godparent document is no longer available for review.',
            ]);
        }

        $documentType = "baptism_godparent_individual_{$godParent->requirement_type}_{$godParent->id}";
        $booking->documents()->updateOrCreate(
            ['document_type' => $documentType],
            [
                'file_name' => $godParent->requirement_file_name
                    ?: basename($godParent->requirement_file_path),
                'file_path' => $godParent->requirement_file_path,
                'status' => 'rejected',
                'remarks' => $reason,
            ]
        );
        $godParent->update([
            'requirement_file_name' => null,
            'requirement_file_path' => null,
        ]);

        return $documentType;
    }

    private function definitions(Booking $booking): array
    {
        return match ($booking->service?->code) {
            'wedding' => $this->weddingDefinitions($booking),
            'funeral' => [
                ['key' => 'death_certificate', 'label' => 'Death Certificate', 'types' => ['death_certificate']],
                ['key' => 'biography', 'label' => 'Memorial Biography', 'types' => ['biography']],
            ],
            'baptism' => $this->baptismDefinitions($booking),
            'confirmation', 'first-communion' => $this->formationSacramentDefinitions($booking),
            default => [],
        };
    }

    private function weddingDefinitions(Booking $booking): array
    {
        $definitions = [
            ['key' => 'marriage_license', 'label' => 'Marriage License', 'types' => ['marriage_license']],
            ['key' => 'cenomar', 'label' => 'CENOMAR', 'types' => ['cenomar']],
            ['key' => 'baptismal_certificate', 'label' => 'Baptismal Certificate', 'types' => ['baptismal_certificate']],
            ['key' => 'confirmation_certificate', 'label' => 'Confirmation Certificate', 'types' => ['confirmation_certificate']],
            ['key' => 'couple_photo_1', 'label' => '3R Couple Photo 1', 'types' => ['couple_photo_1', 'couple_photo']],
            ['key' => 'couple_photo_2', 'label' => '3R Couple Photo 2', 'types' => ['couple_photo_2', 'couple_photo']],
            ['key' => 'couple_photo_3', 'label' => '3R Couple Photo 3', 'types' => ['couple_photo_3', 'couple_photo']],
        ];

        $booking->loadMissing('weddingApplicants');
        if ($booking->weddingApplicants->contains(fn ($person) => $person->baptism_status !== null || $person->confirmation_status !== null)) {
            $definitions = array_values(array_filter($definitions, fn ($item) => ! in_array($item['key'], ['baptismal_certificate', 'confirmation_certificate'], true)));
            foreach ($booking->weddingApplicants as $person) {
                foreach (['baptism' => 'baptismal_certificate', 'confirmation' => 'confirmation_certificate'] as $sacrament => $certificate) {
                    // The linked preparation service handles a sacrament not yet received.
                    // Do not ask the parishioner to re-upload its certificate for the wedding.
                    if ($person->{$sacrament.'_status'} === 'no') {
                        continue;
                    }
                    $type = $person->role.'_'.$certificate;
                    $definitions[] = [
                        'key' => $type,
                        'label' => ucfirst($person->role).' '.str($certificate)->headline(),
                        'types' => [$type],
                    ];
                }
            }
        }

        foreach ($booking->weddingSponsors as $index => $sponsor) {
            if (! $sponsor->requirement_type || $sponsor->requirement_file_path) {
                continue;
            }

            $role = $sponsor->role === 'godfather' ? 'Godfather' : 'Godmother';
            $certificate = str($sponsor->requirement_type)->headline();
            $definitions[] = [
                'key' => 'wedding_sponsor_document_'.$sponsor->id,
                'label' => 'Sponsor '.($index + 1)." ({$role}) {$certificate}",
                'types' => [
                    "wedding_sponsor_individual_{$sponsor->requirement_type}_{$sponsor->id}",
                ],
            ];
        }

        return $definitions;
    }

    private function baptismDefinitions(Booking $booking): array
    {
        $definitions = [
            ['key' => 'birth_certificate', 'label' => 'Birth Certificate', 'types' => ['birth_certificate']],
        ];

        if (($booking->baptizand?->age ?? 0) >= 7) {
            $definitions[] = [
                'key' => 'no_record_certificate',
                'label' => 'Certificate of No Record of Baptism',
                'types' => ['no_record_certificate'],
            ];
        }

        foreach ($booking->baptizand?->godParents ?? [] as $index => $godParent) {
            if (! $godParent->requirement_type || $godParent->requirement_file_path) {
                continue;
            }

            $role = $godParent->role === 'godfather' ? 'Godfather' : 'Godmother';
            $certificate = str($godParent->requirement_type)->headline();
            $definitions[] = [
                'key' => 'baptism_godparent_document_'.$godParent->id,
                'label' => 'Godparent '.($index + 1)." ({$role}) {$certificate}",
                'types' => [
                    "baptism_godparent_individual_{$godParent->requirement_type}_{$godParent->id}",
                ],
            ];
        }

        return $definitions;
    }

    private function formationSacramentDefinitions(Booking $booking): array
    {
        $definitions = [
            ['key' => 'baptismal_certificate', 'label' => 'Baptismal Certificate', 'types' => ['baptismal_certificate']],
        ];

        if ($booking->service?->code !== 'confirmation') {
            return $definitions;
        }

        foreach ($booking->baptizand?->godParents ?? [] as $index => $sponsor) {
            if (! $sponsor->requirement_type) {
                continue;
            }

            $role = $sponsor->role === 'godfather' ? 'Godfather' : 'Godmother';
            $certificate = str($sponsor->requirement_type)->headline();
            $definitions[] = [
                'key' => 'confirmation_sponsor_document_'.$sponsor->id,
                'label' => 'Sponsor '.($index + 1)." ({$role}) {$certificate}",
                'types' => [
                    "confirmation_sponsor_individual_{$sponsor->requirement_type}_{$sponsor->id}",
                ],
            ];
        }

        return $definitions;
    }
}
