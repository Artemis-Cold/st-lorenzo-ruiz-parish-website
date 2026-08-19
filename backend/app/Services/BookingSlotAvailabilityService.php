<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSlot;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class BookingSlotAvailabilityService
{
    /**
     * Locks every service slot sharing this date and time before checking the
     * bookings. Concurrent requests therefore agree on the first service that
     * reserves the shared time.
     */
    public function lockBookable(int $slotId, string $expectedServiceCode, ?int $exceptBookingId = null): BookingSlot
    {
        $candidate = BookingSlot::query()->with('service:id,code,name')->findOrFail($slotId);

        $slots = BookingSlot::query()
            ->with('service:id,code,name')
            ->whereDate('booking_date', $candidate->booking_date)
            ->where('start_time', $candidate->start_time)
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        /** @var BookingSlot $slot */
        $slot = $slots->firstWhere('id', $candidate->id) ?? $candidate;

        if ($slot->service?->code !== $expectedServiceCode) {
            $this->unavailable('The selected time slot does not belong to this service.');
        }

        $state = $this->state(
            $slot,
            $this->activeBookingsFor($slot, $exceptBookingId, true),
        );

        if (! $state['available']) {
            $this->unavailable($state['message']);
        }

        return $slot;
    }

    /**
     * @param  Collection<int, Booking>  $bookings
     * @return array{available: bool, status: string, booked: int, lockedByService: ?string, message: string}
     */
    public function state(BookingSlot $slot, Collection $bookings): array
    {
        $slot->loadMissing('service:id,code,name');
        $serviceCode = $slot->service?->code;
        $serviceName = $slot->service?->name ?? 'service';
        $serviceBookings = $bookings->where('service_id', $slot->service_id)->values();
        $otherService = $bookings
            ->pluck('service')
            ->filter()
            ->unique('id')
            ->first(fn ($service) => $service->id !== $slot->service_id);

        if (! $slot->is_active) {
            return $this->stateResult(false, 'inactive', $serviceBookings->count(), null, 'The selected time slot is disabled.');
        }

        if ($slot->booking_date->isBefore(today())) {
            return $this->stateResult(false, 'past', $serviceBookings->count(), null, 'The selected time slot is in the past.');
        }

        if ($otherService) {
            return $this->stateResult(
                false,
                'locked',
                $serviceBookings->count(),
                $otherService->name,
                "This time is already reserved for {$otherService->name} on the selected date.",
            );
        }

        if ($serviceCode === 'baptism') {
            return $this->stateResult(true, 'available', $serviceBookings->count(), null, 'Available');
        }

        if ($serviceBookings->isNotEmpty()) {
            return $this->stateResult(
                false,
                'full',
                $serviceBookings->count(),
                null,
                "This {$serviceName} time slot already has a booking.",
            );
        }

        return $this->stateResult(true, 'available', 0, null, 'Available');
    }

    public function ensureNoDuplicate(int $serviceId, string $date, string $startTime): void
    {
        $exists = BookingSlot::query()
            ->where('service_id', $serviceId)
            ->whereDate('booking_date', $date)
            ->where('start_time', $startTime)
            ->lockForUpdate()
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'startTime' => 'This service already has availability for the selected date and time.',
            ]);
        }
    }

    /** @return Collection<int, Booking> */
    public function activeBookingsFor(BookingSlot $slot, ?int $exceptBookingId = null, bool $lock = false): Collection
    {
        return Booking::query()
            ->with('service:id,code,name')
            ->whereNotIn('status', config('booking-slots.released_statuses', ['cancelled', 'rejected']))
            ->whereHas('slot', fn ($query) => $query
                ->whereDate('booking_date', $slot->booking_date)
                ->where('start_time', $slot->start_time))
            ->when($exceptBookingId, fn ($query) => $query->whereKeyNot($exceptBookingId))
            ->when($lock, fn ($query) => $query->lockForUpdate())
            ->get();
    }

    /** @return array{available: bool, status: string, booked: int, lockedByService: ?string, message: string} */
    private function stateResult(
        bool $available,
        string $status,
        int $booked,
        ?string $lockedByService,
        string $message,
    ): array {
        return compact('available', 'status', 'booked', 'lockedByService', 'message');
    }

    private function unavailable(string $message): never
    {
        throw ValidationException::withMessages(['booking_slot_id' => $message]);
    }
}
