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

class BaptismBookingAgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_baptizand_age_is_calculated_from_birth_date(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create();
        Sanctum::actingAs($parishioner);

        $service = Service::create([
            'code' => 'baptism',
            'name' => 'Baptism',
            'description' => 'Baptism',
        ]);
        $package = ServicePackage::create([
            'service_id' => $service->id,
            'name' => 'Standard',
            'base_price' => 1000,
        ]);
        $slot = BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => today()->addWeek()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 1,
            'is_active' => true,
        ]);

        $response = $this->post('/api/bookings/baptism', [
            'booking_slot_id' => $slot->id,
            'service_package_id' => $package->id,
            'baptizand' => [
                'first_name' => 'John',
                'middle_initial' => '',
                'last_name' => 'Doe',
                'birth_date' => today()->subYears(8)->toDateString(),
                'birth_place' => 'Taysan, Batangas',
                'gender' => 'Male',
                'address' => 'Taysan, Batangas',
                'contact_number' => '09171234567',
            ],
            'parents' => [
                [
                    'relationship' => 'father',
                    'first_name' => 'Juan',
                    'middle_initial' => '',
                    'last_name' => 'Doe',
                    'birth_place' => 'Taysan, Batangas',
                ],
                [
                    'relationship' => 'mother',
                    'first_name' => 'Maria',
                    'middle_initial' => '',
                    'last_name' => 'Doe',
                    'birth_place' => 'Taysan, Batangas',
                ],
            ],
            'god_parents' => [
                [
                    'role' => 'godfather',
                    'first_name' => 'Pedro',
                    'middle_initial' => '',
                    'last_name' => 'Santos',
                    'residence' => 'Batangas',
                    'requirement_type' => 'marriage_contract',
                    'requirement_file' => UploadedFile::fake()
                        ->create('pedro-marriage.pdf', 100, 'application/pdf'),
                ],
                [
                    'role' => 'godmother',
                    'first_name' => 'Ana',
                    'middle_initial' => '',
                    'last_name' => 'Reyes',
                    'residence' => 'Batangas',
                    'requirement_type' => 'confirmation_certificate',
                    'requirement_file' => UploadedFile::fake()
                        ->create('ana-confirmation.pdf', 100, 'application/pdf'),
                ],
            ],
            'documents' => [
                [
                    'document_type' => 'birth_certificate',
                    'file' => UploadedFile::fake()
                        ->create('birth-certificate.pdf', 100, 'application/pdf'),
                ],
                [
                    'document_type' => 'no_record_certificate',
                    'file' => UploadedFile::fake()
                        ->create('no-record-certificate.pdf', 100, 'application/pdf'),
                ],
            ],
            'remarks' => '',
        ]);

        $response->assertCreated();
        $bookingId = $response->json('data.id');
        $this->assertDatabaseHas('baptizands', [
            'first_name' => 'John',
            'age' => 8,
        ]);
        $this->assertDatabaseHas('god_parents', [
            'role' => 'godfather',
            'first_name' => 'Pedro',
            'requirement_type' => 'marriage_contract',
            'requirement_file_name' => 'pedro-marriage.pdf',
        ]);
        $this->assertDatabaseHas('god_parents', [
            'role' => 'godmother',
            'first_name' => 'Ana',
            'requirement_type' => 'confirmation_certificate',
            'requirement_file_name' => 'ana-confirmation.pdf',
        ]);

        $documents = collect(
            $this->getJson("/api/bookings/{$bookingId}")
                ->assertOk()
                ->json('data.documents')
        );
        $this->assertSame(
            ['godparent_1_marriage_contract', 'godparent_2_confirmation_certificate'],
            $documents
                ->filter(fn (array $document) => str_starts_with($document['type'], 'godparent_'))
                ->pluck('type')
                ->values()
                ->all()
        );

        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $staffDocuments = collect(
            $this->getJson('/api/staff/bookings')
                ->assertOk()
                ->json('data.0.details.documents')
        );
        $firstGodParentDocument = $staffDocuments->firstWhere(
            'type',
            'godparent_1_marriage_contract'
        );

        $this->postJson("/api/staff/bookings/{$bookingId}/requirements/resubmit", [
            'document_key' => $firstGodParentDocument['reviewKey'],
            'reason' => 'The submitted godparent certificate cannot be verified.',
        ])->assertOk()
            ->assertJsonCount(1, 'data.details.missingRequirements');

        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $bookingId,
            'category' => 'booking_requirement_resubmission',
        ]);

        Sanctum::actingAs($parishioner);
        $missingRequirement = $this->getJson("/api/bookings/{$bookingId}")
            ->assertOk()
            ->assertJsonCount(1, 'data.missingRequirements')
            ->json('data.missingRequirements.0');

        $this->post("/api/bookings/{$bookingId}/documents", [
            'document_type' => $missingRequirement['types'][0],
            'file' => UploadedFile::fake()->create('valid-godparent-certificate.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonCount(0, 'data.missingRequirements');
    }
}
