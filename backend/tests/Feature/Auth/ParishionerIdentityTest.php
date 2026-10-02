<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ParishionerIdentityTest extends TestCase
{
    use RefreshDatabase;

    private function registration(array $overrides = []): array
    {
        return [...[
            'username' => 'Maria.Santos', 'first_name' => 'Maria', 'last_name' => 'Santos',
            'phone' => '09171234567', 'password' => 'Password123', 'password_confirmation' => 'Password123',
            'terms_accepted' => true,
        ], ...$overrides];
    }

    public function test_username_is_required_and_unique_case_insensitively(): void
    {
        $this->postJson('/api/auth/register', $this->registration(['username' => null]))
            ->assertUnprocessable()->assertJsonValidationErrors('username');
        $this->postJson('/api/auth/register', $this->registration(['username' => '09181234567']))
            ->assertUnprocessable()->assertJsonValidationErrors('username');
        $this->postJson('/api/auth/register', $this->registration())
            ->assertCreated()->assertJsonPath('user.username', 'maria.santos')
            ->assertJsonPath('verification.otp_sent', false);
        $this->postJson('/api/auth/register', $this->registration(['username' => ' MARIA.SANTOS ', 'phone' => '09181234567']))
            ->assertUnprocessable()->assertJsonValidationErrors('username');
        $this->postJson('/api/auth/register', $this->registration(['username' => 'other', 'phone' => '+63 917 123 4567']))
            ->assertUnprocessable()->assertJsonValidationErrors('phone');
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('sms_messages', 0);
    }

    public static function identifiers(): array
    {
        return [['maria.santos'], [' MARIA.SANTOS '], ['09171234567'], ['0917 123 4567'], ['+63 917 123 4567'], ['639171234567']];
    }

    #[DataProvider('identifiers')]
    public function test_login_accepts_username_or_phone(string $identifier): void
    {
        $user = User::factory()->create(['username' => 'Maria.Santos', 'phone' => '09171234567', 'password' => 'Password123']);
        $this->postJson('/api/auth/login', ['username' => $identifier, 'password' => 'Password123'])
            ->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonStructure(['token']);
        $this->postJson('/api/auth/login', ['username' => $identifier, 'password' => 'wrong'])
            ->assertUnauthorized();
    }

    public function test_staff_cannot_log_in_through_parishioner_username_or_phone(): void
    {
        User::factory()->create(['role' => 'staff', 'username' => 'stafftest', 'phone' => '09171234567', 'password' => 'Password123']);
        foreach (['stafftest', '09171234567'] as $identifier) {
            $this->postJson('/api/auth/login', ['username' => $identifier, 'password' => 'Password123'])->assertUnauthorized();
        }
    }

    public function test_profile_can_change_username_but_rejects_duplicate_identifiers(): void
    {
        $user = User::factory()->create(['username' => 'original', 'phone' => '09171234567', 'password' => 'Password123', 'phone_verified_at' => now()]);
        User::factory()->create(['username' => 'Taken.Name', 'phone' => '09181234567']);
        Sanctum::actingAs($user);
        $profile = [
            'username' => 'original', 'first_name' => $user->first_name, 'last_name' => $user->last_name,
            'phone' => $user->phone, 'birth_date' => '1990-01-01', 'gender' => 'Female',
            'barangay' => 'Dagatan', 'municipality' => 'Taysan', 'province' => 'Batangas',
        ];
        $this->patchJson('/api/profile', $profile)->assertOk();
        $this->patchJson('/api/profile', [...$profile, 'username' => 'taken.name'])->assertUnprocessable()->assertJsonValidationErrors('username');
        $this->patchJson('/api/profile', [...$profile, 'phone' => '+63 918 123 4567'])->assertUnprocessable()->assertJsonValidationErrors('phone');
        $this->patchJson('/api/profile', [...$profile, 'username' => 'New.Name'])->assertOk()->assertJsonPath('user.username', 'new.name')->assertJsonPath('user.phone_verified', true);
        $this->postJson('/api/auth/login', ['username' => 'new.name', 'password' => 'Password123'])->assertOk();
        $this->postJson('/api/auth/login', ['username' => 'original', 'password' => 'Password123'])->assertUnauthorized();
        $this->patchJson('/api/profile', [...$profile, 'username' => 'new.name', 'phone' => '+63 919 123 4567'])->assertOk()->assertJsonPath('user.phone_verified', false);
        $this->postJson('/api/auth/login', ['username' => '09191234567', 'password' => 'Password123'])->assertOk();
        $this->postJson('/api/auth/login', ['username' => '09171234567', 'password' => 'Password123'])->assertUnauthorized();
    }
}
