<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ServiceSeeder::class,
            ServicePackageSeeder::class,
            WeddingPackageSeeder::class,
            ProductionStaffSeeder::class,
        ]);
    }
}
