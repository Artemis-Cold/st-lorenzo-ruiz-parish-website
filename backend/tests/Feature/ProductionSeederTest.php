<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ProductionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProductionSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_required_catalog_data_without_duplicates(): void
    {
        $this->seed(ProductionSeeder::class);
        $this->seed(ProductionSeeder::class);

        $this->assertDatabaseCount('services', 5);
        $this->assertDatabaseCount('service_packages', 5);
        $this->assertDatabaseCount('package_inclusions', 6);
        $this->assertDatabaseCount('package_addons', 5);
        $this->assertDatabaseCount('users', 1);

        $this->assertDatabaseHas('service_packages', [
            'name' => 'Standard Wedding Package',
            'recommended' => true,
        ]);

        $this->assertDatabaseHas('users', [
            'parishioner_id' => 'STAFF-PROD-000001',
            'username' => 'parishadmin',
            'first_name' => 'Parish',
            'last_name' => 'Admin',
            'role' => 'staff',
            'is_active' => true,
        ]);

        $staff = User::where('username', 'parishadmin')->firstOrFail();

        $this->assertTrue(Hash::check('11111111', $staff->password));
        $this->assertNotNull($staff->phone_verified_at);

        $this->postJson('/api/auth/staff/login', [
            'username' => 'parishadmin',
            'password' => '11111111',
        ])->assertOk()->assertJsonPath('user.full_name', 'Parish Admin');
    }

    public function test_default_seeder_does_not_create_manual_test_accounts_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->artisan('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--force' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('users', ['username' => 'parishadmin']);
        $this->assertDatabaseMissing('users', ['username' => 'johndoe']);
        $this->assertDatabaseMissing('users', ['username' => 'mariaclara']);
    }
}
