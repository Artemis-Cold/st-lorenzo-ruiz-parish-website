<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Keep historical bookings and certificate requests intact.
        DB::table('services')->where('code', 'first-communion')->update(['is_active' => false]);
    }

    public function down(): void
    {
        DB::table('services')->where('code', 'first-communion')->update(['is_active' => true]);
    }
};
