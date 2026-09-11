<?php

namespace Tests\Feature;

use App\Models\PhoneVerificationOtp;
use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhoneVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_an_unverified_account_and_sends_a_verification_reminder(): void
    {
        config(['services.sms.driver' => 'database']);

        $response = $this->postJson('/api/auth/register', [
            'first_name' => 'Juan Carlos',
            'last_name' => 'Cruz',
            'phone' => '09171234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms_accepted' => true,
        ])->assertCreated()
            ->assertJsonPath('user.username', 'juan')
            ->assertJsonPath('user.phone_verified', false)
            ->assertJsonPath('verification.required', true)
            ->assertJsonPath('verification.otp_sent', false)
            ->assertJsonPath('verification.reminder_sent', true);

        $user = User::where('username', 'juan')->firstOrFail();

        $this->assertNull($user->phone_verified_at);
        $this->assertDatabaseMissing('phone_verification_otps', [
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'user_id' => $user->id,
            'category' => 'registration_verification_reminder',
            'recipient' => '639171234567',
        ]);
        $this->assertStringContainsString(
            'verify your mobile number in Account Settings',
            SmsMessage::latest('id')->value('message')
        );
        $this->withToken($response->json('token'))
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.phone_verified', false);
    }

    public function test_unverified_parishioner_can_request_a_verification_code(): void
    {
        config(['services.sms.driver' => 'database']);
        $user = User::factory()->unverified()->create([
            'phone' => '09171234567',
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/profile/phone-verification/otp')
            ->assertOk()
            ->assertJsonPath(
                'message',
                'A verification code was sent to your mobile number.'
            );

        $this->assertDatabaseHas('phone_verification_otps', [
            'user_id' => $user->id,
            'attempts' => 0,
        ]);
        $this->assertDatabaseHas('sms_messages', [
            'user_id' => $user->id,
            'category' => 'phone_verification_otp',
            'recipient' => '639171234567',
            'status' => 'pending',
        ]);
        $this->assertStringContainsString(
            'mobile verification code',
            SmsMessage::latest('id')->value('message')
        );
    }

    public function test_valid_code_verifies_the_parishioner_phone_number(): void
    {
        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user);

        PhoneVerificationOtp::create([
            'user_id' => $user->id,
            'code_hash' => hash('sha256', '123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson('/api/profile/phone-verification/verify', [
            'otp' => '123456',
        ])->assertOk()
            ->assertJsonPath('user.phone_verified', true);

        $this->assertNotNull($user->fresh()->phone_verified_at);
        $this->assertNotNull(
            PhoneVerificationOtp::latest('id')->value('consumed_at')
        );
    }

    public function test_invalid_code_does_not_verify_the_phone_number(): void
    {
        $user = User::factory()->unverified()->create();
        Sanctum::actingAs($user);

        PhoneVerificationOtp::create([
            'user_id' => $user->id,
            'code_hash' => hash('sha256', '123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson('/api/profile/phone-verification/verify', [
            'otp' => '654321',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['otp']);

        $this->assertNull($user->fresh()->phone_verified_at);
        $this->assertSame(
            1,
            PhoneVerificationOtp::latest('id')->value('attempts')
        );
    }

    public function test_unverified_phone_is_blocked_from_all_booking_creation_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->unverified()->create());

        foreach ([
            '/api/bookings/baptism',
            '/api/bookings/wedding',
            '/api/bookings/funeral',
            '/api/bookings/mass-intention',
            '/api/bookings/document-request',
        ] as $endpoint) {
            $this->postJson($endpoint)
                ->assertForbidden()
                ->assertJsonPath('code', 'phone_verification_required');
        }
    }

    public function test_changing_phone_number_removes_existing_verification(): void
    {
        $user = User::factory()->create([
            'phone' => '09171234567',
            'phone_verified_at' => now(),
        ]);
        Sanctum::actingAs($user);

        $this->patchJson('/api/profile', [
            'first_name' => $user->first_name,
            'middle_initial' => $user->middle_initial,
            'last_name' => $user->last_name,
            'suffix' => $user->suffix,
            'phone' => '09181234567',
            'birth_date' => $user->birth_date->toDateString(),
            'gender' => $user->gender,
            'house_no' => $user->house_no,
            'street' => $user->street,
            'barangay' => $user->barangay,
            'municipality' => $user->municipality,
            'province' => $user->province,
            'zip_code' => $user->zip_code,
        ])->assertOk()
            ->assertJsonPath('user.phone_verified', false);

        $this->assertNull($user->fresh()->phone_verified_at);
    }
}
