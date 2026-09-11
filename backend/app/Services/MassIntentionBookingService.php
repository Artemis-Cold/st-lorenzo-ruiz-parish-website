<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Event;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MassIntentionBookingService
{
    public function __construct(private readonly PaymentService $payments) {}

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $service = Service::firstWhere('code', 'mass-intention');

            if (! $service || ! $service->is_active) {
                throw ValidationException::withMessages([
                    'intention_date' => 'Mass Intention service is unavailable.',
                ]);
            }

            $linePrice = $service->fees()
                ->where('code', 'intention_line')
                ->where('is_active', true)
                ->value('amount');

            if ($linePrice === null) {
                throw ValidationException::withMessages([
                    'groups' => 'The Mass Intention rate is currently unavailable.',
                ]);
            }

            $linePrice = (float) $linePrice;

            $massEvent = Event::query()
                ->whereKey($data['mass_event_id'])
                ->where('category', 'mass')
                ->first();

            if (! $massEvent || $massEvent->starts_at->toDateString() !== $data['intention_date']) {
                throw ValidationException::withMessages([
                    'mass_event_id' => 'The selected Mass schedule is unavailable for this date.',
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
                'payment_reference' => $data['payment_method'] === 'gcash'
                    ? $data['reference_number']
                    : null,
                'status' => 'pending',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $massIntention = $booking->massIntention()->create([
                'intention_date' => $data['intention_date'],
                'mass_event_id' => $massEvent->id,
                'mass_schedule_title' => $massEvent->title,
                'mass_starts_at' => $massEvent->starts_at,
                'mass_location' => $massEvent->location,
                'payment_reference' => $data['payment_method'] === 'gcash'
                    ? $data['reference_number']
                    : null,
                'total_amount' => $entryCount * $linePrice,
            ]);

            foreach ($data['groups'] as $group) {
                foreach ($group['entries'] as $entry) {
                    $massIntention->entries()->create([
                        'intention_type' => $group['type'],
                        'names' => $entry['names'],
                        'amount' => $linePrice,
                    ]);
                }
            }

            $this->payments->createAttempt(
                $booking,
                $data['payment_method'],
                $data['reference_number'] ?? null,
                $data['receipt'] ?? null,
            );

            return $booking->load([
                'massIntention.entries',
                'documents',
                'payments.receiptDocument',
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
