<?php

namespace Database\Seeders;

use App\Models\PackageInclusion;
use Illuminate\Database\Seeder;

class PackageInclusionSeeder extends Seeder
{
    public function run(): void
    {
        PackageInclusion::insert([

            // Baptism Package 1 (Monday-Saturday)

            [
                'service_package_id' => 1,
                'name' => 'Mass Offering',
                'price' => 2000,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Rite Fee',
                'price' => 1000,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Seminar Fee',
                'price' => 1000,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Electricity',
                'price' => 1000,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Solidarity Donation',
                'price' => 3000,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Handbook',
                'price' => 700,
            ],

        ]);
    }
}