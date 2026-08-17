<?php

namespace App\Services;

use App\Models\Booking;

class BookingRequirementService
{
    public function __construct(private SmsNotificationService $sms) {}

    public function missing(Booking $booking): array
    {
        $booking->loadMissing(['service', 'documents', 'baptizand.godParentPairs']);
        $uploaded = $booking->documents->pluck('document_type')->all();

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

    private function definitions(Booking $booking): array
    {
        return match ($booking->service?->code) {
            'wedding' => [
                ['key' => 'marriage_license', 'label' => 'Marriage License', 'types' => ['marriage_license']],
                ['key' => 'cenomar', 'label' => 'CENOMAR', 'types' => ['cenomar']],
                ['key' => 'baptismal_certificate', 'label' => 'Baptismal Certificate', 'types' => ['baptismal_certificate']],
                ['key' => 'confirmation_certificate', 'label' => 'Confirmation Certificate', 'types' => ['confirmation_certificate']],
                ['key' => 'couple_photo', 'label' => 'Couple Photo', 'types' => ['couple_photo']],
                [
                    'key' => 'sponsor_document',
                    'label' => 'Sponsor Marriage Contract or Confirmation Certificate',
                    'types' => ['sponsor_marriage_contract', 'sponsor_confirmation_certificate'],
                ],
            ],
            'funeral' => [
                ['key' => 'death_certificate', 'label' => 'Death Certificate', 'types' => ['death_certificate']],
                ['key' => 'biography', 'label' => 'Memorial Biography', 'types' => ['biography']],
            ],
            'baptism' => $this->baptismDefinitions($booking),
            default => [],
        };
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
