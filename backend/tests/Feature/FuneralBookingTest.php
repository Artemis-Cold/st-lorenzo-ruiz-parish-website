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

    public function test_funeral_can_be_submitted_without_a_spouse_and_with_valid_files(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
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
            'documents' => [
                ['document_type' => 'death_certificate', 'file' => UploadedFile::fake()->create('death.pdf', 500, 'application/pdf')],
                ['document_type' => 'biography', 'file' => UploadedFile::fake()->create('biography.pdf', 500, 'application/pdf')],
            ],
            'remarks' => '',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('funeral_deceased', [
            'first_name' => 'Juan', 'age' => 80,
            'spouse_first_name' => null, 'spouse_last_name' => null,
        ]);
        $this->assertDatabaseCount('booking_documents', 2);

        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $this->getJson('/api/staff/bookings')
            ->assertOk()
            ->assertJsonPath(
                'data.0.details.serviceData.deceased.characteristics',
                'A devoted parishioner.'
            )
            ->assertJsonPath(
                'data.0.details.serviceData.deceased.churchLife.attendsMass',
                'regular'
            );
    }
}
