<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class StaffUserSeeder extends Seeder
{
    /**
     * Seed the default development parish staff account.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'mariaclara'],
            [
                'parishioner_id' => 'STAFF-TEST-000001',
                'password' => 'Maria@12345',
                'first_name' => 'Maria',
                'middle_initial' => null,
                'last_name' => 'Clara',
                'suffix' => null,
                'birth_date' => null,
                'gender' => null,
                'phone' => '09170000002',
                'house_no' => null,
                'street' => null,
                'barangay' => 'Dagatan',
                'municipality' => 'Taysan',
                'province' => 'Batangas',
                'zip_code' => '4228',
                'profile_photo' => null,
                'role' => 'staff',
                'is_active' => true,
                'phone_verified_at' => now(),
                'profile_completed' => true,
            ]
        );
    }
}
