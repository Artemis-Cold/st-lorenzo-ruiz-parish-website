<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingSlotAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_calendar_reports_available_limited_and_full_using_remaining_capacity(): void
    {
        $service = Service::create([
            'code' => 'baptism',
            'name' => 'Baptism',
            'description' => 'Baptism',
        ]);
        $date = now()->addWeek()->startOfDay();
        $slot = BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => $date->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 5,
        ]);

        $this->availabilityFor($date)
            ->assertOk()
            ->assertJsonPath('0.status', 'available')
            ->assertJsonPath('0.remaining', 5);

        $this->createBookings($service, $slot, 3);

        $this->availabilityFor($date)
            ->assertOk()
            ->assertJsonPath('0.status', 'limited')
            ->assertJsonPath('0.remaining', 2);

        $this->createBookings($service, $slot, 2, 3);

        $this->availabilityFor($date)
            ->assertOk()
            ->assertJsonPath('0.status', 'full')
            ->assertJsonPath('0.remaining', 0);
    }

    private function availabilityFor($date)
    {
        return $this->getJson('/api/booking-slots?service=baptism&month='.$date->format('Y-m'));
    }

    private function createBookings(Service $service, BookingSlot $slot, int $count, int $offset = 0): void
    {
        for ($index = 1; $index <= $count; $index++) {
            Booking::create([
                'booking_reference' => 'BAP-AVAIL-'.($index + $offset),
                'user_id' => User::factory()->create()->id,
                'service_id' => $service->id,
                'booking_slot_id' => $slot->id,
            ]);
        }
    }
}
