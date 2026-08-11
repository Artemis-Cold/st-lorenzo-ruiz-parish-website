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
}
