<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class FreshManualTestingSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ServiceSeeder::class,
            ServicePackageSeeder::class,
            WeddingPackageSeeder::class,
            ManualTestAccountSeeder::class,
            ManualTestAvailabilitySeeder::class,
        ]);
    }
}
