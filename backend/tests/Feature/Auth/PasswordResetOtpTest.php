<?php

namespace Tests\Feature\Auth;

use App\Models\SmsMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetOtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_parishioner_can_reset_password_with_sms_otp(): void
    {
        $user = User::factory()->create([
            'role' => 'parishioner', 'phone' => '09171234567', 'password' => 'old-password',
        ]);

        $this->postJson('/api/auth/password/otp', [
            'username' => $user->username, 'phone' => $user->phone, 'portal' => 'parishioner',
        ])->assertOk();

        $sms = SmsMessage::where('user_id', $user->id)->where('category', 'password_reset_otp')->firstOrFail();
        preg_match('/\b(\d{6})\b/', $sms->message, $matches);

        $this->postJson('/api/auth/password/reset', [
            'username' => $user->username,
            'phone' => $user->phone,
            'portal' => 'parishioner',
            'otp' => $matches[1],
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
        $this->assertNotNull($sms->fresh()->sent_at);
    }

    public function test_otp_cannot_cross_between_staff_and_parishioner_portals(): void
    {
        $staff = User::factory()->create(['role' => 'staff', 'phone' => '09171234567']);

        $this->postJson('/api/auth/password/otp', [
            'username' => $staff->username, 'phone' => $staff->phone, 'portal' => 'parishioner',
        ])->assertUnprocessable()->assertJsonValidationErrors('phone');

        $this->assertDatabaseMissing('sms_messages', ['user_id' => $staff->id]);
        $this->assertDatabaseMissing('password_reset_otps', ['user_id' => $staff->id]);
    }

    public function test_otp_is_not_sent_when_phone_does_not_match_username(): void
    {
        $user = User::factory()->create(['role' => 'parishioner', 'phone' => '09171234567']);

        $this->postJson('/api/auth/password/otp', [
            'username' => $user->username,
            'phone' => '09999999999',
            'portal' => 'parishioner',
        ])->assertUnprocessable()->assertJsonValidationErrors('phone');

        $this->assertDatabaseMissing('sms_messages', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('password_reset_otps', ['user_id' => $user->id]);
    }

    public function test_username_and_phone_are_required_to_request_an_otp(): void
    {
        $this->postJson('/api/auth/password/otp', ['portal' => 'parishioner'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username', 'phone']);
    }

    public function test_invalid_otp_is_rejected_and_attempt_is_recorded(): void
    {
        $user = User::factory()->create(['role' => 'staff', 'phone' => '09171234567']);
        $this->postJson('/api/auth/password/otp', [
            'username' => $user->username, 'phone' => $user->phone, 'portal' => 'staff',
        ])->assertOk();

        $this->postJson('/api/auth/password/reset', [
            'username' => $user->username, 'phone' => $user->phone, 'portal' => 'staff', 'otp' => '000000',
            'password' => 'new-password', 'password_confirmation' => 'new-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('otp');

        $this->assertDatabaseHas('password_reset_otps', ['user_id' => $user->id, 'attempts' => 1]);
    }

    public function test_used_otp_cannot_be_reused(): void
    {
        $user = User::factory()->create(['role' => 'staff', 'phone' => '09171234567']);
        $this->postJson('/api/auth/password/otp', ['username' => $user->username, 'phone' => $user->phone, 'portal' => 'staff']);
        $sms = SmsMessage::where('user_id', $user->id)->firstOrFail();
        preg_match('/\b(\d{6})\b/', $sms->message, $matches);
        $payload = [
            'username' => $user->username, 'phone' => $user->phone, 'portal' => 'staff', 'otp' => $matches[1],
            'password' => 'new-password', 'password_confirmation' => 'new-password',
        ];

        $this->postJson('/api/auth/password/reset', $payload)->assertOk();
        $this->postJson('/api/auth/password/reset', $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('otp');
    }
}
