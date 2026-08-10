<?php

namespace Tests\Feature;

use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_creates_availability_for_one_selected_service(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        foreach (['baptism', 'funeral', 'wedding'] as $code) {
            Service::create(['code' => $code, 'name' => ucfirst($code), 'description' => $code]);
        }

        $this->postJson('/api/staff/availability', [
            'serviceCode' => 'baptism',
            'date' => now()->addWeek()->toDateString(),
            'startTime' => '09:00',
            'endTime' => '10:00',
            'capacity' => 3,
        ])->assertCreated()->assertJsonPath('data.serviceCode', 'baptism');

        $this->assertDatabaseHas('booking_slots', ['capacity' => 3]);
        $this->assertSame(1, BookingSlot::count());
        $this->assertDatabaseMissing('booking_slots', ['service_id' => Service::where('code', 'funeral')->value('id')]);
    }

    public function test_staff_cannot_create_duplicate_or_overlapping_slots_across_services(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $services = collect(['baptism', 'funeral', 'wedding'])->mapWithKeys(fn ($code) => [
            $code => Service::create(['code' => $code, 'name' => ucfirst($code), 'description' => $code]),
        ]);
        $date = now()->addWeek()->toDateString();
        BookingSlot::create([
            'service_id' => $services['baptism']->id,
            'booking_date' => $date,
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 2,
        ]);

        foreach ([['09:00', '10:00'], ['09:30', '10:30'], ['08:30', '09:30']] as [$start, $end]) {
            $this->postJson('/api/staff/availability', [
                'serviceCode' => 'funeral',
                'date' => $date,
                'startTime' => $start,
                'endTime' => $end,
                'capacity' => 1,
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['startTime', 'endTime']);
        }

        $this->postJson('/api/staff/availability', [
            'serviceCode' => 'wedding',
            'date' => $date,
            'startTime' => '10:00',
            'endTime' => '11:00',
            'capacity' => 1,
        ])->assertCreated();

        $this->assertSame(2, BookingSlot::count());
    }
}
