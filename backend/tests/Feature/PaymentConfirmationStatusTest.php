<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\Service;
use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PaymentConfirmationStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_repair_migration_returns_unconfirmed_paid_records_to_pending(): void
    {
        $user = User::factory()->create();
        $service = Service::create([
            'code' => 'mass-intention',
            'name' => 'Mass Intention',
            'description' => 'Mass Intention',
        ]);

        $unconfirmed = Booking::create([
            'booking_reference' => 'MAS-UNCONFIRMED',
            'user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'paid',
        ]);
        BookingDocument::create([
            'booking_id' => $unconfirmed->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'pending.jpg',
            'file_path' => 'booking-documents/pending.jpg',
            'status' => 'pending',
        ]);

        $confirmed = Booking::create([
            'booking_reference' => 'MAS-CONFIRMED',
            'user_id' => $user->id,
            'service_id' => $service->id,
            'status' => 'paid',
        ]);
        BookingDocument::create([
            'booking_id' => $confirmed->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'approved.jpg',
            'file_path' => 'booking-documents/approved.jpg',
            'status' => 'approved',
        ]);

        $migration = require database_path('migrations/2026_08_25_000001_normalize_unconfirmed_payment_statuses.php');
        $migration->up();

        $this->assertDatabaseHas('bookings', [
            'id' => $unconfirmed->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $confirmed->id,
            'status' => 'paid',
        ]);
    }

    public function test_document_request_release_migration_restores_legacy_confirmed_requests_to_paid(): void
    {
        $user = User::factory()->create();
        $documentService = Service::create([
            'code' => 'document-request',
            'name' => 'Document Request',
            'description' => 'Document Request',
        ]);
        $weddingService = Service::create([
            'code' => 'wedding',
            'name' => 'Wedding',
            'description' => 'Wedding',
        ]);

        $documentBooking = Booking::create([
            'booking_reference' => 'DOC-LEGACY-APPROVED',
            'user_id' => $user->id,
            'service_id' => $documentService->id,
            'status' => 'approved',
        ]);
        $documentBooking->documentRequest()->create([
            'payment_reference' => 'GCASH-LEGACY',
            'total_amount' => 100,
        ]);
        BookingDocument::create([
            'booking_id' => $documentBooking->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'approved.jpg',
            'file_path' => 'booking-documents/approved.jpg',
            'status' => 'approved',
        ]);

        $weddingBooking = Booking::create([
            'booking_reference' => 'WED-LEGACY-APPROVED',
            'user_id' => $user->id,
            'service_id' => $weddingService->id,
            'status' => 'approved',
        ]);
        BookingDocument::create([
            'booking_id' => $weddingBooking->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'wedding-approved.jpg',
            'file_path' => 'booking-documents/wedding-approved.jpg',
            'status' => 'approved',
        ]);

        $migration = require database_path('migrations/2026_08_25_000002_normalize_document_request_release_status.php');
        $migration->up();

        $this->assertDatabaseHas('bookings', [
            'id' => $documentBooking->id,
            'status' => 'paid',
        ]);
        $this->assertDatabaseHas('bookings', [
            'id' => $weddingBooking->id,
            'status' => 'approved',
        ]);
    }

    public function test_every_paid_status_originates_from_transaction_confirmation(): void
    {
        config()->set('services.sms.driver', 'database');
        $parishioner = User::factory()->create();
        $staff = User::factory()->create(['role' => 'staff']);
        $records = [];

        foreach (['wedding', 'baptism', 'funeral', 'mass-intention', 'document-request'] as $code) {
            $service = Service::create([
                'code' => $code,
                'name' => str($code)->headline(),
                'description' => str($code)->headline(),
                'is_active' => true,
            ]);
            $booking = Booking::create([
                'booking_reference' => strtoupper(substr($code, 0, 3)).'-PAYMENT-WORKFLOW',
                'payment_reference' => strtoupper(substr($code, 0, 3)).'-GCASH-001',
                'user_id' => $parishioner->id,
                'service_id' => $service->id,
                'status' => 'pending',
            ]);

            if ($code === 'mass-intention') {
                $intention = $booking->massIntention()->create([
                    'intention_date' => now()->addWeek()->toDateString(),
                    'payment_reference' => $booking->payment_reference,
                    'total_amount' => 100,
                ]);
                $intention->entries()->create([
                    'intention_type' => 'Thanksgiving',
                    'names' => ['Juan Dela Cruz'],
                    'amount' => 100,
                ]);
            }

            if ($code === 'document-request') {
                $request = $booking->documentRequest()->create([
                    'payment_reference' => $booking->payment_reference,
                    'total_amount' => 100,
                ]);
                $request->items()->create([
                    'document_type' => 'Baptismal Certificate',
                    'details' => ['name' => 'Juan Dela Cruz'],
                    'price' => 100,
                ]);
            }

            $receipt = BookingDocument::create([
                'booking_id' => $booking->id,
                'document_type' => 'payment_receipt',
                'file_name' => $code.'-receipt.jpg',
                'file_path' => 'booking-documents/'.$code.'-receipt.jpg',
                'status' => 'pending',
            ]);
            $payment = $booking->payments()->create([
                'method' => 'gcash',
                'amount' => 100,
                'status' => 'pending_verification',
                'reference_number' => str_pad((string) (8000000000000 + count($records) + 1), 13, '0'),
                'receipt_document_id' => $receipt->id,
            ]);
            $records[$code] = compact('booking', 'receipt', 'payment');
        }

        $this->assertDatabaseCount('bookings', 5);
        $this->assertDatabaseMissing('bookings', ['status' => 'paid']);

        Sanctum::actingAs($staff);
        $this->patchJson('/api/staff/bookings/'.$records['wedding']['booking']->id.'/status', [
            'status' => 'paid',
        ])->assertUnprocessable();

        foreach ($records as ['booking' => $booking, 'receipt' => $receipt, 'payment' => $payment]) {
            $this->patchJson("/api/staff/transactions/{$payment->id}/status", [
                'status' => 'confirmed',
            ])->assertOk()->assertJsonPath('data.status', 'confirmed');

            $this->assertDatabaseHas('booking_documents', [
                'id' => $receipt->id,
                'status' => 'approved',
            ]);
            $this->assertDatabaseHas('bookings', [
                'id' => $booking->id,
                'status' => 'paid',
                'processed_by' => $staff->id,
            ]);
        }

        $documentRequestSms = SmsMessage::query()
            ->where('booking_id', $records['document-request']['booking']->id)
            ->where('category', 'payment_status')
            ->sole();
        $this->assertStringContainsString(
            'Your document request is now being prepared.',
            $documentRequestSms->message
        );
        $this->assertStringContainsString(
            'We will notify you by SMS when it is ready for pickup.',
            $documentRequestSms->message
        );
        $this->assertSame(
            0,
            SmsMessage::query()
                ->where('booking_id', '!=', $records['document-request']['booking']->id)
                ->where('message', 'like', '%document request is now being prepared%')
                ->count()
        );

        $this->getJson('/api/staff/bookings?status=paid&per_page=100')
            ->assertOk()
            ->assertJsonPath('meta.total', 3);
        $this->getJson('/api/staff/mass-intentions?status=paid&per_page=100')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.status', 'paid');
        $this->getJson('/api/staff/document-requests?status=paid&per_page=100')
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.status', 'paid');
        $this->getJson('/api/staff/transactions?status=confirmed&per_page=100')
            ->assertOk()
            ->assertJsonPath('meta.total', 5);
    }
}
