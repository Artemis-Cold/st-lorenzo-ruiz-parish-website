<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mass_intentions', function (Blueprint $table) {
            $table->foreignId('mass_event_id')
                ->nullable()
                ->after('intention_date')
                ->constrained('events')
                ->nullOnDelete();
            $table->string('mass_schedule_title')->nullable()->after('mass_event_id');
            $table->dateTime('mass_starts_at')->nullable()->after('mass_schedule_title');
            $table->string('mass_location')->nullable()->after('mass_starts_at');
        });
    }

    public function down(): void
    {
        Schema::table('mass_intentions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('mass_event_id');
            $table->dropColumn([
                'mass_schedule_title',
                'mass_starts_at',
                'mass_location',
            ]);
        });
    }
};
