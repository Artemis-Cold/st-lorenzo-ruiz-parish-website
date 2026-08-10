<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_staff_can_login(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => true,
            'password' => 'secret-password',
        ]);

        $response = $this->postJson('/api/auth/staff/login', [
            'username' => $staff->username,
            'password' => 'secret-password',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $staff->id)
            ->assertJsonPath('user.role', 'staff')
            ->assertJsonStructure(['message', 'token', 'user']);

        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_admin_can_login_through_staff_login(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/auth/staff/login', [
            'username' => $admin->username,
            'password' => 'secret-password',
        ])->assertOk()->assertJsonPath('user.role', 'admin');
    }

    public function test_parishioner_cannot_login_through_staff_login(): void
    {
        $parishioner = User::factory()->create([
            'role' => 'parishioner',
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/auth/staff/login', [
            'username' => $parishioner->username,
            'password' => 'secret-password',
        ])->assertUnauthorized();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_inactive_staff_cannot_login(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'is_active' => false,
            'password' => 'secret-password',
        ]);

        $this->postJson('/api/auth/staff/login', [
            'username' => $staff->username,
            'password' => 'secret-password',
        ])->assertForbidden();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_staff_login_requires_credentials(): void
    {
        $this->postJson('/api/auth/staff/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['username', 'password']);
    }

    public function test_staff_can_logout_and_revoke_the_current_token(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $token = $staff->createToken('staff-dashboard', ['staff'])->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
