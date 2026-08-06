<?php

namespace Database\Seeders;

use App\Models\ServicePackage;
use Illuminate\Database\Seeder;

class ServicePackageSeeder extends Seeder
{
    public function run(): void
    {
        ServicePackage::create([
    'service_id' => 1,
    'name' => 'Monday to Saturday',
    'base_price' => 2500,
]);

ServicePackage::create([
    'service_id' => 1,
    'name' => 'Sunday',
    'base_price' => 800,
]);

ServicePackage::create([
    'service_id' => 3,
    'name' => 'With Choir',
    'base_price' => 3000,
    'recommended' => true,
]);

ServicePackage::create([
    'service_id' => 3,
    'name' => 'Without Choir',
    'base_price' => 2000,
]);
    }
}