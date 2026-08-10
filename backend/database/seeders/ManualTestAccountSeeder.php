<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ManualTestAccountSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            StaffUserSeeder::class,
        ]);
    }
}
