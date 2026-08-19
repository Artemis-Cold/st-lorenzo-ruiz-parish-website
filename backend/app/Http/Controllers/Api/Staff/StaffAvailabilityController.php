<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Services\BookingSlotScheduleService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StaffAvailabilityController extends Controller
{
    public function __construct(private BookingSlotScheduleService $schedule) {}

    public function index(): JsonResponse
    {
        $slots = BookingSlot::query()
            ->with([
                'service:id,code,name',
                'bookings' => fn ($query) => $query
                    ->whereNotIn('status', config('booking-slots.released_statuses', ['cancelled', 'rejected']))
                    ->with('service:id,code,name'),
            ])
            ->whereHas('service', fn ($query) => $query->whereIn('code', config('booking-slots.services', [])))
            ->whereDate('booking_date', '>=', today())
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn (BookingSlot $slot) => $this->slotKey($slot))
            ->map(fn (Collection $sharedSlots) => $this->data($sharedSlots))
            ->values();

        return response()->json(['data' => $slots]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'dates' => ['required', 'array', 'min:1', 'max:90'],
            'dates.*' => ['required', 'distinct', 'date_format:Y-m-d', 'after_or_equal:today'],
        ]);

        $services = Service::query()
            ->whereIn('code', config('booking-slots.services', []))
            ->get()
            ->keyBy('code');

        $missingServices = collect(config('booking-slots.services', []))->diff($services->keys());

        if ($missingServices->isNotEmpty()) {
            throw ValidationException::withMessages([
                'dates' => 'The parish booking services are not completely configured.',
            ]);
        }

        $result = DB::transaction(function () use ($data, $services) {
            $result = [
                'datesCreated' => 0,
                'datesRestored' => 0,
                'datesUnchanged' => 0,
            ];

            foreach ($data['dates'] as $date) {
                $bookingDate = CarbonImmutable::parse($date);
                $startTimes = $this->schedule->startTimesFor($date);
                $expectedSlotCount = count($startTimes) * $services->count();
                $existingSlots = BookingSlot::query()
                    ->whereIn('service_id', $services->pluck('id'))
                    ->whereDate('booking_date', $bookingDate)
                    ->whereIn('start_time', $startTimes)
                    ->lockForUpdate()
                    ->get();

                if ($existingSlots->count() === $expectedSlotCount
                    && $existingSlots->every(fn (BookingSlot $slot) => $slot->is_active)) {
                    $result['datesUnchanged']++;

                    continue;
                }

                $result[$existingSlots->isEmpty() ? 'datesCreated' : 'datesRestored']++;

                foreach ($startTimes as $startTime) {
                    foreach ($services as $service) {
                        BookingSlot::updateOrCreate([
                            'service_id' => $service->id,
                            'booking_date' => $bookingDate,
                            'start_time' => $startTime,
                        ], [
                            'end_time' => $this->schedule->endTimeFor($startTime),
                            'capacity' => $this->schedule->capacityFor($service->code),
                            'is_active' => true,
                        ]);
                    }
                }
            }

            return $result;
        });

        return response()->json([
            'message' => $this->storeMessage($result),
            ...$result,
        ], $result['datesCreated'] + $result['datesRestored'] > 0 ? 201 : 200);
    }

    public function update(Request $request, BookingSlot $bookingSlot): JsonResponse
    {
        $data = $request->validate([
            'isActive' => ['required', 'boolean'],
        ]);

        $this->sharedSlotQuery($bookingSlot)->update(['is_active' => $data['isActive']]);

        return response()->json([
            'message' => $data['isActive'] ? 'Time slot enabled.' : 'Time slot disabled.',
        ]);
    }

    public function destroy(BookingSlot $bookingSlot): JsonResponse
    {
        $sharedSlotIds = $this->sharedSlotQuery($bookingSlot)->pluck('id');

        $hasBookings = DB::table('bookings')
            ->whereIn('booking_slot_id', $sharedSlotIds)
            ->exists();

        if ($hasBookings) {
            return response()->json([
                'message' => 'A shared time slot with bookings cannot be deleted. Disable it instead.',
            ], 422);
        }

        BookingSlot::query()->whereKey($sharedSlotIds)->delete();

        return response()->json(['message' => 'Shared availability removed.']);
    }

    private function sharedSlotQuery(BookingSlot $slot)
    {
        return BookingSlot::query()
            ->whereDate('booking_date', $slot->booking_date)
            ->where('start_time', $slot->start_time)
            ->whereHas('service', fn ($query) => $query->whereIn('code', config('booking-slots.services', [])));
    }

    /** @param Collection<int, BookingSlot> $slots */
    private function data(Collection $slots): array
    {
        /** @var BookingSlot $representative */
        $representative = $slots->first();
        $bookings = $slots->flatMap->bookings;
        $bookedService = $bookings->first()?->service;

        return [
            'id' => $representative->id,
            'date' => $representative->booking_date->toDateString(),
            'startTime' => substr($representative->start_time, 0, 5),
            'endTime' => substr($representative->end_time, 0, 5),
            'booked' => $bookings->count(),
            'lockedByService' => $bookedService?->name,
            'isActive' => $slots->every(fn (BookingSlot $slot) => $slot->is_active),
        ];
    }

    private function slotKey(BookingSlot $slot): string
    {
        return $slot->booking_date->toDateString().'|'.substr($slot->start_time, 0, 5);
    }

    /** @param array{datesCreated: int, datesRestored: int, datesUnchanged: int} $result */
    private function storeMessage(array $result): string
    {
        $messages = [];

        if ($result['datesCreated'] > 0) {
            $messages[] = $result['datesCreated'] === 1
                ? 'Opened 1 new schedule date.'
                : "Opened {$result['datesCreated']} new schedule dates.";
        }

        if ($result['datesRestored'] > 0) {
            $messages[] = $result['datesRestored'] === 1
                ? 'Restored 1 incomplete or disabled schedule date.'
                : "Restored {$result['datesRestored']} incomplete or disabled schedule dates.";
        }

        if ($result['datesUnchanged'] > 0) {
            $messages[] = $result['datesUnchanged'] === 1
                ? '1 selected date was already open.'
                : "{$result['datesUnchanged']} selected dates were already open.";
        }

        return implode(' ', $messages);
    }
}
