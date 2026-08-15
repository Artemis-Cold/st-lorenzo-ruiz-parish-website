<?php

namespace Tests\Feature;

use App\Jobs\SendSmsMessage;
use App\Models\Booking;
use App\Models\Service;
use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SmsNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_wedding_schedule_is_saved_and_sms_is_queued(): void
    {
        Queue::fake();
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $parishioner = User::factory()->create(['phone' => '09171234567']);
        $service = Service::create(['code' => 'wedding', 'name' => 'Wedding', 'description' => 'Wedding']);
        $booking = Booking::create([
            'booking_reference' => 'WED-SMS-1', 'user_id' => $parishioner->id,
            'service_id' => $service->id, 'booking_slot_id' => null,
        ]);

        $this->postJson("/api/staff/bookings/{$booking->id}/appointments", [
            'type' => 'seminar',
            'scheduledAt' => now()->addDay()->toIso8601String(),
            'venue' => 'Parish Hall',
            'notes' => 'Bring valid IDs.',
        ])->assertCreated()->assertJsonPath('data.venue', 'Parish Hall');

        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'recipient' => '639171234567',
            'category' => 'seminar',
        ]);
        Queue::assertPushed(SendSmsMessage::class);
    }

    public function test_semaphore_job_records_a_successful_send(): void
    {
        config()->set('services.sms.driver', 'semaphore');
        config()->set('services.semaphore.api_key', 'secret-key');
        Http::fake(['api.semaphore.co/*' => Http::response([[
            'message_id' => 123, 'status' => 'Queued',
        ]])]);
        $sms = SmsMessage::create([
            'category' => 'document_status', 'recipient' => '639171234567',
            'message' => 'Your request is approved.',
        ]);

        (new SendSmsMessage($sms->id))->handle();

        Http::assertSent(fn ($request) => $request->url() === 'https://api.semaphore.co/api/v4/messages'
            && $request['apikey'] === 'secret-key'
            && $request['number'] === '639171234567'
            && $request['message'] === 'Your request is approved.'
        );

        $this->assertDatabaseHas('sms_messages', [
            'id' => $sms->id, 'status' => 'sent', 'provider_message_id' => '123',
        ]);
    }

    public function test_log_driver_records_sms_without_calling_a_provider(): void
    {
        config()->set('services.sms.driver', 'log');
        Http::fake();
        $sms = SmsMessage::create([
            'category' => 'document_status', 'recipient' => '639171234567',
            'message' => 'Your request is approved.',
        ]);

        (new SendSmsMessage($sms->id))->handle();

        Http::assertNothingSent();
        $this->assertDatabaseHas('sms_messages', [
            'id' => $sms->id, 'status' => 'sent',
            'provider_message_id' => 'log-'.$sms->id,
        ]);
    }

    public function test_signup_rejects_a_duplicate_contact_number(): void
    {
        User::factory()->create(['phone' => '09171234567']);

        $this->postJson('/api/auth/register', [
            'username' => 'differentuser',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'phone' => '09171234567',
        ])->assertUnprocessable()->assertJsonValidationErrors('phone');
    }
}
