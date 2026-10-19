<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('documents_approved_notified_at')->nullable();
            $table->timestamp('physical_copies_received_at')->nullable();
            $table->foreignId('physical_copies_received_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('physical_copies_received_by');
            $table->dropColumn(['documents_approved_notified_at', 'physical_copies_received_at']);
        });
    }
};
