<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\Parishioner\ParishionerIdService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([

            'parishioner_id' => ParishionerIdService::generate(),

            'username' => 'zoal123',

            'password' => Hash::make('password123'),

            'first_name' => 'Zoal',
            'middle_initial' => 'B',
            'last_name' => 'Andal',
            'suffix' => null,

            'phone' => '09171234567',

            'house_no' => '123',
            'street' => 'Main Street',
            'barangay' => 'Dagatan',
            'municipality' => 'Taysan',
            'province' => 'Batangas',
            'zip_code' => '4228',

            'birth_date' => '2002-08-14',

            'gender' => 'Male',

            'profile_photo' => null,

            'role' => 'parishioner',

            'is_active' => true,

            'phone_verified_at' => now(),

        ]);
    }
}
