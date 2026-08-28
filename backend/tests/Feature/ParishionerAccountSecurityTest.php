<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ParishionerAccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_parishioner_can_update_password_with_current_password(): void
    {
        $parishioner = User::factory()->create([
            'role' => 'parishioner',
            'password' => 'old-password',
        ]);
        Sanctum::actingAs($parishioner);

        $this->patchJson('/api/profile/password', [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk()
            ->assertJsonPath('message', 'Password updated successfully.');

        $this->assertTrue(Hash::check('new-password', $parishioner->fresh()->password));
    }

    public function test_parishioner_password_update_rejects_wrong_current_password(): void
    {
        $parishioner = User::factory()->create([
            'role' => 'parishioner',
            'password' => 'old-password',
        ]);
        Sanctum::actingAs($parishioner);

        $this->patchJson('/api/profile/password', [
            'current_password' => 'incorrect-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);

        $this->assertTrue(Hash::check('old-password', $parishioner->fresh()->password));
    }

    public function test_registration_rejects_a_duplicate_normalized_username(): void
    {
        User::factory()->create(['username' => 'johndoe']);

        $this->postJson('/api/auth/register', [
            'username' => '  JohnDoe  ',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '09171234567',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['username']);

        $this->assertSame(1, User::where('username', 'johndoe')->count());
    }

    public function test_registration_rejects_a_duplicate_normalized_phone_number(): void
    {
        User::factory()->create(['phone' => '09171234567']);

        $this->postJson('/api/auth/register', [
            'username' => 'anotheruser',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'phone' => '0917 123 4567',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['phone']);

        $this->assertSame(1, User::where('phone', '09171234567')->count());
    }

    public function test_registration_requires_terms_and_conditions_acceptance(): void
    {
        $payload = [
            'username' => 'newparishioner',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'phone' => '09181234567',
        ];

        $this->postJson('/api/auth/register', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['terms_accepted']);

        $this->postJson('/api/auth/register', [
            ...$payload,
            'terms_accepted' => true,
        ])->assertCreated();

        $user = User::where('username', 'newparishioner')->firstOrFail();

        $this->assertNotNull($user->terms_accepted_at);
        $this->assertSame('2026-08-28', $user->terms_version);
    }
}
