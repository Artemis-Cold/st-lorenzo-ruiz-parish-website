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
        Sanctum::actingAs(User::factory()->create());

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
            'god_parents' => [[
                'god_father' => [
                    'first_name' => 'Pedro',
                    'middle_initial' => '',
                    'last_name' => 'Santos',
                    'residence' => 'Batangas',
                ],
                'god_mother' => [
                    'first_name' => 'Ana',
                    'middle_initial' => '',
                    'last_name' => 'Reyes',
                    'residence' => 'Batangas',
                ],
                'requirements' => [
                    'confirmation_certificate' => UploadedFile::fake()
                        ->create('confirmation.pdf', 100, 'application/pdf'),
                ],
            ]],
            'documents' => [[
                'document_type' => 'birth_certificate',
                'file' => UploadedFile::fake()
                    ->create('birth-certificate.pdf', 100, 'application/pdf'),
            ]],
            'remarks' => '',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('baptizands', [
            'first_name' => 'John',
            'age' => 8,
        ]);
    }
}
