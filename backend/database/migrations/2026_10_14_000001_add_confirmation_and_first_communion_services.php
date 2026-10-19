<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('baptizands', function (Blueprint $table) {
            $table->string('parish_origin')->nullable()->after('contact_number');
            $table->date('baptism_date')->nullable()->after('parish_origin');
            $table->string('baptism_church')->nullable()->after('baptism_date');
        });

        $now = now();
        foreach ([
            ['code' => 'confirmation', 'name' => 'Confirmation', 'description' => 'Sacrament of Confirmation'],
            ['code' => 'first-communion', 'name' => 'First Communion', 'description' => 'Sacrament of First Holy Communion'],
        ] as $service) {
            DB::table('services')->updateOrInsert(
                ['code' => $service['code']],
                [...$service, 'is_active' => true, 'updated_at' => $now, 'created_at' => $now],
            );

            $serviceId = DB::table('services')->where('code', $service['code'])->value('id');
            DB::table('service_packages')->updateOrInsert(
                ['service_id' => $serviceId, 'name' => 'Standard'],
                [
                    'base_price' => 0,
                    'recommended' => true,
                    'is_active' => true,
                    'updated_at' => $now,
                    'created_at' => $now,
                ],
            );
        }
    }

    public function down(): void
    {
        $serviceIds = DB::table('services')
            ->whereIn('code', ['confirmation', 'first-communion'])
            ->pluck('id');
        DB::table('service_packages')->whereIn('service_id', $serviceIds)->delete();
        DB::table('services')->whereIn('id', $serviceIds)->delete();

        Schema::table('baptizands', function (Blueprint $table) {
            $table->dropColumn(['parish_origin', 'baptism_date', 'baptism_church']);
        });
    }
};
