<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingReschedulingService
{
    private const ELIGIBLE_SERVICES = ['baptism', 'wedding', 'funeral'];

    private const ELIGIBLE_STATUSES = ['pending', 'approved'];

    public function __construct(
        private BookingSlotAvailabilityService $availability
    ) {}

    public function reschedule(
        Booking $booking,
        int $slotId,
        int $userId
    ): Booking {
        return DB::transaction(function () use ($booking, $slotId, $userId) {
            $lockedBooking = Booking::query()
                ->with('service')
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($lockedBooking->user_id !== $userId) {
                throw (new ModelNotFoundException)->setModel(Booking::class);
            }

            if (! in_array($lockedBooking->service?->code, self::ELIGIBLE_SERVICES, true)) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Only Baptism, Wedding, and Funeral bookings can be rescheduled.',
                ]);
            }

            if (! in_array($lockedBooking->status, self::ELIGIBLE_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Only pending or approved bookings can be rescheduled.',
                ]);
            }

            if ($lockedBooking->booking_slot_id === $slotId) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Please select a different schedule.',
                ]);
            }

            $slot = $this->availability->lockBookable(
                $slotId,
                $lockedBooking->service->code,
                $lockedBooking->id,
            );

            if ($slot->booking_date->isBefore(today())) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'The selected schedule must not be in the past.',
                ]);
            }

            $lockedBooking->update([
                'booking_slot_id' => $slot->id,
                'status' => 'pending',
                'processed_by' => null,
                'processed_at' => null,
            ]);

            return $lockedBooking->fresh(['service', 'slot']);
        });
    }
}
