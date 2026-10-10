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

    public function test_wedding_stores_three_photos_and_each_sponsors_selected_pdf(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create();
        Sanctum::actingAs($parishioner);

        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);

        $response = $this->post('/api/bookings/wedding', $payload)
            ->assertCreated();

        $bookingId = $response->json('data.id');

        $this->assertDatabaseCount('wedding_sponsors', 4);
        $this->assertDatabaseHas('wedding_sponsors', [
            'booking_id' => $bookingId,
            'sort_order' => 1,
            'role' => 'godfather',
            'first_name' => 'Pedro',
            'last_name' => 'Santos',
            'requirement_type' => 'marriage_contract',
            'requirement_file_name' => 'pedro-marriage.pdf',
        ]);
        $this->assertDatabaseHas('wedding_sponsors', [
            'booking_id' => $bookingId,
            'sort_order' => 2,
            'role' => 'godmother',
            'first_name' => 'Ana',
            'last_name' => 'Reyes',
            'requirement_type' => 'confirmation_certificate',
            'requirement_file_name' => 'ana-confirmation.pdf',
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
            [
                'sponsor_1_marriage_contract',
                'sponsor_2_confirmation_certificate',
                'sponsor_3_marriage_contract',
                'sponsor_4_confirmation_certificate',
            ],
            $parishionerDocuments
                ->filter(fn (array $document) => str_starts_with($document['type'], 'sponsor_'))
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
            [
                'sponsor_1_marriage_contract',
                'sponsor_2_confirmation_certificate',
                'sponsor_3_marriage_contract',
                'sponsor_4_confirmation_certificate',
            ],
            $staffDocuments
                ->filter(fn (array $document) => str_starts_with($document['type'], 'sponsor_'))
                ->pluck('type')
                ->values()
                ->all()
        );

        $firstSponsorDocument = $staffDocuments->firstWhere(
            'type',
            'sponsor_1_marriage_contract'
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
            'file' => UploadedFile::fake()->image('valid-sponsor-certificate.png'),
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

    public function test_wedding_sponsor_requirement_rejects_unsupported_files(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());

        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);
        $payload['sponsors'][0]['requirement_file'] = UploadedFile::fake()
            ->create('sponsor-certificate.txt', 100, 'text/plain');

        $this->post('/api/bookings/wedding', $payload)
            ->assertUnprocessable()
            ->assertInvalid('sponsors.0.requirement_file');
    }

    public function test_wedding_sponsor_requirements_accept_jpg_and_png(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);
        $payload['sponsors'][0]['requirement_file'] = UploadedFile::fake()->image('certificate.jpg');
        $payload['sponsors'][1]['requirement_file'] = UploadedFile::fake()->image('certificate.png');

        $this->post('/api/bookings/wedding', $payload)->assertCreated();
    }

    public function test_individual_sacraments_support_coordination_and_later_uploads(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);
        foreach (['bride', 'groom'] as $role) {
            $payload['applicant'][$role]['church']['baptism_status'] = $role === 'bride' ? 'no' : 'yes';
            $payload['applicant'][$role]['church']['confirmation_status'] = $role === 'bride' ? 'no' : 'yes';
        }
        unset($payload['applicant']['bride']['church']['baptized_in'], $payload['applicant']['bride']['church']['confirmed_in']);
        $payload['documents'] = array_values(array_filter($payload['documents'], fn ($doc) => ! in_array($doc['document_type'], ['baptismal_certificate', 'confirmation_certificate'])));
        $payload['documents'][] = ['document_type' => 'groom_baptismal_certificate', 'file' => UploadedFile::fake()->image('groom.jpg')];
        $id = $this->post('/api/bookings/wedding', $payload)->assertCreated()->json('data.id');
        $this->assertDatabaseHas('wedding_applicants', ['booking_id' => $id, 'role' => 'bride', 'baptism_status' => 'no', 'baptized_in' => '']);
        $missing = $this->getJson("/api/bookings/{$id}")->assertOk()->assertJsonCount(3, 'data.missingRequirements')->json('data.missingRequirements');
        $this->assertStringContainsString('For parish coordination', collect($missing)->firstWhere('key', 'bride_baptismal_certificate')['label']);
        $this->assertContains('groom_confirmation_certificate', array_column($missing, 'key'));

        foreach (['bride_baptismal_certificate', 'bride_confirmation_certificate', 'groom_confirmation_certificate'] as $type) {
            $this->post("/api/bookings/{$id}/documents", [
                'document_type' => $type, 'file' => UploadedFile::fake()->image($type.'.png'),
            ], ['Accept' => 'application/json'])->assertCreated();
        }
        $this->getJson("/api/bookings/{$id}")->assertOk()->assertJsonCount(0, 'data.missingRequirements');
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $applicants = $this->getJson('/api/staff/bookings')->assertOk()->json('data.0.details.serviceData.applicants');
        $this->assertStringContainsString('For parish coordination', collect($applicants)->firstWhere('role', 'Bride')['baptizedIn']);
    }

    public function test_sacramental_status_accepts_only_yes_or_no_and_requires_parish_for_yes(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);
        $payload['applicant']['bride']['church'] = ['baptism_status' => 'not sure', 'confirmation_status' => 'yes'];
        $this->postJson('/api/bookings/wedding', $payload)->assertUnprocessable()->assertInvalid([
            'applicant.bride.church.baptism_status', 'applicant.bride.church.confirmed_in',
            'applicant.groom.church.baptism_status', 'applicant.groom.church.confirmation_status',
        ]);
    }

    public function test_shared_certificates_do_not_satisfy_new_person_specific_requirements(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        [$slot, $package] = $this->weddingSchedule();
        $payload = $this->payload($slot->id, $package->id);
        foreach (['bride', 'groom'] as $role) {
            $payload['applicant'][$role]['church']['baptism_status'] = 'yes';
            $payload['applicant'][$role]['church']['confirmation_status'] = 'yes';
        }
        $id = $this->post('/api/bookings/wedding', $payload)->assertCreated()->json('data.id');
        $missing = $this->getJson("/api/bookings/{$id}")->assertOk()->assertJsonCount(4, 'data.missingRequirements')->json('data.missingRequirements');
        $this->assertEqualsCanonicalizing([
            'bride_baptismal_certificate', 'bride_confirmation_certificate',
            'groom_baptismal_certificate', 'groom_confirmation_certificate',
        ], array_column($missing, 'key'));
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

        $sponsor = fn (
            string $role,
            string $firstName,
            string $lastName,
            string $requirementType,
            string $fileName,
        ) => [
            'role' => $role,
            'first_name' => $firstName,
            'middle_initial' => 'D',
            'last_name' => $lastName,
            'residence' => 'Batangas',
            'requirement_type' => $requirementType,
            'requirement_file' => UploadedFile::fake()
                ->create($fileName, 100, 'application/pdf'),
        ];

        return [
            'booking_slot_id' => $slotId,
            'service_package_id' => $packageId,
            'selected_addon_ids' => [],
            'applicant' => [
                'groom' => $person('Jose', 'Cruz'),
                'bride' => $person('Maria', 'Clara'),
            ],
            'sponsors' => [
                $sponsor('godfather', 'Pedro', 'Santos', 'marriage_contract', 'pedro-marriage.pdf'),
                $sponsor('godmother', 'Ana', 'Reyes', 'confirmation_certificate', 'ana-confirmation.pdf'),
                $sponsor('godfather', 'Pedro Two', 'Santos', 'marriage_contract', 'pedro-two-marriage.pdf'),
                $sponsor('godmother', 'Ana Two', 'Reyes', 'confirmation_certificate', 'ana-two-confirmation.pdf'),
            ],
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
