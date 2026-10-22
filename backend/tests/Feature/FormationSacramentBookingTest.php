<?php

namespace Tests\Feature;

use App\Jobs\SendSmsMessage;
use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\SmsMessage;
use App\Models\User;
use App\Services\FormationSacramentBookingService;
use Database\Seeders\ServiceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\HasConfirmedSchedule;
use Tests\TestCase;

class FormationSacramentBookingTest extends TestCase
{
    use HasConfirmedSchedule;
    use RefreshDatabase;

    public function test_parishioner_can_submit_confirmation_and_staff_must_schedule_seminar_before_approval(): void
    {
        Storage::fake('public');
        Queue::fake();
        $parishioner = User::factory()->create([
            'phone' => '09171234567',
            'phone_verified_at' => now(),
        ]);
        Sanctum::actingAs($parishioner);
        [$slot, $package] = $this->schedule('confirmation');

        $bookingId = $this->post('/api/bookings/formation-sacrament/confirmation', $this->payload(
            $slot->id,
            $package->id,
            true,
        ), ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.service.code', 'confirmation')
            ->json('data.id');

        $this->assertDatabaseHas('booking_documents', [
            'booking_id' => $bookingId,
            'document_type' => 'baptismal_certificate',
        ]);
        $this->assertDatabaseHas('god_parents', [
            'role' => 'godmother',
            'first_name' => 'Ana',
        ]);

        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        $this->postJson("/api/staff/bookings/{$bookingId}/requirements/review", ['action' => 'approve_all'])->assertOk();
        $this->postJson("/api/staff/bookings/{$bookingId}/requirements/review", ['action' => 'receive'])->assertOk();
        Sanctum::actingAs($parishioner);
        $this->postJson("/api/bookings/{$bookingId}/payment", ['payment_method' => 'cash'])->assertCreated();
        $payment = Booking::findOrFail($bookingId)->payments()->sole();
        $this->assertSame(575.0, (float) $payment->amount);
        Sanctum::actingAs($staff);
        $this->patchJson("/api/staff/transactions/{$payment->id}/status", ['status' => 'confirmed', 'amount_received' => 575, 'official_receipt_number' => 'CNF-001'])->assertOk();

        $this->patchJson("/api/staff/bookings/{$bookingId}/status", [
            'status' => 'approved',
        ])->assertUnprocessable()->assertJsonValidationErrors('appointments');

        $this->postJson("/api/staff/bookings/{$bookingId}/appointments", [
            'type' => 'seminar',
            'scheduledAt' => now()->addDays(3)->toIso8601String(),
        ])->assertCreated()->assertJsonPath('data.venue', '');

        $this->assertStringContainsString(
            'confirmation seminar',
            SmsMessage::query()
                ->where('booking_id', $bookingId)
                ->where('category', 'confirmation_seminar')
                ->value('message')
        );
        Queue::assertPushed(SendSmsMessage::class);

        $this->patchJson("/api/staff/bookings/{$bookingId}/status", [
            'status' => 'approved',
        ])->assertOk()->assertJsonPath('data.status', 'approved');
    }

    public function test_first_communion_registration_is_retired(): void
    {
        Queue::fake();
        $this->seed(ServiceSeeder::class);
        Sanctum::actingAs(User::factory()->create(['phone_verified_at' => now()]));

        $this->postJson('/api/bookings/formation-sacrament/first-communion', [])
            ->assertNotFound();
        $this->getJson('/api/services/first-communion/packages')->assertGone();
        $this->assertDatabaseHas('services', ['code' => 'first-communion', 'is_active' => false]);
        $this->assertDatabaseCount('bookings', 0);
        Queue::assertNothingPushed();
    }

    public function test_internal_booking_service_rejects_retired_service(): void
    {
        $this->expectException(ValidationException::class);
        app(FormationSacramentBookingService::class)->store([
            'service_code' => 'first-communion',
        ]);
    }

    private function schedule(string $serviceCode): array
    {
        $service = Service::query()->where('code', $serviceCode)->firstOrFail();
        $package = ServicePackage::query()
            ->where('service_id', $service->id)
            ->firstOrFail();
        $slot = BookingSlot::create([
            'service_id' => $service->id,
            'booking_date' => today()->addWeek(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'capacity' => 1,
            'is_active' => true,
        ]);

        return [$slot, $package];
    }

    private function payload(int $slotId, int $packageId, bool $withSponsor): array
    {
        $payload = [
            'schedule_request_id' => $withSponsor ? $this->confirmedScheduleId($slotId) : null,
            'booking_slot_id' => $slotId,
            'service_package_id' => $packageId,
            'candidate' => [
                'first_name' => 'Juan',
                'middle_initial' => 'D',
                'last_name' => 'Cruz',
                'suffix' => '',
                'parish_origin' => 'St. Lorenzo Ruiz Parish',
                'baptism_date' => '2015-05-10',
                'baptism_church' => 'St. Lorenzo Ruiz Parish',
                'birth_date' => '2014-01-15',
                'birth_place' => 'Taysan, Batangas',
                'gender' => 'Male',
                'address' => 'Taysan, Batangas',
                'contact_number' => '09171234567',
            ],
            'parents' => [
                [
                    'relationship' => 'father',
                    'first_name' => 'Pedro',
                    'middle_initial' => 'A',
                    'last_name' => 'Cruz',
                    'birth_place' => 'Batangas',
                ],
                [
                    'relationship' => 'mother',
                    'first_name' => 'Maria',
                    'middle_initial' => 'B',
                    'last_name' => 'Cruz',
                    'birth_place' => 'Batangas',
                ],
            ],
            'documents' => [[
                'document_type' => 'baptismal_certificate',
                'file' => UploadedFile::fake()->create('baptismal.pdf', 100, 'application/pdf'),
            ]],
            'remarks' => '',
        ];

        if ($withSponsor) {
            $payload['sponsors'] = [[
                'role' => 'godmother',
                'first_name' => 'Ana',
                'middle_initial' => 'R',
                'last_name' => 'Santos',
                'address' => 'Taysan, Batangas',
                'requirement_type' => 'confirmation_certificate',
                'requirement_file' => UploadedFile::fake()->create(
                    'sponsor-confirmation.pdf',
                    100,
                    'application/pdf'
                ),
            ]];
        }

        return $payload;
    }
}
