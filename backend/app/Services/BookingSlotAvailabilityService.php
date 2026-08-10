<?php

namespace App\Services;

use App\Models\BookingSlot;
use Illuminate\Validation\ValidationException;

class BookingSlotAvailabilityService
{
    public function ensureNoOverlap(
        string $date,
        string $startTime,
        string $endTime,
        ?int $exceptSlotId = null,
    ): void {
        $overlappingSlot = BookingSlot::query()
            ->with('service:id,name')
            ->whereDate('booking_date', $date)
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->when($exceptSlotId, fn ($query) => $query->whereKeyNot($exceptSlotId))
            ->lockForUpdate()
            ->first();

        if (! $overlappingSlot) {
            return;
        }

        $service = $overlappingSlot->service?->name ?? 'another service';
        $existingTime = substr($overlappingSlot->start_time, 0, 5)
            .'–'.substr($overlappingSlot->end_time, 0, 5);

        throw ValidationException::withMessages([
            'startTime' => "This time overlaps the {$service} slot at {$existingTime}.",
            'endTime' => 'Choose a time range that does not overlap any parish service.',
        ]);
    }

    public function ensureBookable(BookingSlot $slot): void
    {
        $slot->loadMissing('service');
        $activeStatuses = ['cancelled', 'rejected'];
        $booked = $slot->bookings()->whereNotIn('status', $activeStatuses)->count();

        if ($slot->is_active === false || $booked >= $slot->capacity) {
            $this->unavailable();
        }
    }

    private function unavailable(string $message = 'Selected booking slot is unavailable.'): never
    {
        throw ValidationException::withMessages(['booking_slot_id' => $message]);
    }
}
