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

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $month = CarbonImmutable::parse(
            ($data['month'] ?? now()->format('Y-m')).'-01'
        );

        $slots = BookingSlot::query()
            ->with([
                'service:id,code,name',
                'bookings' => fn ($query) => $query
                    ->whereNotIn(
                        'status',
                        config('booking-slots.released_statuses', [
                            'cancelled',
                            'rejected',
                        ])
                    )
                    ->with('service:id,code,name'),
            ])
            ->whereHas(
                'service',
                fn ($query) => $query->whereIn(
                    'code',
                    config('booking-slots.services', [])
                )
            )
            ->whereDate('booking_date', '>=', $month->startOfMonth())
            ->whereDate('booking_date', '<=', $month->endOfMonth())
            ->whereDate('booking_date', '>=', today()->addDay())
            ->orderBy('booking_date')
            ->orderBy('start_time')
            ->get()
            ->groupBy(fn (BookingSlot $slot) => $this->slotKey($slot))
            ->map(fn (Collection $sharedSlots) => $this->data($sharedSlots))
            ->values();

        return response()->json([
            'data' => $slots,
            'month' => $month->format('Y-m'),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $month = CarbonImmutable::parse($data['month'].'-01');
        $earliestDate = CarbonImmutable::tomorrow();

        if ($month->endOfMonth()->isBefore($earliestDate)) {
            throw ValidationException::withMessages([
                'month' => 'Select the current month or a future month.',
            ]);
        }

        $services = Service::query()
            ->whereIn('code', config('booking-slots.services', []))
            ->get()
            ->keyBy('code');

        $missingServices = collect(config('booking-slots.services', []))
            ->diff($services->keys());

        if ($missingServices->isNotEmpty()) {
            throw ValidationException::withMessages([
                'month' => 'The parish booking services are not completely configured.',
            ]);
        }

        $result = DB::transaction(function () use ($month, $earliestDate, $services) {
            $createdRecords = 0;
            $skippedRecords = 0;
            $changedDates = [];

            $date = $month->startOfMonth()->isBefore($earliestDate)
                ? $earliestDate
                : $month->startOfMonth();

            $endDate = $month->endOfMonth();

            while ($date->lessThanOrEqualTo($endDate)) {
                $dateCreatedRecords = 0;

                $startTimes = $this->schedule->startTimesFor($date);

                foreach ($startTimes as $startTime) {
                    foreach ($services as $service) {
                        $slot = BookingSlot::firstOrCreate([
                            'service_id' => $service->id,
                            'booking_date' => $date,
                            'start_time' => $startTime,
                        ], [
                            'end_time' => $this->schedule->endTimeFor($startTime),
                            'capacity' => $this->schedule->capacityFor($service->code),
                            'is_active' => true,
                        ]);

                        if ($slot->wasRecentlyCreated) {
                            $createdRecords++;
                            $dateCreatedRecords++;
                        } else {
                            $skippedRecords++;
                        }
                    }
                }

                if ($dateCreatedRecords > 0) {
                    $changedDates[] = $date->toDateString();
                }

                $date = $date->addDay();
            }

            return [
                'datesOpened' => count($changedDates),
                'recordsCreated' => $createdRecords,
                'recordsSkipped' => $skippedRecords,
            ];
        });

        return response()->json([
            'message' => $result['recordsCreated'] > 0
                ? "Opened booking schedules for {$result['datesOpened']} dates."
                : 'The booking schedule for this month already exists.',
            ...$result,
        ], $result['recordsCreated'] > 0 ? 201 : 200);
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
}
