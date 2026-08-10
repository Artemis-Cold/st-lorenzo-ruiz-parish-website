<?php

namespace Tests\Feature;

use App\Models\BookingSlot;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\FreshManualTestingSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FreshManualTestingSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_testing_seeder_creates_accounts_services_and_independent_slots(): void
    {
        $this->seed(FreshManualTestingSeeder::class);

        $this->assertDatabaseHas('users', ['username' => 'johndoe', 'first_name' => 'John', 'last_name' => 'Doe', 'role' => 'parishioner']);
        $this->assertDatabaseHas('users', ['username' => 'mariaclara', 'first_name' => 'Maria', 'last_name' => 'Clara', 'role' => 'staff']);

        foreach (['baptism', 'wedding', 'funeral'] as $code) {
            $serviceId = Service::where('code', $code)->value('id');
            $this->assertTrue(BookingSlot::where('service_id', $serviceId)->exists());
        }

        $this->assertSame(2, User::count());

        $this->postJson('/api/auth/login', [
            'username' => 'johndoe',
            'password' => 'John@12345',
        ])->assertOk()->assertJsonPath('user.role', 'parishioner');

        $this->postJson('/api/auth/staff/login', [
            'username' => 'mariaclara',
            'password' => 'Maria@12345',
        ])->assertOk()->assertJsonPath('user.role', 'staff');
    }
}
