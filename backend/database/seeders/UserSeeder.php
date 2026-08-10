<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['username' => 'johndoe'], [
            'parishioner_id' => 'PAR-TEST-000001',
            'password' => 'John@12345',
            'first_name' => 'John',
            'middle_initial' => null,
            'last_name' => 'Doe',
            'suffix' => null,

            'phone' => '09170000001',

            'house_no' => '123',
            'street' => 'Main Street',
            'barangay' => 'Dagatan',
            'municipality' => 'Taysan',
            'province' => 'Batangas',
            'zip_code' => '4228',

            'birth_date' => '1995-01-15',

            'gender' => 'Male',

            'profile_photo' => null,

            'role' => 'parishioner',

            'is_active' => true,
            'phone_verified_at' => now(),
            'profile_completed' => true,
        ]);
    }
}
