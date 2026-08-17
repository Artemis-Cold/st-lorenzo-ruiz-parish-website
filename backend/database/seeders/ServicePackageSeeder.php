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

        $packages = [
            ['service' => 'baptism', 'name' => 'Monday to Saturday', 'base_price' => 2500, 'recommended' => false],
            ['service' => 'baptism', 'name' => 'Sunday', 'base_price' => 800, 'recommended' => false],
            ['service' => 'funeral', 'name' => 'With Choir', 'base_price' => 3000, 'recommended' => true],
            ['service' => 'funeral', 'name' => 'Without Choir', 'base_price' => 2000, 'recommended' => false],
        ];

        foreach ($packages as $package) {
            ServicePackage::updateOrCreate(
                [
                    'service_id' => $services[$package['service']],
                    'name' => $package['name'],
                ],
                [
                    'base_price' => $package['base_price'],
                    'recommended' => $package['recommended'],
                    'is_active' => true,
                ],
            );
        }
    }
}
