<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use App\Services\BookingSlotScheduleService;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_configured_weekday_and_sunday_schedules_are_exact(): void
    {
        $schedule = app(BookingSlotScheduleService::class);
        $monday = today()->next(CarbonInterface::MONDAY);
        $sunday = today()->next(CarbonInterface::SUNDAY);

        $this->assertSame(
            ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00'],
            $schedule->startTimesFor($monday),
        );
        $this->assertSame(
            ['11:00', '13:00', '14:00', '15:00'],
            $schedule->startTimesFor($sunday),
        );
        $this->assertSame('12:00', $schedule->endTimeFor('11:00'));
        $this->assertNull($schedule->capacityFor('baptism'));
        $this->assertSame(1, $schedule->capacityFor('wedding'));
        $this->assertSame(1, $schedule->capacityFor('funeral'));
    }

    public function test_staff_opens_fixed_shared_schedules_for_an_entire_month(): void
    {
        $this->actingAsStaff();
        $services = $this->services();
        $month = today()->addMonth()->startOfMonth();
        $monday = $month->copy()->next(CarbonInterface::MONDAY)->toDateString();
        $sunday = $month->copy()->next(CarbonInterface::SUNDAY)->toDateString();
        $expectedSharedSlots = $this->expectedSharedSlotCount($month);

        $this->postJson('/api/staff/availability', [
            'month' => $month->format('Y-m'),
        ])->assertCreated()
            ->assertJsonPath('datesOpened', $month->daysInMonth)
            ->assertJsonPath('recordsCreated', $expectedSharedSlots * 3);

        $this->assertSame($expectedSharedSlots * 3, BookingSlot::count());
        $this->assertSame(21, BookingSlot::whereDate('booking_date', $monday)->count());
        $this->assertSame(12, BookingSlot::whereDate('booking_date', $sunday)->count());
        $this->assertSame(0, BookingSlot::whereDate('booking_date', $sunday)->where('start_time', '08:00')->count());

        $this->assertNull(BookingSlot::query()
            ->where('service_id', $services['baptism']->id)
            ->whereDate('booking_date', $monday)
            ->where('start_time', '08:00')
            ->firstOrFail()
            ->capacity);
        $this->assertSame(1, BookingSlot::query()
            ->where('service_id', $services['wedding']->id)
            ->whereDate('booking_date', $monday)
            ->where('start_time', '08:00')
            ->firstOrFail()
            ->capacity);

        $this->getJson('/api/staff/availability?month='.$month->format('Y-m'))
            ->assertOk()
            ->assertJsonCount($expectedSharedSlots, 'data')
            ->assertJsonFragment([
                'date' => $monday,
                'startTime' => '08:00',
                'lockedByService' => null,
            ]);
    }

    public function test_adding_a_month_is_idempotent_and_shared_slots_are_managed_together(): void
    {
        $this->actingAsStaff();
        $services = $this->services();
        $month = today()->addMonth()->startOfMonth();
        $date = $month->copy()->next(CarbonInterface::MONDAY)->toDateString();
        $payload = ['month' => $month->format('Y-m')];

        $this->postJson('/api/staff/availability', $payload)->assertCreated();
        $slotCount = BookingSlot::count();

        $this->postJson('/api/staff/availability', $payload)
            ->assertOk()
            ->assertJsonPath('datesOpened', 0)
            ->assertJsonPath('recordsCreated', 0)
            ->assertJsonPath('message', 'The booking schedule for this month already exists.');
        $this->assertSame($slotCount, BookingSlot::count());

        $representative = BookingSlot::query()
            ->whereDate('booking_date', $date)
            ->where('start_time', '08:00')
            ->firstOrFail();

        $this->patchJson("/api/staff/availability/{$representative->id}", [
            'isActive' => false,
        ])->assertOk();

        $this->assertSame(3, BookingSlot::whereDate('booking_date', $date)->where('start_time', '08:00')->where('is_active', false)->count());

        $this->postJson('/api/staff/availability', $payload)
            ->assertOk()
            ->assertJsonPath('recordsCreated', 0);
        $this->assertSame(3, BookingSlot::whereDate('booking_date', $date)->where('start_time', '08:00')->where('is_active', false)->count());

        $baptismSlot = BookingSlot::query()
            ->where('service_id', $services['baptism']->id)
            ->whereDate('booking_date', $date)
            ->where('start_time', '09:00')
            ->firstOrFail();

        Booking::create([
            'booking_reference' => 'BAP-SHARED-001',
            'user_id' => User::factory()->create()->id,
            'service_id' => $services['baptism']->id,
            'booking_slot_id' => $baptismSlot->id,
            'status' => 'pending',
        ]);

        $this->getJson('/api/staff/availability?month='.$month->format('Y-m'))
            ->assertJsonFragment([
                'date' => $date,
                'startTime' => '09:00',
                'booked' => 1,
                'lockedByService' => 'Baptism',
            ]);

        $this->deleteJson("/api/staff/availability/{$baptismSlot->id}")
            ->assertUnprocessable();

        $this->deleteJson("/api/staff/availability/{$representative->id}")
            ->assertOk();
        $this->assertSame(0, BookingSlot::whereDate('booking_date', $date)->where('start_time', '08:00')->count());
    }

    public function test_staff_must_select_a_current_or_future_month(): void
    {
        $this->actingAsStaff();
        $this->services();

        $this->postJson('/api/staff/availability', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('month');

        $this->postJson('/api/staff/availability', [
            'month' => today()->subMonth()->format('Y-m'),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('month');
    }

    public function test_current_month_generation_skips_past_and_current_dates(): void
    {
        $this->actingAsStaff();
        $this->services();

        $this->postJson('/api/staff/availability', [
            'month' => today()->format('Y-m'),
        ])->assertCreated();

        $this->assertFalse(BookingSlot::query()
            ->whereDate('booking_date', today()->subDay())
            ->exists());
        $this->assertFalse(BookingSlot::query()
            ->whereDate('booking_date', today())
            ->exists());
        $this->assertTrue(BookingSlot::query()
            ->whereDate('booking_date', today()->addDay())
            ->exists());
    }

    private function actingAsStaff(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
    }

    /** @return Collection<string, Service> */
    private function services()
    {
        return collect(['baptism', 'funeral', 'wedding'])->mapWithKeys(fn ($code) => [
            $code => Service::create(['code' => $code, 'name' => ucfirst($code), 'description' => $code]),
        ]);
    }

    private function expectedSharedSlotCount($month): int
    {
        $count = 0;
        $date = $month->copy()->startOfMonth();

        while ($date->month === $month->month) {
            $count += $date->isSunday() ? 4 : 7;
            $date->addDay();
        }

        return $count;
    }
}
