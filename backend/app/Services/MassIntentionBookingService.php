<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MassIntentionBookingService
{
    private const AMOUNT_PER_ENTRY = 100;

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $service = Service::firstWhere('code', 'mass-intention');

            if (! $service || ! $service->is_active) {
                throw ValidationException::withMessages([
                    'intention_date' => 'Mass Intention service is unavailable.',
                ]);
            }

            $entryCount = collect($data['groups'])
                ->sum(fn (array $group) => count($group['entries']));

            $booking = Booking::create([
                'booking_reference' => $this->reference(),
                'user_id' => auth()->id(),
                'service_id' => $service->id,
                'service_package_id' => null,
                'booking_slot_id' => null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            $massIntention = $booking->massIntention()->create([
                'intention_date' => $data['intention_date'],
                'payment_reference' => $data['reference_number'],
                'total_amount' => $entryCount * self::AMOUNT_PER_ENTRY,
            ]);

            foreach ($data['groups'] as $group) {
                foreach ($group['entries'] as $entry) {
                    $massIntention->entries()->create([
                        'intention_type' => $group['type'],
                        'names' => $entry['names'],
                        'amount' => self::AMOUNT_PER_ENTRY,
                    ]);
                }
            }

            /** @var UploadedFile $receipt */
            $receipt = $data['receipt'];
            $booking->documents()->create([
                'document_type' => 'payment_receipt',
                'file_name' => $receipt->getClientOriginalName(),
                'file_path' => $receipt->store('booking-documents', 'public'),
                'status' => 'pending',
            ]);

            return $booking->load([
                'massIntention.entries',
                'documents',
            ]);
        });
    }

    private function reference(): string
    {
        do {
            $reference = 'MAS-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }
}
