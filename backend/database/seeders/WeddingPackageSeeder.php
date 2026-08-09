<?php

namespace Database\Seeders;

use App\Models\PackageAddon;
use App\Models\PackageInclusion;
use App\Models\Service;
use App\Models\ServicePackage;
use Illuminate\Database\Seeder;

class WeddingPackageSeeder extends Seeder
{
    public function run(): void
    {
        $service = Service::firstOrCreate(
            ['code' => 'wedding'],
            ['name' => 'Wedding'],
        );

        $package = ServicePackage::create([
            'service_id' => $service->id,
            'name' => 'Standard Wedding Package',
            'base_price' => 0, // per your earlier design, base_price stays 0 and the real cost comes from inclusions + add-ons
            'recommended' => true,
            'is_active' => true,
        ]);

        $inclusions = [
            ['name' => 'Mass Offering', 'price' => 2000],
            ['name' => 'Rite Fee', 'price' => 1000],
            ['name' => 'Seminars Fee', 'price' => 1000],
            ['name' => 'Electricity', 'price' => 1000],
            ['name' => 'Solidarity Donation', 'price' => 3000],
            ['name' => 'Handbook', 'price' => 700],
        ];

        foreach ($inclusions as $inclusion) {
            PackageInclusion::create([
                'service_package_id' => $package->id,
                ...$inclusion,
            ]);
        }

        $addons = [
            ['name' => 'Red Carpet', 'price' => 1000],
            ['name' => 'Flower Stand', 'price' => 500],
            ['name' => "Videographer & Photographer's Entrance Fee", 'price' => 2200],
            ['name' => 'Candle', 'price' => 1500],
            ['name' => 'Bible', 'price' => 600],
        ];

        foreach ($addons as $addon) {
            PackageAddon::create([
                'service_package_id' => $package->id,
                ...$addon,
            ]);
        }
    }
}
