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

class WeddingSponsorBookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_wedding_stores_three_image_photos_and_repeatable_sponsor_pairs(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create();
        Sanctum::actingAs($parishioner);

        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);

        $response = $this->post('/api/bookings/wedding', $payload)
            ->assertCreated();

        $bookingId = $response->json('data.id');

        $this->assertDatabaseCount('wedding_sponsor_pairs', 2);
        $this->assertDatabaseCount('wedding_sponsors', 4);
        $this->assertDatabaseHas('wedding_sponsors', [
            'role' => 'godfather',
            'first_name' => 'Pedro',
            'last_name' => 'Santos',
        ]);
        $this->assertDatabaseHas('wedding_sponsors', [
            'role' => 'godmother',
            'first_name' => 'Ana',
            'last_name' => 'Reyes',
        ]);
        foreach (['couple_photo_1', 'couple_photo_2', 'couple_photo_3'] as $type) {
            $this->assertDatabaseHas('booking_documents', ['document_type' => $type]);
        }

        $parishionerDocuments = collect(
            $this->getJson("/api/bookings/{$bookingId}")
                ->assertOk()
                ->json('data.documents')
        );

        $this->assertSame(
            ['sponsor_pair_1_confirmation_certificate', 'sponsor_pair_2_confirmation_certificate'],
            $parishionerDocuments
                ->filter(fn (array $document) => str_starts_with($document['type'], 'sponsor_pair_'))
                ->pluck('type')
                ->values()
                ->all()
        );

        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);
        $staffDocuments = collect(
            $this->getJson('/api/staff/bookings')
                ->assertOk()
                ->json('data.0.details.documents')
        );

        $this->assertSame(
            ['sponsor_pair_1_confirmation_certificate', 'sponsor_pair_2_confirmation_certificate'],
            $staffDocuments
                ->filter(fn (array $document) => str_starts_with($document['type'], 'sponsor_pair_'))
                ->pluck('type')
                ->values()
                ->all()
        );

        $firstSponsorDocument = $staffDocuments->firstWhere(
            'type',
            'sponsor_pair_1_confirmation_certificate'
        );

        $this->postJson("/api/staff/bookings/{$bookingId}/requirements/resubmit", [
            'document_key' => $firstSponsorDocument['reviewKey'],
            'reason' => 'The sponsor certificate is incomplete and cannot be verified.',
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
            'file' => UploadedFile::fake()->create('valid-sponsor-certificate.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonCount(0, 'data.missingRequirements');
    }

    public function test_wedding_couple_photo_rejects_pdf_files(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);
        $payload['documents'][4]['file'] = UploadedFile::fake()
            ->create('photo.pdf', 100, 'application/pdf');

        $this->post('/api/bookings/wedding', $payload)
            ->assertUnprocessable()
            ->assertInvalid('documents.4.file');
    }

    private function weddingSchedule(): array
    {
        $service = Service::create([
            'code' => 'wedding',
            'name' => 'Wedding',
            'description' => 'Wedding',
        ]);
        $package = ServicePackage::create([
            'service_id' => $service->id,
            'name' => 'Standard',
            'base_price' => 10000,
            'is_active' => true,
        ]);
        $slot = BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => today()->addWeek()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 1,
            'is_active' => true,
        ]);

        return [$slot, $package];
    }

    private function payload(int $slotId, int $packageId): array
    {
        $person = fn (string $first, string $last) => [
            'first_name' => $first,
            'middle_initial' => 'A',
            'last_name' => $last,
            'address' => 'Taysan, Batangas',
            'age' => 28,
            'contact_number' => '09171234567',
            'church' => [
                'baptized_in' => 'St. Lorenzo Ruiz Parish',
                'confirmed_in' => 'St. Lorenzo Ruiz Parish',
            ],
            'father' => ['first_name' => 'Juan', 'middle_initial' => 'B', 'last_name' => $last],
            'mother' => ['first_name' => 'Maria', 'middle_initial' => 'C', 'last_name' => $last],
            'previous_church_marriage' => [
                'church_name' => 'St. Lorenzo Ruiz Parish',
                'priest' => 'Rev. Parish Priest',
                'church_address' => 'Taysan, Batangas',
            ],
        ];

        $sponsorPair = fn (string $suffix) => [
            'god_father' => [
                'first_name' => 'Pedro'.$suffix,
                'middle_initial' => 'D',
                'last_name' => 'Santos',
                'residence' => 'Batangas',
            ],
            'god_mother' => [
                'first_name' => 'Ana'.$suffix,
                'middle_initial' => 'E',
                'last_name' => 'Reyes',
                'residence' => 'Batangas',
            ],
            'requirements' => [
                'confirmation_certificate' => UploadedFile::fake()
                    ->create('confirmation'.$suffix.'.pdf', 100, 'application/pdf'),
            ],
        ];

        return [
            'booking_slot_id' => $slotId,
            'service_package_id' => $packageId,
            'selected_addon_ids' => [],
            'applicant' => [
                'groom' => $person('Jose', 'Cruz'),
                'bride' => $person('Maria', 'Clara'),
            ],
            'sponsors' => [$sponsorPair(''), $sponsorPair(' Two')],
            'documents' => [
                ['document_type' => 'marriage_license', 'file' => UploadedFile::fake()->create('license.pdf', 100, 'application/pdf')],
                ['document_type' => 'cenomar', 'file' => UploadedFile::fake()->create('cenomar.pdf', 100, 'application/pdf')],
                ['document_type' => 'baptismal_certificate', 'file' => UploadedFile::fake()->create('baptism.pdf', 100, 'application/pdf')],
                ['document_type' => 'confirmation_certificate', 'file' => UploadedFile::fake()->create('confirmation.pdf', 100, 'application/pdf')],
                ['document_type' => 'couple_photo_1', 'file' => UploadedFile::fake()->image('photo1.jpg')],
                ['document_type' => 'couple_photo_2', 'file' => UploadedFile::fake()->image('photo2.png')],
                ['document_type' => 'couple_photo_3', 'file' => UploadedFile::fake()->image('photo3.jpg')],
            ],
            'remarks' => '',
        ];
    }
}
