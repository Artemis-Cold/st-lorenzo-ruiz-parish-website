<?php

namespace Database\Seeders;

use App\Models\ServicePackage;
use App\Support\ParishCatalog;
use Illuminate\Database\Seeder;

class PackageInclusionSeeder extends Seeder
{
    public function run(): void
    {
        $package = ServicePackage::where('name', 'Baptism Package')
            ->whereHas('service', fn ($query) => $query->where('code', 'baptism'))->first();
        if ($package) {
            foreach (ParishCatalog::BAPTISM_INCLUSIONS as $name) {
                $package->inclusions()->firstOrCreate(['name' => $name], ['price' => 0]);
            }
        }
    }
}
