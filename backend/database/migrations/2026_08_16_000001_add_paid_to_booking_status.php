<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'paid', 'approved', 'ready_for_pickup', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'");
        }

        DB::table('bookings')
            ->whereIn('service_id', DB::table('services')->select('id')->where('code', 'mass-intention'))
            ->whereIn('status', ['pending', 'approved'])
            ->update(['status' => 'paid']);
    }

    public function down(): void
    {
        DB::table('bookings')->where('status', 'paid')->update(['status' => 'pending']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY status ENUM('pending', 'approved', 'ready_for_pickup', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending'");
        }
    }
};
