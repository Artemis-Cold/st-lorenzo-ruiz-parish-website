<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffSettingsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_update_profile_and_password(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'password' => 'old-password',
        ]);
        Sanctum::actingAs($staff);

        $this->patchJson('/api/staff/settings/profile', [
            'username' => 'updatedstaff',
            'first_name' => 'Updated',
            'middle_initial' => '',
            'last_name' => 'Staff',
            'suffix' => '',
            'phone' => '09123456789',
        ])->assertOk()->assertJsonPath('user.username', 'updatedstaff');

        $this->patchJson('/api/staff/settings/password', [
            'current_password' => 'old-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertOk();

        $this->assertTrue(Hash::check('new-password', $staff->fresh()->password));
    }

    public function test_staff_can_create_another_staff_account(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));

        $this->postJson('/api/staff/settings/staff', [
            'username' => 'newstaff',
            'first_name' => 'Maria',
            'middle_initial' => 'B',
            'last_name' => 'Santos',
            'phone' => '09987654321',
            'password' => 'staff-password',
            'password_confirmation' => 'staff-password',
        ])->assertCreated()
            ->assertJsonPath('user.role', 'staff')
            ->assertJsonPath('user.full_name', 'Maria B. Santos');

        $this->assertDatabaseHas('users', [
            'username' => 'newstaff',
            'role' => 'staff',
        ]);
    }
}
