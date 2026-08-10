<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookingSlot;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BookingSlotController extends Controller
{
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
            ->with('service')
            ->withCount([
                'bookings as bookings_count' => fn ($query) => $query
                    ->whereNotIn('status', ['cancelled', 'rejected']),
            ]);

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

            return response()->json(
                $slots->groupBy(fn ($slot) => $slot->booking_date->toDateString())
                    ->map(function ($dailySlots, $date) {
                        $capacity = $dailySlots->sum('capacity');
                        $booked = $dailySlots->sum('bookings_count');
                        $remaining = $dailySlots->sum(fn ($slot) => max(0, $slot->capacity - $slot->bookings_count));

                        return [
                            'date' => $date,
                            'capacity' => $capacity,
                            'booked' => $booked,
                            'remaining' => $remaining,
                            'status' => $remaining === 0
                                ? 'full'
                                : ($remaining / $capacity <= 0.25 ? 'limited' : 'available'),
                        ];
                    })->values()
            );
        }

        $slots = $query
            ->whereDate('booking_date', $request->date)
            ->orderBy('start_time')
            ->get()
            ->map(function ($slot) {

                return [
                    'id' => $slot->id,

                    'start_time' => $slot->start_time,

                    'end_time' => $slot->end_time,

                    'capacity' => $slot->capacity,

                    'booked' => $slot->bookings_count,

                    'available' => $slot->bookings_count < $slot->capacity,
                ];
            });

        return response()->json($slots);
    }
}
