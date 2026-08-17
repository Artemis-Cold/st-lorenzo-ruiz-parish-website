<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class ProductionStaffSeeder extends Seeder
{
    public function run(): void
    {
        $staff = User::updateOrCreate(
            ['parishioner_id' => 'STAFF-PROD-000001'],
            [
                'username' => 'parishadmin',
                'password' => '11111111',
                'first_name' => 'Parish',
                'middle_initial' => null,
                'last_name' => 'Admin',
                'suffix' => null,
                'phone' => '09170000003',
                'role' => 'staff',
                'is_active' => true,
                'profile_completed' => false,
            ],
        );

        $staff->forceFill(['phone_verified_at' => now()])->save();
    }
}
