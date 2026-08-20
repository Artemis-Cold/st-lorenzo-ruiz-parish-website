<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('wedding_appointments') && ! Schema::hasTable('booking_appointments')) {
            Schema::rename('wedding_appointments', 'booking_appointments');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('booking_appointments') && ! Schema::hasTable('wedding_appointments')) {
            Schema::rename('booking_appointments', 'wedding_appointments');
        }
    }
};
