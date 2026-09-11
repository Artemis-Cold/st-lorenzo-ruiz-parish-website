<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\GodParent;
use App\Models\WeddingSponsor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingRequirementService
{
    public function __construct(private SmsNotificationService $sms) {}

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

    public function notifyIfIncomplete(Booking $booking): bool
    {
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
        $reason = preg_replace('/\s+/', ' ', trim($reason));

        $documentType = DB::transaction(function () use ($booking, $documentKey, $reason) {
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
}
