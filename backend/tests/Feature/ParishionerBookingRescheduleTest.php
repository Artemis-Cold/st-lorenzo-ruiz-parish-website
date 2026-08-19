<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ParishionerBookingRescheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_reschedule_an_approved_sacrament_booking(): void
    {
        $user = User::factory()->create();
        $staff = User::factory()->create(['role' => 'staff']);
        $service = $this->service('wedding');
        $originalSlot = $this->slot($service, 7, '09:00', '10:00');
        $newSlot = $this->slot($service, 14, '11:00', '12:00');
        $booking = $this->booking($user, $service, $originalSlot, [
            'status' => 'approved',
            'processed_by' => $staff->id,
            'processed_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/bookings/{$booking->id}/reschedule", [
            'booking_slot_id' => $newSlot->id,
        ])->assertOk()
            ->assertJsonPath('data.bookingSlotId', $newSlot->id)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.schedule.date', $newSlot->booking_date->toDateString());

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'booking_slot_id' => $newSlot->id,
            'status' => 'pending',
            'processed_by' => null,
            'processed_at' => null,
        ]);
    }

    public function test_reschedule_rejects_another_service_and_unavailable_slot(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $baptism = $this->service('baptism');
        $funeral = $this->service('funeral');
        $originalSlot = $this->slot($baptism, 7, '09:00', '10:00');
        $booking = $this->booking($user, $baptism, $originalSlot);
        $otherServiceSlot = $this->slot($funeral, 8, '09:00', '10:00');
        $lockedBaptismSlot = $this->slot($baptism, 9, '09:00', '10:00');
        $lockingFuneralSlot = $this->slot($funeral, 9, '09:00', '10:00');
        $this->booking($otherUser, $funeral, $lockingFuneralSlot);

        Sanctum::actingAs($user);

        $this->patchJson("/api/bookings/{$booking->id}/reschedule", [
            'booking_slot_id' => $otherServiceSlot->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('booking_slot_id');

        $this->patchJson("/api/bookings/{$booking->id}/reschedule", [
            'booking_slot_id' => $lockedBaptismSlot->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('booking_slot_id');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'booking_slot_id' => $originalSlot->id,
        ]);
    }

    public function test_parishioner_cannot_reschedule_another_users_booking(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $service = $this->service('funeral');
        $booking = $this->booking($owner, $service, $this->slot($service, 7, '09:00', '10:00'));
        $newSlot = $this->slot($service, 8, '11:00', '12:00');

        Sanctum::actingAs($otherUser);

        $this->patchJson("/api/bookings/{$booking->id}/reschedule", [
            'booking_slot_id' => $newSlot->id,
        ])->assertNotFound();
    }

    private function service(string $code): Service
    {
        return Service::create([
            'code' => $code,
            'name' => ucfirst($code),
            'description' => ucfirst($code),
            'is_active' => true,
        ]);
    }

    private function slot(
        Service $service,
        int $daysFromNow,
        string $startTime,
        string $endTime
    ): BookingSlot {
        return BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => today()->addDays($daysFromNow)->toDateString(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'capacity' => 1,
            'is_active' => true,
        ]);
    }

    private function booking(
        User $user,
        Service $service,
        BookingSlot $slot,
        array $overrides = []
    ): Booking {
        return Booking::create([
            'booking_reference' => strtoupper($service->code).'-'.fake()->unique()->numerify('####'),
            'user_id' => $user->id,
            'service_id' => $service->id,
            'booking_slot_id' => $slot->id,
            'status' => 'pending',
            ...$overrides,
        ]);
    }
}
