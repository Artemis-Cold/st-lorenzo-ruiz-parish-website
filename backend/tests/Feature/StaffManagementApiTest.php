<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\DocumentRequestBooking;
use App\Models\DocumentRequestItem;
use App\Models\MassIntention;
use App\Models\MassIntentionEntry;
use App\Models\PackageAddon;
use App\Models\PackageInclusion;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_list_and_process_service_bookings(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $parishioner = User::factory()->create();
        Sanctum::actingAs($staff);

        $booking = $this->booking($parishioner, 'wedding');
        $package = ServicePackage::create([
            'service_id' => $booking->service_id,
            'name' => 'Wedding Package',
            'base_price' => 10000,
            'is_active' => true,
        ]);
        $addon = PackageAddon::create([
            'service_package_id' => $package->id,
            'name' => 'Choir',
            'price' => 2500,
        ]);
        PackageInclusion::create([
            'service_package_id' => $package->id,
            'name' => 'Rite Fee',
            'price' => 500,
        ]);
        $booking->update(['service_package_id' => $package->id]);
        $booking->selectedAddons()->attach($addon->id);

        $this->getJson('/api/staff/bookings')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'Marriage')
            ->assertJsonPath('data.0.amount', 13000)
            ->assertJsonPath('data.0.details.packageName', 'Wedding Package')
            ->assertJsonPath('data.0.names', $parishioner->full_name);

        $this->patchJson("/api/staff/bookings/{$booking->id}/status", [
            'status' => 'approved',
        ])->assertOk()->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'approved',
            'processed_by' => $staff->id,
        ]);
    }

    public function test_staff_can_list_and_process_mass_intentions(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $parishioner = User::factory()->create();
        Sanctum::actingAs($staff);

        $booking = $this->booking($parishioner, 'mass-intention');
        $booking->update(['status' => 'paid']);
        $intention = MassIntention::create([
            'booking_id' => $booking->id,
            'intention_date' => '2026-08-20',
            'payment_reference' => 'MASS-PAYMENT-1',
            'total_amount' => 100,
        ]);
        MassIntentionEntry::create([
            'mass_intention_id' => $intention->id,
            'intention_type' => 'Thanksgiving',
            'names' => ['Juan Dela Cruz'],
            'amount' => 100,
        ]);
        BookingDocument::create([
            'booking_id' => $booking->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'mass-receipt.jpg',
            'file_path' => 'booking-documents/mass-receipt.jpg',
        ]);

        $this->getJson('/api/staff/mass-intentions')
            ->assertOk()
            ->assertJsonPath('data.0.names', 'Juan Dela Cruz')
            ->assertJsonPath('data.0.paymentReference', 'MASS-PAYMENT-1')
            ->assertJsonPath('data.0.receipt.fileName', 'mass-receipt.jpg')
            ->assertJsonPath('data.0.type', 'Thanksgiving')
            ->assertJsonPath('data.0.status', 'paid');

        $transaction = $this->getJson('/api/staff/transactions')
            ->assertOk()
            ->assertJsonPath('data.0.reference', 'MASS-PAYMENT-1')
            ->assertJsonPath('data.0.status', 'pending');

        $receiptId = $transaction->json('data.0.id');
        $this->patchJson("/api/staff/transactions/{$receiptId}/status", [
            'status' => 'confirmed',
        ])->assertOk()->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'paid',
            'processed_by' => $staff->id,
        ]);
    }

    public function test_staff_can_list_and_process_document_requests(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $parishioner = User::factory()->create();
        Sanctum::actingAs($staff);

        $booking = $this->booking($parishioner, 'document-request');
        $request = DocumentRequestBooking::create([
            'booking_id' => $booking->id,
            'payment_reference' => 'DOCUMENT-PAYMENT-1',
            'total_amount' => 100,
        ]);
        $item = DocumentRequestItem::create([
            'document_request_booking_id' => $request->id,
            'document_type' => 'Baptismal Certificate',
            'details' => ['name' => 'Juan Dela Cruz'],
            'price' => 100,
        ]);
        DocumentRequestItem::create([
            'document_request_booking_id' => $request->id,
            'document_type' => 'Confirmation Certificate',
            'details' => ['name' => 'Juan Dela Cruz'],
            'price' => 100,
        ]);
        $request->update(['total_amount' => 200]);
        BookingDocument::create([
            'booking_id' => $booking->id,
            'document_type' => 'payment_receipt',
            'file_name' => 'document-receipt.jpg',
            'file_path' => 'booking-documents/document-receipt.jpg',
        ]);

        $this->getJson('/api/staff/document-requests')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(2, 'data.0.documents')
            ->assertJsonPath('data.0.amount', 200)
            ->assertJsonPath('data.0.paymentReference', 'DOCUMENT-PAYMENT-1')
            ->assertJsonPath('data.0.receipt.fileName', 'document-receipt.jpg')
            ->assertJsonPath('data.0.name', $parishioner->full_name);

        $this->patchJson("/api/staff/document-requests/{$request->id}/status", [
            'status' => 'approved',
        ])->assertOk()->assertJsonPath('data.status', 'approved');

        $this->patchJson("/api/staff/document-requests/{$request->id}/status", [
            'status' => 'ready_for_pickup',
        ])->assertOk()->assertJsonPath('data.status', 'ready_for_pickup');

        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'category' => 'document_status',
            'message' => "St. Lorenzo Parish: Your Baptismal Certificate and Confirmation Certificate request ({$booking->booking_reference}) is ready for pickup. Please visit the parish office during office hours.",
        ]);

        $this->patchJson("/api/staff/document-requests/{$request->id}/status", [
            'status' => 'completed',
        ])->assertOk()->assertJsonPath('data.status', 'completed');
    }

    public function test_parishioners_cannot_access_staff_management_apis(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'parishioner']));

        $this->getJson('/api/staff/bookings')->assertForbidden();
        $this->getJson('/api/staff/mass-intentions')->assertForbidden();
        $this->getJson('/api/staff/document-requests')->assertForbidden();
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $booking = $this->booking(User::factory()->create(), 'wedding');
        $booking->update(['status' => 'completed']);

        $this->patchJson("/api/staff/bookings/{$booking->id}/status", [
            'status' => 'approved',
        ])->assertUnprocessable()->assertJsonValidationErrors('status');
    }

    public function test_staff_dashboard_returns_live_statistics_and_activity(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $parishioner = User::factory()->create();
        $this->booking($parishioner, 'wedding');
        $this->booking($parishioner, 'document-request');
        $this->booking($parishioner, 'mass-intention');

        Announcement::create([
            'created_by' => auth()->id(),
            'title' => 'Office Schedule',
            'details' => 'The office opens at 9:00 AM.',
            'posted_at' => now()->subMinute(),
        ]);

        $this->getJson('/api/staff/dashboard')
            ->assertOk()
            ->assertJsonPath('data.stats.bookingsToday', 1)
            ->assertJsonPath('data.stats.pendingBookings', 1)
            ->assertJsonPath('data.stats.pendingDocumentRequests', 1)
            ->assertJsonPath('data.stats.massIntentions', 1)
            ->assertJsonPath('data.announcements.0.title', 'Office Schedule')
            ->assertJsonCount(3, 'data.recentActivity');
    }

    private function booking(User $user, string $serviceCode): Booking
    {
        $service = Service::create([
            'code' => $serviceCode,
            'name' => $serviceCode,
            'description' => $serviceCode,
            'is_active' => true,
        ]);

        return Booking::create([
            'booking_reference' => strtoupper($serviceCode).'-'.fake()->unique()->numerify('####'),
            'user_id' => $user->id,
            'service_id' => $service->id,
            'booking_slot_id' => null,
            'status' => 'pending',
        ]);
    }
}
