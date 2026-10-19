<?php

namespace Tests\Concerns;

use App\Models\Booking;
use App\Models\BookingSlot;
use Illuminate\Support\Str;

trait HasConfirmedSchedule
{
    /** Fixture for tests of the form/document stages after schedule approval. */
    protected function confirmedScheduleId(int $slotId): int
    {
        $slot = BookingSlot::findOrFail($slotId);

        return Booking::create([
            'booking_reference' => 'TEST-SCHEDULE-'.Str::random(12),
            'user_id' => auth()->id(), 'service_id' => $slot->service_id,
            'booking_slot_id' => $slotId, 'status' => 'pending', 'total_amount' => 0,
            'schedule_status' => 'confirmed', 'schedule_requested_at' => now(), 'schedule_reviewed_at' => now(),
        ])->id;
    }
}
