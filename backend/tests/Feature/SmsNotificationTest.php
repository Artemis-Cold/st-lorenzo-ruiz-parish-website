<?php

namespace Tests\Feature;

use App\Jobs\SendSmsMessage;
use App\Models\Booking;
use App\Models\Service;
use App\Models\SmsMessage;
use App\Models\User;
use App\Services\SmsNotificationService;
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

    public function test_baptism_seminar_is_set_by_staff_and_sms_is_queued(): void
    {
        Queue::fake();
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $parishioner = User::factory()->create(['phone' => '09181234567']);
        $service = Service::create(['code' => 'baptism', 'name' => 'Baptism', 'description' => 'Baptism']);
        $booking = Booking::create([
            'booking_reference' => 'BPT-SMS-1', 'user_id' => $parishioner->id,
            'service_id' => $service->id, 'booking_slot_id' => null,
        ]);

        $this->postJson("/api/staff/bookings/{$booking->id}/appointments", [
            'type' => 'seminar',
            'scheduledAt' => now()->addDays(2)->toIso8601String(),
            'venue' => 'Parish Formation Hall',
            'notes' => 'Parents and godparents must attend.',
        ])->assertCreated()
            ->assertJsonPath('data.type', 'seminar')
            ->assertJsonPath('data.venue', 'Parish Formation Hall');

        $this->assertDatabaseHas('booking_appointments', [
            'booking_id' => $booking->id,
            'type' => 'seminar',
            'venue' => 'Parish Formation Hall',
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'booking_id' => $booking->id,
            'recipient' => '639181234567',
            'category' => 'baptism_seminar',
        ]);
        $this->assertStringContainsString(
            'Your baptism seminar',
            SmsMessage::query()->where('booking_id', $booking->id)->value('message')
        );
        Queue::assertPushed(SendSmsMessage::class);
    }

    public function test_baptism_cannot_be_given_a_priest_interview_schedule(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $parishioner = User::factory()->create();
        $service = Service::create(['code' => 'baptism', 'name' => 'Baptism', 'description' => 'Baptism']);
        $booking = Booking::create([
            'booking_reference' => 'BPT-SMS-2', 'user_id' => $parishioner->id,
            'service_id' => $service->id, 'booking_slot_id' => null,
        ]);

        $this->postJson("/api/staff/bookings/{$booking->id}/appointments", [
            'type' => 'priest_interview',
            'scheduledAt' => now()->addDays(2)->toIso8601String(),
            'venue' => 'Parish Office',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('type');
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

    public function test_database_driver_stores_pending_sms_without_dispatching_a_job(): void
    {
        Queue::fake();
        config()->set('services.sms.driver', 'database');
        $user = User::factory()->create(['phone' => '09171234567']);

        app(SmsNotificationService::class)->queueToUser(
            $user,
            'booking_requirements',
            'Your booking has incomplete requirements.',
        );

        $this->assertDatabaseHas('sms_messages', [
            'user_id' => $user->id,
            'recipient' => '639171234567',
            'status' => 'pending',
        ]);
        Queue::assertNothingPushed();
    }

    public function test_semaphore_failure_does_not_break_a_sync_web_request(): void
    {
        config()->set('queue.default', 'sync');
        config()->set('services.sms.driver', 'semaphore');
        config()->set('services.semaphore.api_key', 'secret-key');
        Http::fake(['api.semaphore.co/*' => Http::response([
            ['senderName' => 'No active sender name found.'],
        ], 500)]);
        $sms = SmsMessage::create([
            'category' => 'booking_requirements',
            'recipient' => '639171234567',
            'message' => 'Your booking has incomplete requirements.',
        ]);

        (new SendSmsMessage($sms->id))->handle();

        $this->assertDatabaseHas('sms_messages', [
            'id' => $sms->id,
            'status' => 'failed',
        ]);
        $this->assertNotNull($sms->fresh()->error_message);
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
