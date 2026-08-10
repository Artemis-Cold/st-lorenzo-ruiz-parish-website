<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\StaffUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StaffUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_staff_account_that_can_log_in(): void
    {
        $this->seed(StaffUserSeeder::class);

        $this->assertDatabaseHas('users', [
            'username' => 'parishstaff',
            'role' => 'staff',
            'is_active' => true,
        ]);

        $user = User::where('username', 'parishstaff')->firstOrFail();

        $this->assertTrue(Hash::check('Staff@12345', $user->password));

        $this->postJson('/api/auth/staff/login', [
            'username' => 'parishstaff',
            'password' => 'Staff@12345',
        ])->assertOk()->assertJsonPath('user.role', 'staff');
    }

    public function test_it_does_not_duplicate_the_staff_account(): void
    {
        $this->seed(StaffUserSeeder::class);
        $this->seed(StaffUserSeeder::class);

        $this->assertDatabaseCount('users', 1);
    }
}
