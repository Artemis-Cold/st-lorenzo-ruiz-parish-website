<?php

namespace Database\Seeders;

use App\Models\PackageAddon;
use Illuminate\Database\Seeder;

class PackageAddonSeeder extends Seeder
{
    public function run(): void
    {
        PackageAddon::insert([

            [
                'service_package_id' => 1,
                'name' => 'Red Carpet',
                'price' => 1000,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Flower Stand',
                'price' => 500,
            ],

            [
                'service_package_id' => 1,
                'name' => "Videographer & Photographer's Entrance Fee",
                'price' => 2200,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Candle',
                'price' => 1500,
            ],

            [
                'service_package_id' => 1,
                'name' => 'Bible',
                'price' => 600,
            ],

        ]);
    }
}
