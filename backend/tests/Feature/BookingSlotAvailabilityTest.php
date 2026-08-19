<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use App\Services\BookingSlotAvailabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class BookingSlotAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_baptism_accepts_unlimited_bookings_and_locks_the_time_from_other_services(): void
    {
        [$baptism, $wedding, $funeral] = $this->services();
        $date = today()->addWeek();
        $baptismSlot = $this->slot($baptism, $date, '09:00');
        $weddingSlot = $this->slot($wedding, $date, '09:00');
        $funeralSlot = $this->slot($funeral, $date, '09:00');

        $this->createBookings($baptism, $baptismSlot, 25);
        $availability = app(BookingSlotAvailabilityService::class);

        $this->assertCount(25, $availability->activeBookingsFor($baptismSlot));

        $this->assertSame(
            $baptismSlot->id,
            $availability->lockBookable($baptismSlot->id, 'baptism')->id,
        );

        $this->slotsFor('baptism', $date)
            ->assertOk()
            ->assertJsonPath('0.capacity', null)
            ->assertJsonPath('0.booked', 25)
            ->assertJsonPath('0.available', true)
            ->assertJsonPath('0.availability_status', 'available');

        foreach ([['wedding', $weddingSlot], ['funeral', $funeralSlot]] as [$code, $slot]) {
            $this->slotsFor($code, $date)
                ->assertOk()
                ->assertJsonPath('0.id', $slot->id)
                ->assertJsonPath('0.available', false)
                ->assertJsonPath('0.availability_status', 'locked')
                ->assertJsonPath('0.locked_by_service', 'Baptism');
        }

        try {
            app(BookingSlotAvailabilityService::class)->lockBookable($weddingSlot->id, 'wedding');
            $this->fail('The cross-service lock should reject a Wedding booking.');
        } catch (ValidationException $exception) {
            $this->assertSame(
                'This time is already reserved for Baptism on the selected date.',
                $exception->errors()['booking_slot_id'][0],
            );
        }
    }

    public function test_wedding_and_funeral_allow_only_one_booking_and_lock_other_services(): void
    {
        [$baptism, $wedding, $funeral] = $this->services();
        $date = today()->addWeek();
        $this->slot($baptism, $date, '11:00');
        $weddingSlot = $this->slot($wedding, $date, '11:00');
        $this->slot($funeral, $date, '11:00');
        $this->createBookings($wedding, $weddingSlot, 1);

        $this->slotsFor('wedding', $date)
            ->assertJsonPath('0.available', false)
            ->assertJsonPath('0.availability_status', 'full');

        foreach (['baptism', 'funeral'] as $code) {
            $this->slotsFor($code, $date)
                ->assertJsonPath('0.available', false)
                ->assertJsonPath('0.availability_status', 'locked')
                ->assertJsonPath('0.locked_by_service', 'Wedding');
        }

        $this->assertNotBookable($weddingSlot, 'wedding');

        $funeralAtOne = $this->slot($funeral, $date, '13:00');
        $this->createBookings($funeral, $funeralAtOne, 1, 1);

        $this->slotsFor('funeral', $date)
            ->assertJsonPath('1.available', false)
            ->assertJsonPath('1.availability_status', 'full');
        $this->assertNotBookable($funeralAtOne, 'funeral');
    }

    public function test_calendar_status_counts_available_clock_times_after_cross_service_locks(): void
    {
        [, $wedding, $funeral] = $this->services();
        $date = today()->addWeek();

        foreach (['08:00', '09:00', '10:00'] as $time) {
            $this->slot($wedding, $date, $time);
        }

        $funeralAtEight = $this->slot($funeral, $date, '08:00');
        $weddingAtNine = BookingSlot::where('service_id', $wedding->id)->where('start_time', '09:00')->firstOrFail();
        $this->createBookings($funeral, $funeralAtEight, 1);
        $this->createBookings($wedding, $weddingAtNine, 1);

        $this->availabilityFor('wedding', $date)
            ->assertOk()
            ->assertJsonPath('0.capacity', 3)
            ->assertJsonPath('0.remaining', 1)
            ->assertJsonPath('0.status', 'limited');

        $funeralAtTen = $this->slot($funeral, $date, '10:00');
        $this->createBookings($funeral, $funeralAtTen, 1, 1);

        $this->availabilityFor('wedding', $date)
            ->assertJsonPath('0.remaining', 0)
            ->assertJsonPath('0.status', 'full');
    }

    private function services(): array
    {
        return collect(['baptism', 'wedding', 'funeral'])
            ->map(fn (string $code) => Service::create([
                'code' => $code,
                'name' => ucfirst($code),
                'description' => ucfirst($code),
            ]))
            ->all();
    }

    private function slot(Service $service, $date, string $startTime): BookingSlot
    {
        $hour = (int) substr($startTime, 0, 2);

        return BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => $date->toDateString(),
            'start_time' => $startTime,
            'end_time' => sprintf('%02d:00', $hour + 1),
            'capacity' => $service->code === 'baptism' ? null : 1,
        ]);
    }

    private function slotsFor(string $service, $date)
    {
        return $this->getJson('/api/booking-slots?service='.$service.'&date='.$date->toDateString());
    }

    private function availabilityFor(string $service, $date)
    {
        return $this->getJson('/api/booking-slots?service='.$service.'&month='.$date->format('Y-m'));
    }

    private function createBookings(Service $service, BookingSlot $slot, int $count, int $offset = 0): void
    {
        for ($index = 1; $index <= $count; $index++) {
            Booking::create([
                'booking_reference' => strtoupper(substr($service->code, 0, 3)).'-AVAIL-'.($index + $offset),
                'user_id' => User::factory()->create()->id,
                'service_id' => $service->id,
                'booking_slot_id' => $slot->id,
            ]);
        }
    }

    private function assertNotBookable(BookingSlot $slot, string $serviceCode): void
    {
        try {
            app(BookingSlotAvailabilityService::class)->lockBookable($slot->id, $serviceCode);
            $this->fail('The single-booking service should reject another booking.');
        } catch (ValidationException) {
            $this->addToAssertionCount(1);
        }
    }
}
