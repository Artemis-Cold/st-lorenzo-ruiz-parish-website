<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\SmsMessage;
use App\Models\User;
use App\Services\BookingRequirementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BookingPendingSmsTest extends TestCase
{
    use RefreshDatabase;

    public static function services(): array
    {
        return [['baptism'], ['wedding'], ['funeral']];
    }

    #[DataProvider('services')]
    public function test_initial_sms_confirms_pending_reservation_without_listing_missing_documents(string $code): void
    {
        config(['services.sms.driver' => 'database']);
        $user = User::factory()->create();
        $service = Service::create(['code' => $code, 'name' => ucfirst($code), 'description' => $code]);
        $slot = BookingSlot::create([
            'service_id' => $service->id, 'booking_date' => '2026-12-05',
            'start_time' => '13:00:00', 'end_time' => '14:00:00', 'is_active' => true,
        ]);
        $booking = Booking::create([
            'user_id' => $user->id, 'service_id' => $service->id,
            'booking_slot_id' => $slot->id, 'booking_reference' => 'TEST-PENDING',
            'status' => 'pending',
        ]);
        $requirements = app(BookingRequirementService::class);
        $requirements->notifySubmitted($booking);
        $this->assertDatabaseCount('sms_messages', 1);
        $sms = SmsMessage::sole();
        $this->assertSame('booking_pending', $sms->category);
        foreach (['TEST-PENDING', 'PENDING', 'December 5, 2026', '1:00 PM', 'reserved, subject to parish approval', 'as soon as possible through My Profile'] as $text) {
            $this->assertStringContainsString($text, $sms->message);
        }
        $this->assertStringNotContainsString('Missing requirements:', $sms->message);
        $this->assertStringContainsString($code === 'baptism' ? 'Your place in the selected baptism session' : 'Your selected schedule', $sms->message);

        // A complete submission should receive acknowledgement, not a request to re-upload.
        foreach ($requirements->missing($booking) as $requirement) {
            $booking->documents()->create([
                'document_type' => $requirement['types'][0], 'file_name' => 'test.pdf',
                'file_path' => 'test.pdf', 'status' => 'pending',
            ]);
        }
        $requirements->notifySubmitted($booking->fresh());
        $message = SmsMessage::latest('id')->first()->message;
        $this->assertStringContainsString('Your submitted documents are awaiting parish staff review.', $message);
        $this->assertStringNotContainsString('Please submit all required documents', $message);

        $booking->update(['status' => 'cancelled']);
        $requirements->notifySubmitted($booking->fresh());
        $this->assertDatabaseCount('sms_messages', 2);
    }
}
