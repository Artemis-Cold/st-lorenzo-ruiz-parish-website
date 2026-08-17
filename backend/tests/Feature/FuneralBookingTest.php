<?php

namespace Tests\Feature;

use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FuneralBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_incomplete_funeral_accepts_requirements_to_follow_and_blocks_approval_until_uploaded(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create();
        Sanctum::actingAs($parishioner);
        $service = Service::create(['code' => 'funeral', 'name' => 'Funeral', 'description' => 'Funeral']);
        $package = ServicePackage::create(['service_id' => $service->id, 'name' => 'Standard', 'base_price' => 1000]);
        $slot = BookingSlot::create([
            'service_id' => $service->id, 'booking_date' => now()->addWeek()->toDateString(),
            'start_time' => '09:00', 'end_time' => '10:00', 'capacity' => 1, 'is_active' => true,
        ]);

        $response = $this->post('/api/bookings/funeral', [
            'booking_slot_id' => $slot->id,
            'service_package_id' => $package->id,
            'deceased' => [
                'first_name' => 'Juan', 'middle_initial' => '', 'last_name' => 'Dela Cruz',
                'address' => 'Dagatan, Taysan', 'death_cause' => 'Natural causes',
                'birth_date' => today()->subYears(80)->toDateString(), 'has_spouse' => false,
                'father' => ['first_name' => 'Pedro', 'middle_initial' => '', 'last_name' => 'Dela Cruz'],
                'mother' => ['first_name' => 'Ana', 'middle_initial' => '', 'last_name' => 'Santos'],
                'spouse' => ['first_name' => '', 'middle_initial' => '', 'last_name' => ''],
                'children' => [],
                'sacraments' => ['baptized' => true, 'confirmed' => true, 'church_married' => false, 'anointed_of_the_sick' => true],
                'church_life' => ['attends_mass' => 'regular', 'confesses' => 'sometimes'],
                'characteristics' => 'A devoted parishioner.',
                'informant' => [
                    'first_name' => 'Maria', 'middle_initial' => '', 'last_name' => 'Dela Cruz',
                    'relationship' => 'Daughter', 'contact_number' => '09171234567',
                    'date_provided' => now()->toDateString(),
                ],
            ],
            'remarks' => '',
        ]);

        $response->assertCreated();
        $bookingId = $response->json('data.id');
        $this->assertDatabaseHas('bookings', ['id' => $bookingId, 'status' => 'pending']);
        $this->assertDatabaseHas('funeral_deceased', [
            'first_name' => 'Juan', 'age' => 80,
            'spouse_first_name' => null, 'spouse_last_name' => null,
        ]);
        $this->assertDatabaseCount('booking_documents', 0);
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $bookingId,
            'category' => 'booking_requirements',
        ]);

        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);
        $this->getJson('/api/staff/bookings')
            ->assertOk()
            ->assertJsonCount(2, 'data.0.details.missingRequirements')
            ->assertJsonPath(
                'data.0.details.serviceData.deceased.characteristics',
                'A devoted parishioner.'
            )
            ->assertJsonPath(
                'data.0.details.serviceData.deceased.churchLife.attendsMass',
                'regular'
            );

        $this->patchJson("/api/staff/bookings/{$bookingId}/status", ['status' => 'approved'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('documents');

        $this->postJson("/api/staff/bookings/{$bookingId}/requirements/remind")
            ->assertOk()
            ->assertJsonPath('message', 'The missing-requirements SMS reminder has been queued.');
        $this->assertDatabaseCount('sms_messages', 2);

        Sanctum::actingAs($parishioner);
        $this->post("/api/bookings/{$bookingId}/documents", [
            'document_type' => 'death_certificate',
            'file' => UploadedFile::fake()->create('death.pdf', 500, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonCount(1, 'data.missingRequirements');
        $this->post("/api/bookings/{$bookingId}/documents", [
            'document_type' => 'biography',
            'file' => UploadedFile::fake()->create('biography.pdf', 500, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonCount(0, 'data.missingRequirements');

        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $bookingId,
            'category' => 'booking_requirements_complete',
        ]);

        Sanctum::actingAs($staff);
        $this->patchJson("/api/staff/bookings/{$bookingId}/status", ['status' => 'approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }
}
