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
            // Null is reserved for services that do not use schedule review.
            $table->string('schedule_status', 20)->nullable()->index();
            $table->text('schedule_reason')->nullable();
            $table->timestamp('schedule_requested_at')->nullable();
            $table->timestamp('schedule_reviewed_at')->nullable();
            $table->foreignId('schedule_reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('details_submitted_at')->nullable();
        });
        $services = DB::table('services')->whereIn('code', ['baptism', 'wedding', 'funeral', 'confirmation', 'first-communion'])->pluck('id');
        DB::table('bookings')->whereIn('service_id', $services)->whereIn('status', ['pending', 'paid', 'approved', 'completed'])
            ->update([
                'schedule_status' => DB::raw("CASE WHEN status IN ('approved', 'completed') THEN 'confirmed' ELSE 'awaiting_review' END"),
                'schedule_requested_at' => DB::raw('created_at'),
                'details_submitted_at' => DB::raw('created_at'),
            ]);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('schedule_reviewed_by');
            $table->dropColumn(['schedule_status', 'schedule_reason', 'schedule_requested_at', 'schedule_reviewed_at', 'details_submitted_at']);
        });
    }
};
