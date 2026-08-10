<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\DocumentRequestBooking;
use App\Models\DocumentRequestItem;
use App\Models\MassIntention;
use App\Models\MassIntentionEntry;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ParishionerBookingDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_parishioner_can_view_mass_intention_details(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $booking = $this->booking($user, 'mass-intention');
        $intention = MassIntention::create([
            'booking_id' => $booking->id,
            'intention_date' => '2026-08-20',
            'payment_reference' => 'GCASH-123',
            'total_amount' => 100,
        ]);
        MassIntentionEntry::create([
            'mass_intention_id' => $intention->id,
            'intention_type' => 'Thanksgiving',
            'names' => ['Juan Dela Cruz'],
            'amount' => 100,
        ]);

        $this->getJson("/api/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonPath('data.serviceCode', 'mass-intention')
            ->assertJsonPath('data.sections.0.title', 'Mass intention details')
            ->assertJsonPath('data.sections.0.fields.1.value', 'GCASH-123')
            ->assertJsonPath('data.sections.0.fields.3.value', 'Thanksgiving: Juan Dela Cruz');
    }

    public function test_parishioner_can_view_all_documents_in_one_request(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $booking = $this->booking($user, 'document-request');
        $request = DocumentRequestBooking::create([
            'booking_id' => $booking->id,
            'payment_reference' => 'DOC-PAY-1',
            'total_amount' => 200,
        ]);
        foreach (['Baptismal Certificate', 'Confirmation Certificate'] as $type) {
            DocumentRequestItem::create([
                'document_request_booking_id' => $request->id,
                'document_type' => $type,
                'details' => [],
                'price' => 100,
            ]);
        }

        $this->getJson("/api/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.sections.0.fields')
            ->assertJsonPath('data.sections.0.fields.0.label', 'Baptismal Certificate')
            ->assertJsonPath('data.sections.0.fields.1.label', 'Confirmation Certificate');
    }

    public function test_parishioner_cannot_view_another_users_booking(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $booking = $this->booking(User::factory()->create(), 'baptism');

        $this->getJson("/api/bookings/{$booking->id}")->assertNotFound();
    }

    private function booking(User $user, string $code): Booking
    {
        $service = Service::create([
            'code' => $code,
            'name' => str($code)->replace('-', ' ')->title(),
            'description' => $code,
            'is_active' => true,
        ]);

        return Booking::create([
            'booking_reference' => strtoupper($code).'-'.fake()->unique()->numerify('####'),
            'user_id' => $user->id,
            'service_id' => $service->id,
            'booking_slot_id' => null,
        ]);
    }
}
