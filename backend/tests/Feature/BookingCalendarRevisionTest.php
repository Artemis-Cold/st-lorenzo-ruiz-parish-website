<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingCalendarRevisionTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_includes_assigned_ceremony_dates_and_keeps_other_users_private(): void
    {
        $owner = User::factory()->create();
        $staff = User::factory()->create(['role' => 'staff']);
        $service = Service::firstOrCreate(['code' => 'confirmation'], ['name' => 'Confirmation', 'description' => 'Confirmation']);
        $booking = Booking::create(['user_id' => $owner->id, 'service_id' => $service->id, 'booking_reference' => 'CAL-1', 'status' => 'pending']);
        $booking->appointments()->create(['venue' => '', 'type' => 'sacrament', 'scheduled_at' => '2026-11-05 09:00:00', 'created_by' => $staff->id]);
        $booking->appointments()->where('type', 'sacrament')->update(['scheduled_at' => '2026-11-06 10:00:00']);
        Sanctum::actingAs($owner);
        $this->getJson('/api/profile')->assertOk()->assertJsonPath('current_bookings.0.booking_date', '2026-11-06')->assertJsonPath('current_bookings.0.start_time', '10:00');
        $booking->update(['status' => 'completed']);
        $this->getJson('/api/profile')->assertOk()->assertJsonCount(0, 'current_bookings')->assertJsonPath('recent_bookings.0.booking_date', '2026-11-06');
        Sanctum::actingAs(User::factory()->create());
        $this->getJson('/api/profile')->assertOk()->assertJsonCount(0, 'current_bookings')->assertJsonCount(0, 'recent_bookings');
    }

    public function test_dashboard_separates_submission_date_from_ceremony_date(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $service = Service::firstOrCreate(['code' => 'confirmation'], ['name' => 'Confirmation', 'description' => 'Confirmation']);
        $booking = Booking::create(['user_id' => User::factory()->create()->id, 'service_id' => $service->id, 'booking_reference' => 'CAL-2', 'status' => 'pending', 'schedule_status' => 'confirmed']);
        $booking->forceFill(['created_at' => now()->subDay()])->save();
        $booking->appointments()->create(['venue' => '', 'type' => 'sacrament', 'scheduled_at' => now(), 'created_by' => $staff->id]);
        Sanctum::actingAs($staff);
        $this->getJson('/api/staff/dashboard')->assertOk()->assertJsonPath('data.stats.bookingsToday', 0)->assertJsonPath('data.stats.scheduledToday', 1)->assertJsonCount(0, 'data.newBookings');
    }
}
