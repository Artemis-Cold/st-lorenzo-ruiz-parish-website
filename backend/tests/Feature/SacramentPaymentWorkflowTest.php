<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SacramentPaymentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_sacrament_payment_requires_an_exactly_thirteen_digit_gcash_reference(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create();
        $service = Service::create([
            'code' => 'funeral',
            'name' => 'Funeral',
            'description' => 'Funeral',
        ]);
        $booking = Booking::create([
            'booking_reference' => 'FUN-GCASH-VALIDATION',
            'user_id' => $parishioner->id,
            'service_id' => $service->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($parishioner);

        foreach (['123456789012', '12345678901A3', '12345678901234'] as $reference) {
            $this->post("/api/bookings/{$booking->id}/payment", [
                'reference_number' => $reference,
                'receipt' => UploadedFile::fake()->image('receipt.jpg'),
            ], ['Accept' => 'application/json'])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('reference_number');
        }
    }

    public function test_rejected_mass_intention_and_document_request_payments_can_be_replaced(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create();
        Sanctum::actingAs($parishioner);

        foreach (['mass-intention', 'document-request'] as $index => $serviceCode) {
            $service = Service::create([
                'code' => $serviceCode,
                'name' => str($serviceCode)->headline(),
                'description' => str($serviceCode)->headline(),
            ]);
            $oldReference = 'REJECTED-REFERENCE-'.$index;
            $newReference = '400000000000'.($index + 1);
            $booking = Booking::create([
                'booking_reference' => strtoupper(substr($serviceCode, 0, 3)).'-REPLACE-'.$index,
                'payment_reference' => $oldReference,
                'user_id' => $parishioner->id,
                'service_id' => $service->id,
                'status' => 'pending',
            ]);

            if ($serviceCode === 'mass-intention') {
                $booking->massIntention()->create([
                    'intention_date' => now()->addWeek()->toDateString(),
                    'payment_reference' => $oldReference,
                    'total_amount' => 100,
                ]);
            } else {
                $booking->documentRequest()->create([
                    'payment_reference' => $oldReference,
                    'total_amount' => 100,
                ]);
            }

            $oldPath = "booking-documents/rejected-{$index}.jpg";
            Storage::disk('public')->put($oldPath, 'rejected receipt');
            $receipt = $booking->documents()->create([
                'document_type' => 'payment_receipt',
                'file_name' => "rejected-{$index}.jpg",
                'file_path' => $oldPath,
                'status' => 'rejected',
                'remarks' => 'Reference could not be verified.',
            ]);

            $this->post("/api/bookings/{$booking->id}/payment", [
                'reference_number' => $newReference,
                'receipt' => UploadedFile::fake()->image("corrected-{$index}.jpg"),
            ], ['Accept' => 'application/json'])
                ->assertCreated()
                ->assertJsonPath('data.referenceNumber', $newReference)
                ->assertJsonPath('data.status', 'pending');

            $this->assertDatabaseHas('bookings', [
                'id' => $booking->id,
                'payment_reference' => $newReference,
                'status' => 'pending',
            ]);
            $this->assertDatabaseHas('booking_documents', [
                'id' => $receipt->id,
                'file_name' => "corrected-{$index}.jpg",
                'status' => 'pending',
                'remarks' => null,
            ]);
            $this->assertDatabaseCount('booking_documents', $index + 1);
            Storage::disk('public')->assertMissing($oldPath);

            $paymentReference = $serviceCode === 'mass-intention'
                ? $booking->massIntention()->value('payment_reference')
                : $booking->documentRequest()->value('payment_reference');
            $this->assertSame($newReference, $paymentReference);
        }
    }

    public function test_staff_can_remind_and_verify_a_replaceable_sacrament_payment(): void
    {
        config()->set('services.sms.driver', 'database');
        Storage::fake('public');

        $parishioner = User::factory()->create();
        $staff = User::factory()->create(['role' => 'staff']);
        $service = Service::create([
            'code' => 'baptism',
            'name' => 'Baptism',
            'description' => 'Baptism',
        ]);
        $package = ServicePackage::create([
            'service_id' => $service->id,
            'name' => 'Baptism Package',
            'base_price' => 1500,
            'is_active' => true,
        ]);
        $booking = Booking::create([
            'booking_reference' => 'BAP-PAYMENT-TEST',
            'user_id' => $parishioner->id,
            'service_id' => $service->id,
            'service_package_id' => $package->id,
            'booking_slot_id' => null,
        ]);

        Sanctum::actingAs($staff);
        $this->postJson("/api/staff/bookings/{$booking->id}/payment/remind")
            ->assertOk();
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'category' => 'payment_reminder',
        ]);

        Sanctum::actingAs($parishioner);
        $this->post("/api/bookings/{$booking->id}/payment", [
            'reference_number' => '5000000000001',
            'receipt' => UploadedFile::fake()->image('first-receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        Sanctum::actingAs($staff);
        $receiptId = $this->getJson('/api/staff/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'Baptism')
            ->assertJsonPath('data.0.amount', 1500)
            ->json('data.0.id');
        $this->patchJson("/api/staff/transactions/{$receiptId}/status", [
            'status' => 'rejected',
        ])->assertOk()->assertJsonPath('data.status', 'rejected');
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($parishioner);
        $this->post("/api/bookings/{$booking->id}/payment", [
            'reference_number' => '5000000000002',
            'receipt' => UploadedFile::fake()->image('corrected-receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.referenceNumber', '5000000000002')
            ->assertJsonPath('data.status', 'pending');

        Sanctum::actingAs($staff);
        $this->patchJson("/api/staff/transactions/{$receiptId}/status", [
            'status' => 'confirmed',
        ])->assertOk()->assertJsonPath('data.status', 'confirmed');
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'payment_reference' => '5000000000002',
            'status' => 'paid',
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'category' => 'payment_status',
        ]);
    }
}
