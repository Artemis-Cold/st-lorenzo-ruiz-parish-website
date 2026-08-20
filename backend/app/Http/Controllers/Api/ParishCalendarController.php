<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParishCalendarController extends Controller
{
    public function bookedServices(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $month = CarbonImmutable::createFromFormat('Y-m', $data['month']);
        $start = $month->startOfMonth();
        $end = $month->endOfMonth();

        $bookings = Booking::query()
            ->select(['id', 'service_id', 'booking_slot_id', 'status'])
            ->with([
                'service:id,code,name',
                'slot:id,booking_date,start_time,end_time',
                'weddingApplicants:id,booking_id,role,last_name',
            ])
            ->whereNotIn('status', config('booking-slots.released_statuses', ['cancelled', 'rejected']))
            ->whereHas('service', fn ($query) => $query->whereIn('code', config('booking-slots.services', [])))
            ->whereHas('slot', fn ($query) => $query
                ->whereDate('booking_date', '>=', $start->toDateString())
                ->whereDate('booking_date', '<=', $end->toDateString()))
            ->get();

        $days = $bookings
            ->groupBy(fn (Booking $booking) => $booking->slot->booking_date->toDateString())
            ->map(function ($dailyBookings, string $date) {
                $services = $dailyBookings
                    ->groupBy(fn (Booking $booking) => implode('|', [
                        $booking->service_id,
                        substr($booking->slot->start_time, 0, 5),
                    ]))
                    ->map(function ($scheduledBookings) {
                        /** @var Booking $booking */
                        $booking = $scheduledBookings->first();

                        return [
                            'serviceCode' => $booking->service->code,
                            'serviceName' => $booking->service->name,
                            'displayName' => $this->displayName($booking),
                            'startTime' => substr($booking->slot->start_time, 0, 5),
                            'endTime' => substr($booking->slot->end_time, 0, 5),
                            'count' => $scheduledBookings->count(),
                        ];
                    })
                    ->sortBy(fn (array $service) => $service['startTime'].'|'.$service['serviceName'])
                    ->values();

                return ['date' => $date, 'services' => $services];
            })
            ->sortKeys()
            ->values();

        return response()->json(['data' => $days]);
    }

    private function displayName(Booking $booking): string
    {
        if ($booking->service->code === 'funeral') {
            return 'Funeral Service';
        }

        if ($booking->service->code !== 'wedding') {
            return $booking->service->name;
        }

        $groom = $booking->weddingApplicants->firstWhere('role', 'groom')?->last_name;
        $bride = $booking->weddingApplicants->firstWhere('role', 'bride')?->last_name;

        return $groom && $bride ? "{$groom} & {$bride} Wedding" : 'Wedding';
    }
}
