<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServicePackage;
use App\Support\ParishCatalog;
use Illuminate\Database\Seeder;

class ServicePackageSeeder extends Seeder
{
    public function run(): void
    {
        $services = Service::pluck('id', 'code');

        $packages = [
            ['service' => 'baptism', 'name' => 'Baptism Package', 'base_price' => 2500, 'recommended' => true],
            ['service' => 'funeral', 'name' => 'With Choir', 'base_price' => 3000, 'recommended' => true],
            ['service' => 'funeral', 'name' => 'Without Choir', 'base_price' => 2000, 'recommended' => false],
            ['service' => 'confirmation', 'name' => 'Standard', 'base_price' => 575, 'recommended' => true],
            ['service' => 'first-communion', 'name' => 'Standard', 'base_price' => 0, 'recommended' => true],
        ];

        foreach ($packages as $package) {
            $record = ServicePackage::firstOrCreate(
                [
                    'service_id' => $services[$package['service']],
                    'name' => $package['name'],
                ],
                [
                    'base_price' => $package['base_price'],
                    'recommended' => $package['recommended'],
                    'is_active' => $package['service'] !== 'first-communion',
                ],
            );
            if ($package['service'] === 'baptism') {
                foreach (ParishCatalog::BAPTISM_INCLUSIONS as $name) {
                    $record->inclusions()->firstOrCreate(['name' => $name], ['price' => 0]);
                }
            }
        }
    }
}
