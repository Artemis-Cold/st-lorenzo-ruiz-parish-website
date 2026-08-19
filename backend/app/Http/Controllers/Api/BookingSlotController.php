<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Services\BookingSlotAvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class BookingSlotController extends Controller
{
    public function __construct(private BookingSlotAvailabilityService $availability) {}

    public function index(Request $request)
    {
        $request->validate([
            'service' => ['required', 'string'],
            'date' => ['nullable', 'required_without:month', 'date_format:Y-m-d'],
            'month' => ['nullable', 'required_without:date', 'date_format:Y-m'],
        ]);

        $service = Service::where(
            'code',
            $request->service
        )->firstOrFail();

        $query = BookingSlot::query()
            ->where('service_id', $service->id)
            ->where('is_active', true)
            ->with('service:id,code,name');

        if ($request->filled('month')) {
            $month = Carbon::createFromFormat('Y-m', $request->month);
            $today = Carbon::today();
            $monthEnd = $month->copy()->endOfMonth();

            if ($monthEnd->lt($today)) {
                return response()->json([]);
            }

            $rangeStart = $month->copy()->startOfMonth()->max($today);
            $slots = $query
                ->whereBetween('booking_date', [
                    $rangeStart->toDateString(),
                    $monthEnd->toDateString(),
                ])
                ->orderBy('booking_date')
                ->orderBy('start_time')
                ->get();
            $bookings = $this->activeBookingsBetween($rangeStart, $monthEnd);

            return response()->json(
                $slots->groupBy(fn ($slot) => $slot->booking_date->toDateString())
                    ->map(function ($dailySlots, $date) use ($bookings) {
                        $capacity = $dailySlots->count();
                        $remaining = $dailySlots->filter(function (BookingSlot $slot) use ($bookings) {
                            $state = $this->availability->state(
                                $slot,
                                $bookings->get($this->slotKey($slot), collect()),
                            );

                            return $state['available'];
                        })->count();
                        $booked = $capacity - $remaining;

                        return [
                            'date' => $date,
                            'capacity' => $capacity,
                            'booked' => $booked,
                            'remaining' => $remaining,
                            'status' => $remaining === 0
                                ? 'full'
                                : ($remaining / $capacity <= 0.5 ? 'limited' : 'available'),
                        ];
                    })->values()
            );
        }

        $slots = $query
            ->whereDate('booking_date', $request->date)
            ->orderBy('start_time')
            ->get();
        $date = Carbon::createFromFormat('Y-m-d', $request->date);
        $bookings = $this->activeBookingsBetween($date, $date);

        $slots = $slots->map(function (BookingSlot $slot) use ($bookings) {
            $state = $this->availability->state(
                $slot,
                $bookings->get($this->slotKey($slot), collect()),
            );

            return [
                'id' => $slot->id,
                'start_time' => $slot->start_time,
                'end_time' => $slot->end_time,
                'capacity' => $slot->service->code === 'baptism' ? null : 1,
                'booked' => $state['booked'],
                'available' => $state['available'],
                'availability_status' => $state['status'],
                'locked_by_service' => $state['lockedByService'],
            ];
        });

        return response()->json($slots);
    }

    /** @return Collection<string, Collection<int, Booking>> */
    private function activeBookingsBetween(Carbon $start, Carbon $end): Collection
    {
        return Booking::query()
            ->with(['service:id,code,name', 'slot:id,booking_date,start_time'])
            ->whereNotIn('status', config('booking-slots.released_statuses', ['cancelled', 'rejected']))
            ->whereHas('slot', fn ($query) => $query
                ->whereDate('booking_date', '>=', $start->toDateString())
                ->whereDate('booking_date', '<=', $end->toDateString()))
            ->get()
            ->groupBy(fn (Booking $booking) => $this->slotKey($booking->slot));
    }

    private function slotKey(BookingSlot $slot): string
    {
        return $slot->booking_date->toDateString().'|'.substr($slot->start_time, 0, 5);
    }
}
