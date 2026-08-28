<?php

namespace App\Services;

use App\Models\Booking;
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
            'baptizand.godParentPairs',
            'weddingSponsorPairs',
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

            if (preg_match('/^wedding-sponsor:(\d+):(marriage_contract|confirmation_certificate)$/', $documentKey, $matches)) {
                $pair = $booking->weddingSponsorPairs()->whereKey((int) $matches[1])->first();

                return $this->rejectPairDocument(
                    $booking,
                    $pair,
                    $matches[2],
                    "wedding_sponsor_{$matches[2]}_{$matches[1]}",
                    $reason,
                );
            }

            if (preg_match('/^baptism-godparent:(\d+):(marriage_contract|confirmation_certificate)$/', $documentKey, $matches)) {
                $pair = $booking->baptizand?->godParentPairs()->whereKey((int) $matches[1])->first();

                return $this->rejectPairDocument(
                    $booking,
                    $pair,
                    $matches[2],
                    "godparent_{$matches[2]}_{$matches[1]}",
                    $reason,
                );
            }

            throw ValidationException::withMessages([
                'document_key' => 'Select a valid submitted requirement.',
            ]);
        });

        $booking->unsetRelation('documents');
        $booking->unsetRelation('weddingSponsorPairs');
        $booking->unsetRelation('baptizand');
        $booking->load([
            'user',
            'service',
            'documents',
            'weddingSponsorPairs',
            'baptizand.godParentPairs',
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

    private function rejectPairDocument(
        Booking $booking,
        mixed $pair,
        string $column,
        string $documentType,
        string $reason,
    ): string {
        $path = $pair?->{$column};

        if (! $pair || ! $path) {
            throw ValidationException::withMessages([
                'document_key' => 'This supporting document is no longer available for review.',
            ]);
        }

        $booking->documents()->updateOrCreate(
            ['document_type' => $documentType],
            [
                'file_name' => basename($path),
                'file_path' => $path,
                'status' => 'rejected',
                'remarks' => $reason,
            ]
        );
        $pair->update([$column => null]);

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

        if ($booking->weddingSponsorPairs->isEmpty()) {
            $definitions[] = [
                'key' => 'sponsor_document',
                'label' => 'Sponsor Marriage Contract or Confirmation Certificate',
                'types' => ['sponsor_marriage_contract', 'sponsor_confirmation_certificate'],
            ];

            return $definitions;
        }

        foreach ($booking->weddingSponsorPairs as $index => $pair) {
            if ($pair->marriage_contract || $pair->confirmation_certificate) {
                continue;
            }

            $definitions[] = [
                'key' => 'wedding_sponsor_document_'.$pair->id,
                'label' => 'Wedding sponsor pair '.($index + 1).' supporting document',
                'types' => [
                    'wedding_sponsor_marriage_contract_'.$pair->id,
                    'wedding_sponsor_confirmation_certificate_'.$pair->id,
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

        foreach ($booking->baptizand?->godParentPairs ?? [] as $index => $pair) {
            if ($pair->marriage_contract || $pair->confirmation_certificate) {
                continue;
            }

            $definitions[] = [
                'key' => 'godparent_document_'.$pair->id,
                'label' => 'Godparent pair '.($index + 1).' supporting document',
                'types' => [
                    'godparent_marriage_contract_'.$pair->id,
                    'godparent_confirmation_certificate_'.$pair->id,
                ],
            ];
        }

        return $definitions;
    }
}
