<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingScheduleReviewService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingScheduleRequestController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate(['service' => ['required', Rule::in(BookingScheduleReviewService::SERVICES)]]);

        return response()->json(['data' => Booking::with('slot')->where('user_id', $request->user()->id)
            ->whereHas('service', fn ($q) => $q->where('code', $data['service']))
            ->whereNotNull('schedule_status')->whereNull('details_submitted_at')->where('status', 'pending')
            ->orderByDesc('id')->get()->map(fn ($booking) => $this->serialize($booking))]);
    }

    public function store(Request $request, BookingScheduleReviewService $service)
    {
        $data = $request->validate([
            'service' => ['required', Rule::in(BookingScheduleReviewService::SERVICES)],
            'booking_slot_id' => ['required', 'integer', 'exists:booking_slots,id'],
        ]);
        $booking = $service->request($data['booking_slot_id'], $data['service'], $request->user());

        return response()->json(['data' => $this->serialize($booking->load('slot'))], 201);
    }

    private function serialize(Booking $booking): array
    {
        return [
            'id' => $booking->id, 'reference' => $booking->booking_reference,
            'review' => $booking->scheduleReview(), 'date' => $booking->slot?->booking_date?->toDateString(),
            'slot' => $booking->slot ? [
                'id' => $booking->slot->id, 'start_time' => $booking->slot->start_time, 'end_time' => $booking->slot->end_time,
                'capacity' => $booking->slot->capacity, 'booked' => 1, 'available' => false,
                'availability_status' => 'full', 'locked_by_service' => null,
            ] : null,
        ];
    }
}
