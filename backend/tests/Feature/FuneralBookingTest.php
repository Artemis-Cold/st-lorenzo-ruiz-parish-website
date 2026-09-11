<?php

namespace Tests\Feature;

use App\Models\BookingDocument;
use App\Models\BookingSlot;
use App\Models\FuneralDeceased;
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
        $parishioner = User::factory()->create([
            'first_name' => 'John',
            'middle_initial' => 'D',
            'last_name' => 'Doe',
            'phone' => '09171234567',
        ]);
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
                    'relationship' => 'Daughter',
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
            'informant_first_name' => 'John',
            'informant_middle_initial' => 'D',
            'informant_last_name' => 'Doe',
            'informant_relationship' => 'Daughter',
            'informant_contact_number' => '09171234567',
        ]);
        $this->assertSame(
            today()->toDateString(),
            FuneralDeceased::where('booking_id', $bookingId)
                ->firstOrFail()
                ->information_date
                ->toDateString()
        );
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

        $deathCertificate = BookingDocument::query()
            ->where('booking_id', $bookingId)
            ->where('document_type', 'death_certificate')
            ->firstOrFail();

        Sanctum::actingAs($staff);
        $this->postJson("/api/staff/bookings/{$bookingId}/requirements/resubmit", [
            'document_key' => "document:{$deathCertificate->id}",
            'reason' => 'The certificate image is blurred and cannot be verified.',
        ])->assertOk()
            ->assertJsonCount(1, 'data.details.missingRequirements')
            ->assertJsonPath('data.details.documents.0.status', 'rejected');

        $this->assertDatabaseHas('booking_documents', [
            'id' => $deathCertificate->id,
            'status' => 'rejected',
            'remarks' => 'The certificate image is blurred and cannot be verified.',
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $bookingId,
            'category' => 'booking_requirement_resubmission',
        ]);

        Sanctum::actingAs($parishioner);
        $this->getJson("/api/bookings/{$bookingId}")
            ->assertOk()
            ->assertJsonCount(1, 'data.missingRequirements')
            ->assertJsonPath('data.documents.0.status', 'rejected')
            ->assertJsonPath(
                'data.documents.0.remarks',
                'The certificate image is blurred and cannot be verified.'
            );

        $this->post("/api/bookings/{$bookingId}/documents", [
            'document_type' => 'death_certificate',
            'file' => UploadedFile::fake()->create('clear-death.pdf', 500, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonCount(0, 'data.missingRequirements');

        $this->assertDatabaseHas('booking_documents', [
            'id' => $deathCertificate->id,
            'file_name' => 'clear-death.pdf',
            'status' => 'pending',
            'remarks' => null,
        ]);

        $this->post("/api/bookings/{$bookingId}/payment", [
            'reference_number' => '6000000000001',
            'receipt' => UploadedFile::fake()->image('gcash-receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_verification');

        Sanctum::actingAs($staff);
        $receiptId = $this->getJson('/api/staff/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'Funeral')
            ->json('data.0.id');
        $this->patchJson("/api/staff/transactions/{$receiptId}/status", [
            'status' => 'confirmed',
        ])->assertOk()->assertJsonPath('data.status', 'confirmed');

        $this->patchJson("/api/staff/bookings/{$bookingId}/status", ['status' => 'approved'])
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');
    }
}
