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

    public function test_staff_opens_fixed_shared_schedules_for_multiple_dates(): void
    {
        $this->actingAsStaff();
        $services = $this->services();
        $monday = today()->next(CarbonInterface::MONDAY)->toDateString();
        $sunday = today()->next(CarbonInterface::SUNDAY)->toDateString();

        $this->postJson('/api/staff/availability', [
            'dates' => [$monday, $sunday],
        ])->assertCreated()
            ->assertJsonPath('datesCreated', 2);

        $this->assertSame(33, BookingSlot::count());
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

        $this->getJson('/api/staff/availability')
            ->assertOk()
            ->assertJsonCount(11, 'data')
            ->assertJsonFragment([
                'date' => $monday,
                'startTime' => '08:00',
                'lockedByService' => null,
            ]);
    }

    public function test_adding_a_date_is_idempotent_and_shared_slots_are_managed_together(): void
    {
        $this->actingAsStaff();
        $services = $this->services();
        $date = today()->next(CarbonInterface::MONDAY)->toDateString();

        $this->postJson('/api/staff/availability', ['dates' => [$date]])->assertCreated();
        $this->postJson('/api/staff/availability', ['dates' => [$date]])
            ->assertOk()
            ->assertJsonPath('datesCreated', 0)
            ->assertJsonPath('datesRestored', 0)
            ->assertJsonPath('datesUnchanged', 1)
            ->assertJsonPath('message', '1 selected date was already open.');
        $this->assertSame(21, BookingSlot::count());

        $representative = BookingSlot::query()
            ->whereDate('booking_date', $date)
            ->where('start_time', '08:00')
            ->firstOrFail();

        $this->patchJson("/api/staff/availability/{$representative->id}", [
            'isActive' => false,
        ])->assertOk();

        $this->assertSame(3, BookingSlot::whereDate('booking_date', $date)->where('start_time', '08:00')->where('is_active', false)->count());

        $this->postJson('/api/staff/availability', ['dates' => [$date]])
            ->assertCreated()
            ->assertJsonPath('datesCreated', 0)
            ->assertJsonPath('datesRestored', 1)
            ->assertJsonPath('datesUnchanged', 0);
        $this->assertSame(3, BookingSlot::whereDate('booking_date', $date)->where('start_time', '08:00')->where('is_active', true)->count());

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

        $this->getJson('/api/staff/availability')
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

    public function test_staff_must_select_at_least_one_valid_date(): void
    {
        $this->actingAsStaff();
        $this->services();

        $this->postJson('/api/staff/availability', ['dates' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('dates');

        $this->postJson('/api/staff/availability', ['dates' => [today()->subDay()->toDateString()]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('dates.0');
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
}
