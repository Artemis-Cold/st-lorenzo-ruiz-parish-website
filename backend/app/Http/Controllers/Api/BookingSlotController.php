<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookingSlot;
use App\Models\Service;
use Illuminate\Http\Request;

class BookingSlotController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'service' => ['required', 'string'],
            'date' => ['required', 'date'],
        ]);

        $service = Service::where(
            'code',
            $request->service
        )->firstOrFail();

        $slots = BookingSlot::query()
            ->where('service_id', $service->id)
            ->whereDate('booking_date', $request->date)
            ->where('is_active', true)
            ->withCount('bookings')
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
