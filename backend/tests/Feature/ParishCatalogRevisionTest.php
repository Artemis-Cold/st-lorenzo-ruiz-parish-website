<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\User;
use App\Support\ParishCatalog;
use Database\Seeders\ServiceFeeSeeder;
use Database\Seeders\ServicePackageSeeder;
use Database\Seeders\ServiceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ParishCatalogRevisionTest extends TestCase
{
    use RefreshDatabase;

    public function test_retired_document_requests_are_blocked_and_new_names_are_available(): void
    {
        $this->catalog();
        foreach (['Request of Permission', 'Permission of Marriage Banns', 'Publication of Marriage Banns', 'Death Certificate', 'Baptism Permission', 'Confirmation Permission'] as $type) {
            $this->postJson('/api/bookings/document-request', ['requests' => [['document_type' => $type, 'details' => $this->permit()]]])
                ->assertUnprocessable()->assertInvalid('requests.0.document_type');
        }
        $names = $this->getJson('/api/services/document-request/fees')->assertOk()->json('data.*.name');
        $this->assertContains('Funeral Certificate', $names);
        $this->assertContains('Baptism Permit', $names);
        $this->assertContains('Confirmation Permit', $names);
        $this->assertNotContains('Request of Permission', $names);
        $this->assertNotContains('Publication of Marriage Banns', $names);
    }

    private function catalog(): void
    {
        $this->seed([ServiceSeeder::class, ServicePackageSeeder::class, ServiceFeeSeeder::class]);
        Storage::fake('public');
        config(['services.sms.driver' => 'database']);
        Sanctum::actingAs(User::factory()->create());
    }

    private function permit(): array
    {
        return ['requester_name' => 'Juan Cruz', 'requester_address' => 'Tanza', 'person_name' => 'Ana Cruz', 'parish_name' => 'St. Lorenzo Ruiz Parish', 'event_date' => now()->addWeek()->toDateString(), 'event_time' => '10:30'];
    }

    public function test_catalog_prices_and_inclusions_and_legacy_price_preservation(): void
    {
        $this->catalog();
        $baptism = Service::firstWhere('code', 'baptism');
        $package = $baptism->packages()->where('is_active', true)->sole();
        $this->assertSame(2500.0, (float) $package->base_price);
        $this->assertSame(ParishCatalog::BAPTISM_INCLUSIONS, $package->inclusions->pluck('name')->all());
        $this->assertSame(0.0, (float) $package->inclusions->sum('price'));
        foreach (['confirmation' => 575, 'first-communion' => 0] as $code => $price) {
            $this->assertSame((float) $price, (float) Service::firstWhere('code', $code)->packages()->sole()->base_price);
        }
        $legacy = ServicePackage::create(['service_id' => $baptism->id, 'name' => 'Sunday', 'base_price' => 800, 'is_active' => true]);
        $booking = Booking::create(['booking_reference' => 'OLD-PRICE', 'user_id' => User::factory()->create()->id, 'service_id' => $baptism->id, 'service_package_id' => $legacy->id, 'status' => 'pending']);
        $migration = require database_path('migrations/2026_10_16_000001_update_parish_catalog.php');
        $migration->up();
        $migration->up();
        $this->assertSame(800.0, (float) $booking->fresh()->total_amount);
        $this->assertNotNull($booking->fresh()->pricing_snapshot);
        $this->assertFalse((bool) $legacy->fresh()->is_active);
        $this->assertSame(1, $baptism->packages()->where('is_active', true)->count());
    }

    public function test_free_death_permit_needs_no_payment_and_can_be_prepared(): void
    {
        $this->catalog();
        $response = $this->postJson('/api/bookings/document-request', ['requests' => [['document_type' => 'Death Permit', 'price' => 999, 'details' => $this->permit()]]])->assertCreated();
        $booking = Booking::findOrFail($response->json('data.id'));
        $this->assertSame(0.0, (float) $booking->documentRequest->total_amount);
        $this->assertSame(0, $booking->payments()->count());
        $this->assertNull($booking->payment_reference);
        $this->post('/api/bookings/'.$booking->id.'/payment', ['payment_method' => 'gcash', 'reference_number' => '9000000000001', 'receipt' => UploadedFile::fake()->image('receipt.jpg')], ['Accept' => 'application/json'])->assertUnprocessable()->assertInvalid('payment_method');
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $this->patchJson('/api/staff/document-requests/'.$booking->documentRequest->id.'/status', ['status' => 'ready_for_pickup'])->assertOk();
        $this->assertDatabaseHas('sms_messages', ['booking_id' => $booking->id, 'category' => 'document_status']);
    }

    public function test_new_paid_documents_use_server_prices_and_validate_permit_fields(): void
    {
        $this->catalog();
        foreach (['Baptism Permit' => 100, 'Confirmation Permit' => 100, 'First Communion Certificate' => 100] as $type => $price) {
            $details = $type === 'First Communion Certificate' ? ['name' => 'Ana Cruz', 'address' => 'Tanza', 'communion_date' => '2020-01-01', 'relationship_to_owner' => 'Self'] : $this->permit();
            $payload = ['requests' => [['document_type' => $type, 'price' => 0, 'details' => $details]]];
            $this->postJson('/api/bookings/document-request', $payload)->assertUnprocessable()->assertInvalid(['reference_number', 'receipt']);
            $payload['reference_number'] = (string) (7000000000000 + Booking::count());
            $payload['receipt'] = UploadedFile::fake()->image('receipt.jpg');
            $response = $this->post('/api/bookings/document-request', $payload, ['Accept' => 'application/json'])->assertCreated();
            $this->assertSame((float) $price, (float) Booking::findOrFail($response->json('data.id'))->documentRequest->total_amount);
        }
        $this->postJson('/api/bookings/document-request', ['requests' => [['document_type' => 'Death Permit', 'details' => ['requester_name' => 'Juan']]]])->assertUnprocessable()->assertInvalid(['requests.0.details.person_name', 'requests.0.details.event_date', 'requests.0.details.event_time']);
    }

    public function test_mixed_free_and_paid_documents_still_require_payment(): void
    {
        $this->catalog();
        $payload = ['requests' => [
            ['document_type' => 'Death Permit', 'details' => $this->permit()],
            ['document_type' => 'Confirmation Permit', 'details' => $this->permit()],
        ]];
        $this->postJson('/api/bookings/document-request', $payload)->assertUnprocessable()->assertInvalid(['reference_number', 'receipt']);
        $payload += ['reference_number' => '8888888888888', 'receipt' => UploadedFile::fake()->image('receipt.jpg')];
        $id = $this->post('/api/bookings/document-request', $payload, ['Accept' => 'application/json'])->assertCreated()->json('data.id');
        $booking = Booking::findOrFail($id);
        $this->assertSame(100.0, (float) $booking->documentRequest->total_amount);
        $this->assertSame(100.0, (float) $booking->payments()->sole()->amount);
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $this->patchJson('/api/staff/document-requests/'.$booking->documentRequest->id.'/status', ['status' => 'ready_for_pickup'])->assertUnprocessable();
    }
}
