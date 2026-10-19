<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\SmsMessage;
use App\Models\User;
use App\Services\BookingRequirementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RequirementReviewTest extends TestCase
{
    use RefreshDatabase;

    private function booking(string $code = 'funeral'): Booking
    {
        $service = Service::firstOrCreate(['code' => $code], ['name' => ucfirst($code), 'description' => $code]);
        $booking = Booking::create([
            'user_id' => User::factory()->create()->id, 'service_id' => $service->id,
            'booking_reference' => 'REVIEW-'.uniqid(), 'status' => 'pending', 'total_amount' => 0,
        ]);
        foreach (app(BookingRequirementService::class)->missing($booking) as $requirement) {
            $booking->documents()->create([
                'document_type' => $requirement['types'][0], 'file_name' => 'test.pdf',
                'file_path' => 'test.pdf', 'status' => 'pending',
            ]);
        }

        return $booking->fresh();
    }

    public function test_individual_review_sends_one_sms_and_gates_physical_receipt(): void
    {
        config(['services.sms.driver' => 'database']);
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);
        $booking = $this->booking();
        $url = "/api/staff/bookings/{$booking->id}/requirements/review";
        $this->postJson($url, ['action' => 'receive'])->assertUnprocessable();
        $this->patchJson("/api/staff/bookings/{$booking->id}/status", ['status' => 'approved'])->assertUnprocessable();
        foreach ($booking->documents as $index => $document) {
            $this->postJson($url, ['action' => 'approve', 'document_key' => "document:{$document->id}"])
                ->assertOk()->assertJsonPath('data.details.requirementReview.allApproved', $index === 1);
        }
        $this->assertSame(1, SmsMessage::where('category', 'booking_documents_approved')->count());
        $this->assertStringContainsString('physical copies', SmsMessage::where('category', 'booking_documents_approved')->first()->message);
        $this->postJson($url, ['action' => 'approve_all'])->assertOk();
        $this->assertSame(1, SmsMessage::where('category', 'booking_documents_approved')->count());
        $this->postJson($url, ['action' => 'receive'])->assertOk();
        $this->assertNotNull($booking->fresh()->physical_copies_received_at);
        $this->assertSame($staff->id, $booking->fresh()->physical_copies_received_by);
        $this->postJson($url, ['action' => 'receive'])->assertOk();
        $this->patchJson("/api/staff/bookings/{$booking->id}/status", ['status' => 'approved'])->assertOk();
    }

    public function test_bulk_review_does_not_approve_missing_rejected_or_payment_documents(): void
    {
        config(['services.sms.driver' => 'database']);
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $booking = $this->booking();
        $document = $booking->documents->first();
        $document->update(['status' => 'rejected', 'remarks' => 'Unreadable']);
        $receipt = $booking->documents()->create(['document_type' => 'payment_receipt', 'file_name' => 'receipt.jpg', 'file_path' => 'receipt.jpg', 'status' => 'pending']);
        $url = "/api/staff/bookings/{$booking->id}/requirements/review";
        $this->postJson($url, ['action' => 'approve_all'])->assertOk()->assertJsonPath('data.details.requirementReview.allApproved', false);
        $this->assertSame('rejected', $document->fresh()->status);
        $this->assertSame('pending', $receipt->fresh()->status);
        $this->postJson($url, ['action' => 'approve', 'document_key' => "document:{$receipt->id}"])->assertUnprocessable();
        $this->postJson($url, ['action' => 'approve', 'document_key' => "document:{$document->id}"])->assertUnprocessable();
        $this->postJson($url, ['action' => 'receive'])->assertUnprocessable();
        $this->assertDatabaseCount('sms_messages', 0);
        $document->delete();
        $this->postJson($url, ['action' => 'approve_all'])->assertOk()->assertJsonPath('data.details.requirementReview.allApproved', false);
    }

    public function test_legacy_sponsor_is_pending_until_individually_approved(): void
    {
        config(['services.sms.driver' => 'database']);
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $booking = $this->booking('wedding');
        $sponsor = $booking->weddingSponsors()->create([
            'sort_order' => 1, 'role' => 'godfather', 'first_name' => 'Juan', 'last_name' => 'Cruz',
            'residence' => 'Tanza', 'requirement_type' => 'marriage_contract',
            'requirement_file_name' => 'sponsor.jpg', 'requirement_file_path' => 'sponsor.jpg',
        ]);
        $booking->documents()->update(['status' => 'approved']);
        $this->assertFalse(app(BookingRequirementService::class)->reviewSummary($booking->fresh())['allApproved']);
        $this->postJson("/api/staff/bookings/{$booking->id}/requirements/review", [
            'action' => 'approve', 'document_key' => "wedding-sponsor-individual:{$sponsor->id}",
        ])->assertOk()->assertJsonPath('data.details.requirementReview.allApproved', true);
        $this->assertNull($sponsor->fresh()->requirement_file_path);
        $this->assertDatabaseHas('booking_documents', ['booking_id' => $booking->id, 'file_path' => 'sponsor.jpg', 'status' => 'approved']);
    }

    public function test_review_is_staff_only_scoped_and_resubmission_locks_collection_again(): void
    {
        Storage::fake('public');
        config(['services.sms.driver' => 'database']);
        $booking = $this->booking();
        $other = $this->booking();
        $url = "/api/staff/bookings/{$booking->id}/requirements/review";
        Sanctum::actingAs($booking->user);
        $this->postJson($url, ['action' => 'approve_all'])->assertForbidden();
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);
        $this->postJson($url, ['action' => 'approve', 'document_key' => 'document:'.$other->documents->first()->id])->assertUnprocessable();
        $this->postJson($url, ['action' => 'approve_all'])->assertOk();
        $this->postJson($url, ['action' => 'receive'])->assertOk();
        $this->postJson("/api/staff/bookings/{$booking->id}/requirements/resubmit", [
            'document_key' => 'document:'.$booking->documents->first()->id, 'reason' => 'Please upload a clearer copy.',
        ])->assertOk()->assertJsonPath('data.details.requirementReview.allApproved', false)
            ->assertJsonPath('data.details.requirementReview.physicalCopiesReceivedAt', null);
        $this->assertNull($booking->fresh()->physical_copies_received_at);
        $this->postJson($url, ['action' => 'receive'])->assertUnprocessable();
        Sanctum::actingAs($booking->user);
        $this->post("/api/bookings/{$booking->id}/documents", [
            'document_type' => $booking->documents->first()->document_type,
            'file' => UploadedFile::fake()->create('replacement.pdf', 20, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated()->assertJsonPath('data.document.status', 'pending');
        Sanctum::actingAs($staff);
        $this->postJson($url, ['action' => 'receive'])->assertUnprocessable();
        $this->postJson($url, ['action' => 'approve_all'])->assertOk();
        $this->assertSame(1, SmsMessage::where('category', 'booking_documents_approved')->where('booking_id', $booking->id)->count());
        $booking->update(['status' => 'cancelled']);
        $this->postJson($url, ['action' => 'approve_all'])->assertUnprocessable();
    }

    public function test_legacy_godparent_upload_is_pending_and_can_be_approved_in_bulk(): void
    {
        config(['services.sms.driver' => 'database']);
        $booking = $this->booking('baptism');
        $child = $booking->baptizand()->create([
            'first_name' => 'Ana', 'last_name' => 'Cruz', 'birth_date' => '2026-01-01',
            'birth_place' => 'Tanza', 'age' => 0, 'gender' => 'Female',
            'address' => 'Tanza', 'contact_number' => '09171234567',
        ]);
        $godparent = $child->godParents()->create([
            'sort_order' => 1, 'role' => 'godmother', 'first_name' => 'Maria', 'last_name' => 'Cruz',
            'residence' => 'Tanza', 'requirement_type' => 'confirmation_certificate',
            'requirement_file_name' => 'sponsor.png', 'requirement_file_path' => 'sponsor.png',
        ]);
        Sanctum::actingAs($booking->user);
        $documents = $this->getJson("/api/bookings/{$booking->id}")->assertOk()->json('data.documents');
        $this->assertSame('pending', collect($documents)->firstWhere('fileName', 'sponsor.png')['status']);
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $this->postJson("/api/staff/bookings/{$booking->id}/requirements/review", ['action' => 'approve_all'])
            ->assertOk()->assertJsonPath('data.details.requirementReview.allApproved', true);
        $this->assertNull($godparent->fresh()->requirement_file_path);
        $this->assertDatabaseHas('booking_documents', ['booking_id' => $booking->id, 'file_path' => 'sponsor.png', 'status' => 'approved']);
    }

    public function test_payment_requires_physical_receipt_for_every_sacrament_and_both_methods(): void
    {
        Storage::fake('public');
        config(['services.sms.driver' => 'database']);
        $staff = User::factory()->create(['role' => 'staff']);
        foreach (['baptism', 'wedding', 'funeral', 'confirmation', 'first-communion'] as $index => $code) {
            foreach (['cash', 'gcash'] as $method) {
                $booking = $this->booking($code);
                $booking->update(['total_amount' => 100]);
                $payload = ['payment_method' => $method];
                if ($method === 'gcash') {
                    $payload += ['reference_number' => '800000000000'.$index, 'receipt' => UploadedFile::fake()->image('receipt.jpg')];
                }
                $url = "/api/bookings/{$booking->id}/payment";
                Sanctum::actingAs($booking->user);
                $this->post($url, $payload, ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('payment_method');
                Sanctum::actingAs($staff);
                $this->postJson("/api/staff/bookings/{$booking->id}/requirements/review", ['action' => 'approve_all'])->assertOk();
                Sanctum::actingAs($booking->user);
                $this->getJson("/api/bookings/{$booking->id}")->assertOk()->assertJsonPath('data.payment.canChangeMethod', false);
                $this->post($url, $payload, ['Accept' => 'application/json'])->assertUnprocessable();
                $this->assertSame(0, $booking->payments()->count());
                Sanctum::actingAs($staff);
                $this->postJson("/api/staff/bookings/{$booking->id}/requirements/review", ['action' => 'receive'])->assertOk();
                Sanctum::actingAs($booking->user);
                $this->getJson("/api/bookings/{$booking->id}")->assertOk()->assertJsonPath('data.payment.canChangeMethod', true);
                $this->post($url, $payload, ['Accept' => 'application/json'])->assertCreated();
                $payment = $booking->payments()->sole();
                Sanctum::actingAs($staff);
                $booking->refresh()->update(['physical_copies_received_at' => null]);
                $confirmation = ['status' => 'confirmed', 'amount_received' => 100, 'official_receipt_number' => 'OR-'.$payment->id];
                $this->patchJson("/api/staff/transactions/{$payment->id}/status", $confirmation)->assertUnprocessable();
                $this->assertNotSame('confirmed', $payment->fresh()->status);
                $this->postJson("/api/staff/bookings/{$booking->id}/requirements/review", ['action' => 'receive'])->assertOk();
                $this->patchJson("/api/staff/transactions/{$payment->id}/status", $confirmation)->assertOk();
            }
        }
    }
}
