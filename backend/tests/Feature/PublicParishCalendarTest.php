<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicParishCalendarTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_calendar_returns_privacy_safe_booked_service_aggregates(): void
    {
        $date = today()->addWeek();
        $user = User::factory()->create();
        $baptism = $this->service('baptism');
        $wedding = $this->service('wedding');
        $funeral = $this->service('funeral');
        $baptismSlot = $this->slot($baptism, $date, '09:00');
        $weddingSlot = $this->slot($wedding, $date, '14:00');
        $funeralSlot = $this->slot($funeral, $date, '15:00');

        $this->booking($user, $baptism, $baptismSlot, 'BAP-PUBLIC-1');
        $this->booking($user, $baptism, $baptismSlot, 'BAP-PUBLIC-2');
        $weddingBooking = $this->booking($user, $wedding, $weddingSlot, 'WED-PUBLIC-1');
        $this->weddingApplicant($weddingBooking, 'groom', 'Dela Cruz');
        $this->weddingApplicant($weddingBooking, 'bride', 'Santos');
        $this->booking($user, $funeral, $funeralSlot, 'FUN-PUBLIC-1');
        $cancelled = $this->booking($user, $wedding, $weddingSlot, 'WED-CANCELLED');
        $cancelled->update(['status' => 'cancelled']);

        $response = $this->getJson('/api/parish-calendar/bookings?month='.$date->format('Y-m'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.date', $date->toDateString())
            ->assertJsonPath('data.0.services.0.serviceCode', 'baptism')
            ->assertJsonPath('data.0.services.0.startTime', '09:00')
            ->assertJsonPath('data.0.services.0.count', 2)
            ->assertJsonPath('data.0.services.1.serviceCode', 'wedding')
            ->assertJsonPath('data.0.services.1.displayName', 'Dela Cruz & Santos Wedding')
            ->assertJsonPath('data.0.services.1.startTime', '14:00')
            ->assertJsonPath('data.0.services.1.count', 1)
            ->assertJsonPath('data.0.services.2.serviceCode', 'funeral')
            ->assertJsonPath('data.0.services.2.displayName', 'Funeral Service');

        $payload = $response->json();
        $this->assertArrayNotHasKey('booking_reference', $payload['data'][0]['services'][0]);
        $this->assertStringNotContainsString($user->phone, json_encode($payload));
        $this->assertStringNotContainsString($user->full_name, json_encode($payload));
    }

    public function test_public_calendar_requires_a_valid_month(): void
    {
        $this->getJson('/api/parish-calendar/bookings')->assertUnprocessable();
        $this->getJson('/api/parish-calendar/bookings?month=August')->assertUnprocessable();
    }

    private function service(string $code): Service
    {
        return Service::create([
            'code' => $code,
            'name' => ucfirst($code),
            'description' => ucfirst($code),
        ]);
    }

    private function slot(Service $service, $date, string $startTime): BookingSlot
    {
        $startHour = (int) substr($startTime, 0, 2);

        return BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => $date,
            'start_time' => $startTime,
            'end_time' => sprintf('%02d:00', $startHour + 1),
            'capacity' => $service->code === 'baptism' ? null : 1,
        ]);
    }

    private function booking(
        User $user,
        Service $service,
        BookingSlot $slot,
        string $reference,
    ): Booking {
        return Booking::create([
            'booking_reference' => $reference,
            'user_id' => $user->id,
            'service_id' => $service->id,
            'booking_slot_id' => $slot->id,
            'status' => 'pending',
        ]);
    }

    private function weddingApplicant(Booking $booking, string $role, string $lastName): void
    {
        $booking->weddingApplicants()->create([
            'role' => $role,
            'first_name' => ucfirst($role),
            'last_name' => $lastName,
            'address' => 'Taysan, Batangas',
            'age' => 28,
            'contact_number' => '09171234567',
            'baptized_in' => 'Parish Church',
            'confirmed_in' => 'Parish Church',
            'father_first_name' => 'Juan',
            'father_last_name' => $lastName,
            'mother_first_name' => 'Maria',
            'mother_last_name' => $lastName,
            'church_name' => 'None',
            'priest' => 'None',
            'church_address' => 'None',
        ]);
    }
}
