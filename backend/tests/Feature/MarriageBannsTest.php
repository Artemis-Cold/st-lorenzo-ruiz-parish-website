<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MarriageBannsTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_publish_only_an_eligible_wedding_during_a_controlled_period(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $parishioner = User::factory()->create();
        $service = Service::create([
            'code' => 'wedding',
            'name' => 'Wedding',
            'description' => 'Wedding',
        ]);
        $slot = BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => today()->addDays(20)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 1,
            'is_active' => true,
        ]);
        $booking = Booking::create([
            'booking_reference' => 'WED-BANNS-001',
            'user_id' => $parishioner->id,
            'service_id' => $service->id,
            'booking_slot_id' => $slot->id,
            'status' => 'approved',
        ]);

        foreach ([
            ['groom', 'Juan', 'Dela Cruz'],
            ['bride', 'Maria', 'Santos'],
        ] as [$role, $firstName, $lastName]) {
            $booking->weddingApplicants()->create([
                'role' => $role,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'address' => 'Dagatan, Taysan, Batangas',
                'age' => 28,
                'contact_number' => '09171234567',
                'baptized_in' => 'St. Lorenzo Ruiz Parish',
                'confirmed_in' => 'St. Lorenzo Ruiz Parish',
                'father_first_name' => 'Father',
                'father_last_name' => $lastName,
                'mother_first_name' => 'Mother',
                'mother_last_name' => $lastName,
                'church_name' => 'None',
                'priest' => 'None',
                'church_address' => 'None',
            ]);
        }

        foreach ([
            'marriage_license', 'cenomar', 'baptismal_certificate',
            'confirmation_certificate', 'couple_photo',
            'sponsor_marriage_contract',
        ] as $type) {
            BookingDocument::create([
                'booking_id' => $booking->id,
                'document_type' => $type,
                'file_name' => $type === 'couple_photo' ? 'couple.jpg' : $type.'.pdf',
                'file_path' => $type === 'couple_photo'
                    ? 'booking-documents/couple.jpg'
                    : 'booking-documents/'.$type.'.pdf',
            ]);
        }
        BookingDocument::create([
            'booking_id' => $booking->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'receipt.jpg',
            'file_path' => 'booking-documents/receipt.jpg',
            'status' => 'approved',
        ]);

        Sanctum::actingAs($staff);
        $this->postJson("/api/staff/bookings/{$booking->id}/marriage-banns", [
            'publicationStart' => today()->toDateString(),
            'publicationEnd' => today()->addDays(7)->toDateString(),
        ])->assertCreated()
            ->assertJsonPath('data.publicationStart', today()->toDateString())
            ->assertJsonPath('data.publicationEnd', today()->addDays(7)->toDateString());

        $this->getJson('/api/marriage-banns')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.groomName', 'Juan Dela Cruz')
            ->assertJsonPath('data.0.brideName', 'Maria Santos')
            ->assertJsonCount(1, 'data.0.photos')
            ->assertJsonPath(
                'data.0.photos.0.url',
                Storage::disk('public')->url('booking-documents/couple.jpg')
            )
            ->assertJsonPath('data.0.weddingDate', today()->addDays(20)->toDateString())
            ->assertJsonPath('data.0.weddingTime', '09:00');

        $this->travel(8)->days();
        $this->getJson('/api/marriage-banns')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_staff_cannot_publish_banns_with_incomplete_requirements(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $parishioner = User::factory()->create();
        $service = Service::create([
            'code' => 'wedding',
            'name' => 'Wedding',
            'description' => 'Wedding',
        ]);
        $slot = BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => today()->addDays(20)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 1,
            'is_active' => true,
        ]);
        $booking = Booking::create([
            'booking_reference' => 'WED-BANNS-INCOMPLETE',
            'user_id' => $parishioner->id,
            'service_id' => $service->id,
            'booking_slot_id' => $slot->id,
            'status' => 'approved',
        ]);
        BookingDocument::create([
            'booking_id' => $booking->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'receipt.jpg',
            'file_path' => 'booking-documents/receipt.jpg',
            'status' => 'approved',
        ]);

        Sanctum::actingAs($staff);
        $this->postJson("/api/staff/bookings/{$booking->id}/marriage-banns", [
            'publicationStart' => today()->toDateString(),
            'publicationEnd' => today()->addDays(7)->toDateString(),
        ])->assertUnprocessable()->assertJsonValidationErrors('booking');
    }
}
