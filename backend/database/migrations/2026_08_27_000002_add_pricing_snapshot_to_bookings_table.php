<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->nullable()->after('booking_slot_id');
            $table->json('pricing_snapshot')->nullable()->after('total_amount');
        });

        DB::table('bookings')
            ->whereNotNull('service_package_id')
            ->orderBy('id')
            ->chunkById(100, function ($bookings) {
                foreach ($bookings as $booking) {
                    $package = DB::table('service_packages')->find($booking->service_package_id);

                    if (! $package) {
                        continue;
                    }

                    $inclusions = DB::table('package_inclusions')
                        ->where('service_package_id', $package->id)
                        ->orderBy('id')
                        ->get(['id', 'name', 'price']);
                    $addons = DB::table('package_addons')
                        ->join('booking_package_addons', 'package_addons.id', '=', 'booking_package_addons.package_addon_id')
                        ->where('booking_package_addons.booking_id', $booking->id)
                        ->orderBy('package_addons.id')
                        ->get(['package_addons.id', 'package_addons.name', 'package_addons.price']);

                    $total = (float) $package->base_price
                        + $inclusions->sum(fn ($item) => (float) $item->price)
                        + $addons->sum(fn ($item) => (float) $item->price);

                    DB::table('bookings')->where('id', $booking->id)->update([
                        'total_amount' => $total,
                        'pricing_snapshot' => json_encode([
                            'package' => [
                                'id' => $package->id,
                                'name' => $package->name,
                                'basePrice' => (float) $package->base_price,
                            ],
                            'inclusions' => $inclusions->map(fn ($item) => [
                                'id' => $item->id,
                                'name' => $item->name,
                                'price' => (float) $item->price,
                            ])->values()->all(),
                            'addons' => $addons->map(fn ($item) => [
                                'id' => $item->id,
                                'name' => $item->name,
                                'price' => (float) $item->price,
                            ])->values()->all(),
                            'fees' => [],
                        ], JSON_THROW_ON_ERROR),
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['total_amount', 'pricing_snapshot']);
        });
    }
};
