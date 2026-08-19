<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingDocument;
use App\Models\BookingSlot;
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
