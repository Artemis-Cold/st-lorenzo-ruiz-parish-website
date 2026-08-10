<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Services\BookingSlotAvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StaffAvailabilityController extends Controller
{
    public function __construct(private BookingSlotAvailabilityService $availability) {}

    public function index(): JsonResponse
    {
        $slots = BookingSlot::query()
            ->with('service:id,code,name')
            ->withCount(['bookings as bookings_count' => fn ($query) => $query->whereNotIn('status', ['cancelled', 'rejected'])])
            ->whereDate('booking_date', '>=', today())
            ->orderBy('booking_date')->orderBy('start_time')->get();

        return response()->json(['data' => $slots->map(fn ($slot) => $this->data($slot))]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'serviceCode' => ['required', Rule::in(['wedding', 'baptism', 'funeral'])],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'startTime' => ['required', 'date_format:H:i'],
            'endTime' => ['required', 'date_format:H:i', 'after:startTime'],
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $service = Service::query()->where('code', $data['serviceCode'])->first();

        if (! $service) {
            return response()->json(['errors' => [
                'serviceCode' => ['The selected parish service is not configured.'],
            ]], 422);
        }

        $slot = DB::transaction(function () use ($data, $service) {
            $this->availability->ensureNoOverlap(
                $data['date'],
                $data['startTime'],
                $data['endTime'],
            );

            return BookingSlot::create([
                'service_id' => $service->id,
                'booking_date' => $data['date'],
                'start_time' => $data['startTime'],
                'end_time' => $data['endTime'],
                'capacity' => $data['capacity'],
                'is_active' => true,
            ]);
        });

        $slot->load('service:id,code,name')->loadCount(['bookings as bookings_count']);
        return response()->json(['data' => $this->data($slot)], 201);
    }

    public function update(Request $request, BookingSlot $bookingSlot): JsonResponse
    {
        $data = $request->validate([
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $bookingSlot->update([
            ...isset($data['capacity']) ? ['capacity' => $data['capacity']] : [],
            ...array_key_exists('isActive', $data) ? ['is_active' => $data['isActive']] : [],
        ]);

        $bookingSlot->load('service:id,code,name')->loadCount(['bookings as bookings_count' => fn ($query) => $query->whereNotIn('status', ['cancelled', 'rejected'])]);
        return response()->json(['data' => $this->data($bookingSlot)]);
    }

    public function destroy(BookingSlot $bookingSlot): JsonResponse
    {
        if ($bookingSlot->bookings()->exists()) {
            return response()->json(['message' => 'A slot with bookings cannot be deleted. Disable it instead.'], 422);
        }

        $bookingSlot->delete();
        return response()->json(['message' => 'Availability removed.']);
    }

    private function data(BookingSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'serviceCode' => $slot->service->code,
            'serviceName' => $slot->service->name,
            'date' => $slot->booking_date->toDateString(),
            'startTime' => $slot->start_time,
            'endTime' => $slot->end_time,
            'capacity' => $slot->capacity,
            'booked' => $slot->bookings_count ?? 0,
            'isActive' => $slot->is_active,
        ];
    }
}
