<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\BookingSlot;
use App\Models\DocumentRequestBooking;
use App\Models\MassIntention;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClearSacramentBookingsCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_dry_run_preserves_every_booking(): void
    {
        $bookings = $this->bookings();

        $this->artisan('bookings:clear-sacraments')
            ->expectsOutputToContain('Dry run only')
            ->assertSuccessful();

        foreach ($bookings as $booking) {
            $this->assertDatabaseHas('bookings', ['id' => $booking->id]);
        }
    }

    public function test_execute_clears_only_sacrament_bookings_and_preserves_files_by_default(): void
    {
        Storage::fake('public');
        $bookings = $this->bookings();
        Storage::disk('public')->put('booking-documents/baptism.pdf', 'baptism');
        Storage::disk('public')->put('booking-documents/mass.pdf', 'mass');

        $this->document($bookings['baptism'], 'booking-documents/baptism.pdf');
        $this->document($bookings['mass-intention'], 'booking-documents/mass.pdf');

        $this->artisan('bookings:clear-sacraments', [
            '--execute' => true,
            '--force' => true,
        ])->assertSuccessful();

        foreach (['baptism', 'wedding', 'funeral'] as $code) {
            $this->assertDatabaseMissing('bookings', ['id' => $bookings[$code]->id]);
        }

        foreach (['mass-intention', 'document-request'] as $code) {
            $this->assertDatabaseHas('bookings', ['id' => $bookings[$code]->id]);
        }

        Storage::disk('public')->assertExists('booking-documents/baptism.pdf');
        Storage::disk('public')->assertExists('booking-documents/mass.pdf');
        $this->assertDatabaseMissing('booking_documents', ['booking_id' => $bookings['baptism']->id]);
        $this->assertDatabaseHas('booking_documents', ['booking_id' => $bookings['mass-intention']->id]);
    }

    public function test_delete_files_removes_only_files_attached_to_target_bookings(): void
    {
        Storage::fake('public');
        $bookings = $this->bookings();
        Storage::disk('public')->put('booking-documents/funeral.pdf', 'funeral');
        Storage::disk('public')->put('booking-documents/document-request.pdf', 'document');

        $this->document($bookings['funeral'], 'booking-documents/funeral.pdf');
        $this->document($bookings['document-request'], 'booking-documents/document-request.pdf');

        $this->artisan('bookings:clear-sacraments', [
            '--execute' => true,
            '--delete-files' => true,
            '--force' => true,
        ])->assertSuccessful();

        Storage::disk('public')->assertMissing('booking-documents/funeral.pdf');
        Storage::disk('public')->assertExists('booking-documents/document-request.pdf');
    }

    public function test_cleanup_handles_linked_wedding_preparations_without_removing_accounts_or_slots(): void
    {
        $bookings = $this->bookings();
        $bookings['baptism']->update([
            'wedding_booking_id' => $bookings['wedding']->id,
            'wedding_applicant_role' => 'bride',
        ]);
        $this->artisan('bookings:clear-sacraments', ['--execute' => true, '--force' => true])->assertSuccessful();
        $this->assertDatabaseMissing('bookings', ['id' => $bookings['wedding']->id]);
        $this->assertDatabaseMissing('bookings', ['id' => $bookings['baptism']->id]);
        $this->assertDatabaseHas('users', ['id' => $bookings['wedding']->user_id]);
        $this->assertDatabaseHas('booking_slots', ['id' => $bookings['wedding']->booking_slot_id]);
        $this->assertDatabaseHas('bookings', ['id' => $bookings['document-request']->id]);
    }

    public function test_all_bookings_preview_keeps_records_and_uploads(): void
    {
        Storage::fake('public');
        $bookings = $this->bookings();
        Storage::disk('public')->put('booking-documents/receipt.jpg', 'receipt');
        $this->document($bookings['document-request'], 'booking-documents/receipt.jpg');

        $this->artisan('bookings:clear-sacraments', ['--all-bookings' => true, '--delete-files' => true])
            ->expectsOutputToContain('Dry run only')->assertSuccessful();
        $this->assertDatabaseCount('bookings', 5);
        Storage::disk('public')->assertExists('booking-documents/receipt.jpg');
    }

    public function test_all_bookings_cleanup_preserves_accounts_slots_and_unrelated_uploads(): void
    {
        Storage::fake('public');
        $bookings = $this->bookings();
        foreach ($bookings as $code => $booking) {
            $path = "booking-documents/{$code}.pdf";
            Storage::disk('public')->put($path, 'requirement or receipt');
            $this->document($booking, $path);
        }
        Storage::disk('public')->put('announcements/banner.jpg', 'keep');
        Storage::disk('public')->put('profile-photos/avatar.jpg', 'keep');
        DocumentRequestBooking::create(['booking_id' => $bookings['document-request']->id, 'total_amount' => 100]);
        $serviceCount = Service::count();
        $mass = MassIntention::create([
            'booking_id' => $bookings['mass-intention']->id,
            'intention_date' => today()->addWeek(),
            'payment_reference' => 'CLEAR-MASS', 'total_amount' => 100,
        ]);
        $mass->entries()->create(['intention_type' => 'thanksgiving', 'names' => ['Test Person'], 'amount' => 100]);

        $this->artisan('bookings:clear-sacraments', [
            '--all-bookings' => true, '--execute' => true, '--force' => true, '--delete-files' => true,
        ])->assertSuccessful();

        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('document_request_bookings', 0);
        $this->assertDatabaseCount('mass_intentions', 0);
        $this->assertDatabaseCount('mass_intention_entries', 0);
        $this->assertDatabaseCount('booking_documents', 0);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('booking_slots', 5);
        $this->assertDatabaseCount('services', $serviceCount);
        foreach (array_keys($bookings) as $code) {
            Storage::disk('public')->assertMissing("booking-documents/{$code}.pdf");
        }
        Storage::disk('public')->assertExists('announcements/banner.jpg');
        Storage::disk('public')->assertExists('profile-photos/avatar.jpg');
    }

    public function test_production_cleanup_requires_force(): void
    {
        $this->bookings();
        $this->app->instance('env', 'production');
        $this->artisan('bookings:clear-sacraments', ['--all-bookings' => true, '--execute' => true])->assertFailed();
        $this->assertDatabaseCount('bookings', 5);
    }

    /** @return array<string, Booking> */
    private function bookings(): array
    {
        $user = User::factory()->create();
        $bookings = [];

        foreach (['baptism', 'wedding', 'funeral', 'mass-intention', 'document-request'] as $index => $code) {
            $service = Service::create([
                'code' => $code,
                'name' => str($code)->replace('-', ' ')->title()->toString(),
                'description' => $code,
            ]);
            $slot = BookingSlot::create([
                'service_id' => $service->id,
                'booking_date' => today()->addWeek(),
                'start_time' => sprintf('%02d:00', 8 + $index),
                'end_time' => sprintf('%02d:00', 9 + $index),
                'capacity' => 1,
            ]);

            $bookings[$code] = Booking::create([
                'booking_reference' => 'CLEAR-'.strtoupper($code),
                'user_id' => $user->id,
                'service_id' => $service->id,
                'booking_slot_id' => $slot->id,
                'status' => 'pending',
            ]);
        }

        return $bookings;
    }

    private function document(Booking $booking, string $path): void
    {
        BookingDocument::create([
            'booking_id' => $booking->id,
            'document_type' => 'test_document',
            'file_name' => basename($path),
            'file_path' => $path,
            'status' => 'pending',
        ]);
    }
}
