<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingReschedulingService
{
    private const ELIGIBLE_SERVICES = [
        'baptism', 'wedding', 'funeral', 'confirmation', 'first-communion',
    ];

    private const ELIGIBLE_STATUSES = ['pending', 'paid', 'approved'];

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
            if ($lockedBooking->wedding_booking_id || $lockedBooking->service?->code === 'first-communion') {
                throw ValidationException::withMessages(['booking_slot_id' => 'Please contact parish staff to change this priest-coordinated sacrament schedule.']);
            }

            if (! in_array($lockedBooking->service?->code, self::ELIGIBLE_SERVICES, true)) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Only parish service bookings with schedules can be rescheduled.',
                ]);
            }

            if (! in_array($lockedBooking->status, self::ELIGIBLE_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Only pending, paid, or approved bookings can be rescheduled.',
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

            if ($slot->booking_date->lessThanOrEqualTo(today())) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Same-day rescheduling is not allowed. Please select tomorrow or a later date.',
                ]);
            }

            $lockedBooking->update([
                'booking_slot_id' => $slot->id,
                'schedule_status' => 'awaiting_review',
                'schedule_reason' => null,
                'schedule_requested_at' => now(),
                'schedule_reviewed_at' => null,
                'schedule_reviewed_by' => null,
                'details_submitted_at' => $lockedBooking->schedule_status === null ? $lockedBooking->created_at : $lockedBooking->details_submitted_at,
                'status' => 'pending',
                'processed_by' => null,
                'processed_at' => null,
            ]);

            $lockedBooking = $lockedBooking->fresh(['service', 'slot']);
            app(BookingScheduleReviewService::class)->notifyRequested($lockedBooking);

            return $lockedBooking;
        });
    }
}
