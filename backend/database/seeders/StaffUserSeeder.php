<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffUserSeeder extends Seeder
{
    /**
     * Seed the default development parish staff account.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['username' => 'parishstaff'],
            [
                'parishioner_id' => 'STAFF-000001',
                'password' => Hash::make('Staff@12345'),
                'first_name' => 'Parish',
                'middle_initial' => null,
                'last_name' => 'Staff',
                'suffix' => null,
                'birth_date' => null,
                'gender' => null,
                'phone' => '09000000001',
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
