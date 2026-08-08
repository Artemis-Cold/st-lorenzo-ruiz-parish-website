<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServicePackage;
use Illuminate\Database\Seeder;

class ServicePackageSeeder extends Seeder
{
    public function run(): void
    {
        $services = Service::pluck('id', 'code');

        ServicePackage::create([
            'service_id' => $services['baptism'],
            'name' => 'Monday to Saturday',
            'base_price' => 2500,
        ]);

        ServicePackage::create([
            'service_id' => $services['baptism'],
            'name' => 'Sunday',
            'base_price' => 800,
        ]);

        ServicePackage::create([
            'service_id' => $services['funeral'],
            'name' => 'With Choir',
            'base_price' => 3000,
            'recommended' => true,
        ]);

        ServicePackage::create([
            'service_id' => $services['funeral'],
            'name' => 'Without Choir',
            'base_price' => 2000,
        ]);
    }
}
