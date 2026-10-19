<?php

use App\Models\Booking;
use App\Models\Service;
use App\Services\BookingPricingService;
use App\Support\ParishCatalog;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            // Freeze legacy prices before changing the catalog; never reprice existing bookings.
            Booking::whereHas('service', fn ($q) => $q->whereIn('code', ['baptism', 'confirmation', 'first-communion']))
                ->with(['package.inclusions', 'selectedAddons'])->each(function ($booking) {
                    if ($booking->package && ! $booking->pricing_snapshot) {
                        $oldTotal = $booking->total_amount;
                        $price = app(BookingPricingService::class)->calculate($booking->package, $booking->selectedAddons);
                        $booking->update(['total_amount' => $oldTotal, 'pricing_snapshot' => $price['snapshot']]);
                    }
                });
            foreach (['baptism' => 2500, 'confirmation' => 575, 'first-communion' => 0] as $code => $amount) {
                $service = Service::firstWhere('code', $code);
                if (! $service) {
                    continue; // Fresh installs get the catalog through the seeders.
                }
                $name = $code === 'baptism' ? 'Baptism Package' : 'Standard';
                $service->packages()->where('name', '!=', $name)->update(['is_active' => false]);
                $package = $service->packages()->updateOrCreate(['name' => $name], ['base_price' => $amount, 'recommended' => true, 'is_active' => true]);
                $package->inclusions()->update(['price' => 0]);
                if ($code === 'baptism') {
                    foreach (ParishCatalog::BAPTISM_INCLUSIONS as $inclusion) {
                        $package->inclusions()->updateOrCreate(['name' => $inclusion], ['price' => 0]);
                    }
                }
            }
            $documents = Service::firstWhere('code', 'document-request');
            if (! $documents) {
                return;
            }
            foreach (ParishCatalog::DOCUMENTS as $code => [$name, $amount]) {
                $documents->fees()->updateOrCreate(['code' => $code], ['name' => $name, 'amount' => $amount, 'sort_order' => 10 + array_search($code, array_keys(ParishCatalog::DOCUMENTS)), 'is_active' => true]);
            }
        });
    }

    public function down(): void
    {
        // Catalog changes and historical price snapshots are intentionally retained.
    }
};
