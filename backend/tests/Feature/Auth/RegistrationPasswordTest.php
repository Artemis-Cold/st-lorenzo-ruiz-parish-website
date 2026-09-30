<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RegistrationPasswordTest extends TestCase
{
    use RefreshDatabase;

    public static function invalidPasswords(): array
    {
        return [
            'too short' => ['Abc1234'],
            'no uppercase' => ['abcdefgh1'],
            'no lowercase' => ['ABCDEFGH1'],
            'no number' => ['Abcdefgh'],
            'empty' => [''],
            'not a string' => [['Abcdefg1']],
        ];
    }

    #[DataProvider('invalidPasswords')]
    public function test_signup_rejects_passwords_that_do_not_meet_requirements(mixed $password): void
    {
        $this->postJson('/api/auth/register', $this->payload($password))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('sms_messages', 0);
    }

    public function test_eight_characters_with_each_required_character_type_is_accepted(): void
    {
        $this->postJson('/api/auth/register', $this->payload('Abcdefg1'))
            ->assertCreated()
            ->assertJsonPath('verification.otp_sent', false);
    }

    public function test_password_confirmation_must_still_match(): void
    {
        $this->postJson('/api/auth/register', [
            ...$this->payload('Abcdefg1'),
            'password_confirmation' => 'Abcdefg2',
        ])->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    private function payload(mixed $password): array
    {
        return [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'phone' => '09171234567',
            'password' => $password,
            'password_confirmation' => $password,
            'terms_accepted' => true,
        ];
    }
}
