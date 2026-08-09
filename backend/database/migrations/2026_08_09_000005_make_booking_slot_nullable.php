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
            $table->foreignId('booking_slot_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('bookings')
            ->whereNull('booking_slot_id')
            ->whereIn('service_id', function ($query) {
                $query->select('id')
                    ->from('services')
                    ->where('code', 'mass-intention');
            })
            ->delete();

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('booking_slot_id')->nullable(false)->change();
        });
    }
};
