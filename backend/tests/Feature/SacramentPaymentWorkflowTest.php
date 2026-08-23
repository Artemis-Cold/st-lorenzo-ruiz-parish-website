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
            'reference_number' => 'GCASH-BAP-001',
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
            'reference_number' => 'GCASH-BAP-002',
            'receipt' => UploadedFile::fake()->image('corrected-receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.referenceNumber', 'GCASH-BAP-002')
            ->assertJsonPath('data.status', 'pending');

        Sanctum::actingAs($staff);
        $this->patchJson("/api/staff/transactions/{$receiptId}/status", [
            'status' => 'confirmed',
        ])->assertOk()->assertJsonPath('data.status', 'confirmed');
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'payment_reference' => 'GCASH-BAP-002',
            'status' => 'paid',
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'category' => 'payment_status',
        ]);
    }
}
