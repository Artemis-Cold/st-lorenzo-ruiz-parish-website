<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CashPaymentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_parishioner_can_switch_payment_methods_until_staff_confirms_cash(): void
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
            'booking_reference' => 'BAP-CASH-SWITCH',
            'user_id' => $parishioner->id,
            'service_id' => $service->id,
            'service_package_id' => $package->id,
            'status' => 'pending',
        ]);

        Sanctum::actingAs($parishioner);
        $this->postJson("/api/bookings/{$booking->id}/payment", [
            'payment_method' => 'cash',
        ])->assertCreated()
            ->assertJsonPath('data.method', 'cash')
            ->assertJsonPath('data.status', 'awaiting_payment')
            ->assertJsonPath('data.receipt', null);

        $cashAttempt = $booking->payments()->sole();

        $this->post("/api/bookings/{$booking->id}/payment", [
            'payment_method' => 'gcash',
            'reference_number' => '9000000000001',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.method', 'gcash')
            ->assertJsonPath('data.status', 'pending_verification');

        $this->assertDatabaseHas('payments', [
            'id' => $cashAttempt->id,
            'status' => 'voided',
        ]);

        $gcashAttempt = $booking->payments()->latest('id')->firstOrFail();
        $this->postJson("/api/bookings/{$booking->id}/payment", [
            'payment_method' => 'cash',
        ])->assertCreated()
            ->assertJsonPath('data.method', 'cash')
            ->assertJsonPath('data.status', 'awaiting_payment');

        $this->assertDatabaseHas('payments', [
            'id' => $gcashAttempt->id,
            'status' => 'voided',
        ]);
        $this->assertDatabaseHas('booking_documents', [
            'id' => $gcashAttempt->receipt_document_id,
            'status' => 'rejected',
            'remarks' => 'Payment method changed by the parishioner.',
        ]);

        $activeCash = $booking->payments()->latest('id')->firstOrFail();
        Sanctum::actingAs($staff);
        $this->patchJson("/api/staff/transactions/{$activeCash->id}/status", [
            'status' => 'confirmed',
            'amount_received' => 1400,
            'official_receipt_number' => 'OR-2026-0001',
        ])->assertUnprocessable()->assertJsonValidationErrors('amount_received');

        $this->patchJson("/api/staff/transactions/{$activeCash->id}/status", [
            'status' => 'confirmed',
            'amount_received' => 1500,
            'official_receipt_number' => 'OR-2026-0001',
            'notes' => 'Paid at the parish office.',
        ])->assertOk()
            ->assertJsonPath('data.method', 'cash')
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.officialReceiptNumber', 'OR-2026-0001');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
            'processed_by' => $staff->id,
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'category' => 'payment_status',
        ]);
        $this->assertStringContainsString(
            'OR: OR-2026-0001',
            SmsMessage::where('booking_id', $booking->id)->latest('id')->value('message'),
        );

        Sanctum::actingAs($parishioner);
        $this->postJson("/api/bookings/{$booking->id}/payment", [
            'payment_method' => 'gcash',
        ])->assertUnprocessable()->assertJsonValidationErrors('payment_method');
    }
}
