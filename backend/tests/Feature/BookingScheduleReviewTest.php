<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingScheduleReviewTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.sms.driver' => 'database']);
        Storage::fake('public');
        $this->owner = User::factory()->create(['phone_verified_at' => now()]);
        $this->staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($this->owner);
    }

    private function slot(string $code, string $time = '09:00'): BookingSlot
    {
        $service = Service::firstOrCreate(['code' => $code], ['name' => ucfirst($code), 'description' => $code]);

        return BookingSlot::create(['service_id' => $service->id, 'booking_date' => today()->addWeek(),
            'start_time' => $time, 'end_time' => '12:00', 'capacity' => $code === 'baptism' ? null : 1, 'is_active' => true]);
    }

    private function requestSlot(BookingSlot $slot): int
    {
        return $this->postJson('/api/schedule-requests', ['service' => $slot->service->code, 'booking_slot_id' => $slot->id])
            ->assertCreated()->assertJsonPath('data.review.status', 'awaiting_review')->json('data.id');
    }

    private function confirm(int $id): void
    {
        Sanctum::actingAs($this->staff);
        $this->patchJson("/api/staff/bookings/$id/schedule-review", ['decision' => 'confirmed'])
            ->assertOk()->assertJsonPath('data.scheduleReview.status', 'confirmed');
        Sanctum::actingAs($this->owner);
    }

    public function test_all_services_lock_files_until_schedule_confirmation_and_form_completion(): void
    {
        foreach (['baptism', 'wedding', 'funeral', 'confirmation'] as $index => $code) {
            $slot = $this->slot($code, sprintf('%02d:00', 8 + $index));
            $id = $this->requestSlot($slot);
            $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', false);
            $this->post("/api/bookings/$id/documents", ['document_type' => 'birth_certificate', 'file' => UploadedFile::fake()->create('test.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])
                ->assertUnprocessable()->assertJsonValidationErrors('schedule');
            $this->patchJson("/api/staff/bookings/$id/schedule-review", ['decision' => 'confirmed'])->assertForbidden();
            $this->confirm($id);
            $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', false);
            // The existing form is completed before individual follow-up uploads are enabled.
            Booking::findOrFail($id)->update(['details_submitted_at' => now()]);
            $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', true);
            $this->assertStringContainsString('You may now', SmsMessage::where('booking_id', $id)->where('category', 'schedule_confirmed')->sole()->message);
        }
        $this->assertDatabaseCount('booking_documents', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_rejection_requires_reason_sends_sms_releases_time_and_allows_new_request(): void
    {
        $slot = $this->slot('funeral');
        $otherServiceSlot = $this->slot('wedding');
        $id = $this->requestSlot($slot);
        Sanctum::actingAs($this->staff);
        $url = "/api/staff/bookings/$id/schedule-review";
        $this->patchJson($url, ['decision' => 'rejected', 'reason' => '   '])->assertUnprocessable();
        $this->patchJson("/api/staff/bookings/$id/status", ['status' => 'rejected'])->assertUnprocessable();
        $this->patchJson($url, ['decision' => 'rejected', 'reason' => 'The priest is unavailable.'])->assertOk();
        $this->assertStringContainsString('The priest is unavailable.', SmsMessage::where('category', 'schedule_rejected')->sole()->message);
        $this->patchJson($url, ['decision' => 'rejected', 'reason' => 'Again'])->assertUnprocessable();
        $this->assertSame(1, SmsMessage::where('category', 'schedule_rejected')->count());
        Sanctum::actingAs($this->owner);
        $this->getJson('/api/booking-slots?service=wedding&date='.$slot->booking_date->toDateString())->assertOk()->assertJsonPath('0.available', true);
        $this->requestSlot($otherServiceSlot);
        $newSlot = $this->slot('funeral', '14:00');
        $this->patchJson("/api/bookings/$id/reschedule", ['booking_slot_id' => $newSlot->id])
            ->assertOk()->assertJsonPath('data.scheduleReview.status', 'awaiting_review');
        $this->assertNull(Booking::findOrFail($id)->schedule_reason);
    }

    public function test_first_request_claims_shared_time_and_baptism_remains_a_group_session(): void
    {
        $slot = $this->slot('wedding');
        $other = $this->slot('funeral');
        $id = $this->requestSlot($slot);
        Sanctum::actingAs(User::factory()->create(['phone_verified_at' => now()]));
        foreach ([$slot, $other] as $occupied) {
            $this->postJson('/api/schedule-requests', ['service' => $occupied->service->code, 'booking_slot_id' => $occupied->id])->assertUnprocessable();
        }
        $this->assertDatabaseCount('bookings', 1);
        $baptism = $this->slot('baptism', '14:00');
        $this->requestSlot($baptism);
        Sanctum::actingAs($this->owner);
        $this->requestSlot($baptism);
        $this->confirm($id);
    }

    public function test_disabled_slot_cannot_be_confirmed_and_schedule_requests_are_owner_scoped(): void
    {
        $slot = $this->slot('wedding');
        $id = $this->requestSlot($slot);
        $slot->update(['is_active' => false]);
        Sanctum::actingAs($this->staff);
        $this->patchJson("/api/staff/bookings/$id/schedule-review", ['decision' => 'confirmed'])->assertUnprocessable();
        $this->assertSame(0, SmsMessage::where('category', 'schedule_confirmed')->count());
        Sanctum::actingAs(User::factory()->create(['phone_verified_at' => now()]));
        $this->getJson('/api/schedule-requests?service=wedding')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson("/api/bookings/$id")->assertNotFound();
        $this->patchJson("/api/bookings/$id/reschedule", ['booking_slot_id' => $slot->id])->assertNotFound();
    }

    public function test_form_submission_updates_confirmed_request_once_and_reschedule_locks_uploads_again(): void
    {
        $slot = $this->slot('confirmation');
        $id = $this->requestSlot($slot);
        $package = ServicePackage::where('service_id', $slot->service_id)->firstOrFail();
        $payload = [
            'schedule_request_id' => $id, 'booking_slot_id' => $slot->id, 'service_package_id' => $package->id,
            'candidate' => ['first_name' => 'Ana', 'last_name' => 'Cruz', 'birth_date' => '2014-01-01', 'birth_place' => 'Taysan',
                'gender' => 'Female', 'address' => 'Taysan', 'contact_number' => '09171234567', 'parish_origin' => 'St. Lorenzo',
                'baptism_date' => '2015-01-01', 'baptism_church' => 'St. Lorenzo'],
            'parents' => collect(['father', 'mother'])->map(fn ($role) => ['relationship' => $role, 'first_name' => 'Parent', 'last_name' => 'Cruz', 'birth_place' => 'Taysan'])->all(),
            'documents' => [['document_type' => 'baptismal_certificate', 'file' => UploadedFile::fake()->create('baptism.pdf', 10, 'application/pdf')]],
        ];
        $payload['sponsors'] = [['role' => 'godmother', 'first_name' => 'Maria', 'last_name' => 'Cruz', 'address' => 'Taysan', 'requirement_type' => 'confirmation_certificate']];
        $url = '/api/bookings/formation-sacrament/confirmation';
        $this->post($url, $payload, ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('documents');
        $this->assertDatabaseCount('booking_documents', 0);
        $this->confirm($id);
        $this->post($url, $payload, ['Accept' => 'application/json'])->assertCreated()->assertJsonPath('data.id', $id);
        $this->assertDatabaseCount('bookings', 1);
        $this->assertDatabaseCount('booking_documents', 1);
        $this->post($url, $payload, ['Accept' => 'application/json'])->assertUnprocessable();
        $newSlot = $this->slot('confirmation', '14:00');
        $this->patchJson("/api/bookings/$id/reschedule", ['booking_slot_id' => $newSlot->id])->assertOk();
        $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', false);
        $this->confirm($id);
        $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', true);
    }

    public function test_linked_ceremony_assignment_confirms_schedule_and_unlocks_requirements(): void
    {
        $slot = $this->slot('wedding');
        $parentId = $this->requestSlot($slot);
        $service = Service::where('code', 'confirmation')->firstOrFail();
        $child = Booking::create(['booking_reference' => 'LINKED-1', 'user_id' => $this->owner->id, 'service_id' => $service->id,
            'wedding_booking_id' => $parentId, 'wedding_applicant_role' => 'bride', 'status' => 'pending',
            'schedule_status' => 'awaiting_review', 'details_submitted_at' => now()]);
        $this->getJson("/api/bookings/{$child->id}")->assertOk()->assertJsonPath('data.canUploadDocuments', false);
        Sanctum::actingAs($this->staff);
        $this->postJson("/api/staff/bookings/{$child->id}/appointments", ['type' => 'sacrament', 'scheduledAt' => now()->addDays(3)->toIso8601String()])
            ->assertCreated()->assertJsonPath('data.scheduleReview.status', 'confirmed');
        $this->assertStringContainsString('You may now submit requirements', SmsMessage::where('booking_id', $child->id)->sole()->message);
        Sanctum::actingAs($this->owner);
        $this->getJson("/api/bookings/{$child->id}")->assertOk()->assertJsonPath('data.canUploadDocuments', true);
    }

    public function test_complete_form_requests_schedule_without_files_and_preserves_details_after_rejection(): void
    {
        $slot = $this->slot('confirmation');
        $package = ServicePackage::where('service_id', $slot->service_id)->firstOrFail();
        $payload = [
            'booking_slot_id' => $slot->id, 'service_package_id' => $package->id,
            'candidate' => ['first_name' => 'Ana', 'last_name' => 'Cruz', 'birth_date' => '2000-01-01', 'birth_place' => 'Taysan',
                'gender' => 'Female', 'address' => 'Taysan', 'contact_number' => '09171234567', 'parish_origin' => 'St. Lorenzo',
                'baptism_date' => '2001-01-01', 'baptism_church' => 'St. Lorenzo'],
            'parents' => collect(['father', 'mother'])->map(fn ($role) => ['relationship' => $role, 'first_name' => 'Parent', 'last_name' => 'Cruz', 'birth_place' => 'Taysan'])->all(),
            'sponsors' => [['role' => 'godmother', 'first_name' => 'Maria', 'last_name' => 'Cruz', 'address' => 'Taysan', 'requirement_type' => 'confirmation_certificate']],
        ];
        $url = '/api/bookings/formation-sacrament/confirmation';
        $withFile = $payload;
        $withFile['sponsors'][0]['requirement_file'] = UploadedFile::fake()->create('sponsor.pdf', 10, 'application/pdf');
        $this->post($url, $withFile, ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('documents');
        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('sms_messages', 0);

        $id = $this->postJson($url, $payload)->assertCreated()->json('data.id');
        $booking = Booking::findOrFail($id);
        $personId = $booking->baptizand->id;
        $sponsorId = $booking->baptizand->godParents->sole()->id;
        $this->assertSame('awaiting_review', $booking->schedule_status);
        $this->assertNotNull($booking->details_submitted_at);
        $this->assertDatabaseCount('booking_documents', 0);
        $this->assertSame(1, SmsMessage::where('booking_id', $id)->count());
        $this->assertStringContainsString('wait for confirmation', SmsMessage::sole()->message);
        $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', false);

        Sanctum::actingAs($this->staff);
        $this->patchJson("/api/staff/bookings/$id/schedule-review", ['decision' => 'rejected', 'reason' => 'Priest unavailable.'])->assertOk();
        Sanctum::actingAs($this->owner);
        $newSlot = $this->slot('confirmation', '14:00');
        $this->patchJson("/api/bookings/$id/reschedule", ['booking_slot_id' => $newSlot->id])->assertOk();
        $booking->refresh();
        $this->assertSame($personId, $booking->baptizand->id);
        $this->assertSame($sponsorId, $booking->baptizand->godParents->sole()->id);
        $this->assertSame($package->id, $booking->service_package_id);
        $this->confirm($id);
        $this->getJson("/api/bookings/$id")->assertOk()->assertJsonPath('data.canUploadDocuments', true);
        $this->post("/api/bookings/$id/documents", ['document_type' => 'baptismal_certificate', 'file' => UploadedFile::fake()->create('baptism.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])->assertCreated();
        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_booking_endpoints_require_a_slot_and_duplicate_requests_do_not_send_another_sms(): void
    {
        foreach (['baptism', 'wedding', 'funeral', 'formation-sacrament/confirmation'] as $path) {
            $this->postJson('/api/bookings/'.$path, [])->assertUnprocessable()->assertJsonValidationErrors('booking_slot_id');
        }
        $slot = $this->slot('baptism');
        $this->requestSlot($slot);
        $this->postJson('/api/schedule-requests', ['service' => 'baptism', 'booking_slot_id' => $slot->id])->assertUnprocessable();
        $this->assertDatabaseCount('bookings', 1);
        $this->assertSame(1, SmsMessage::where('category', 'schedule_requested')->count());
    }
}
