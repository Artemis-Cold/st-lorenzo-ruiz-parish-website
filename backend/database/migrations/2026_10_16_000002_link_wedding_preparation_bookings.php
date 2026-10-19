<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('wedding_booking_id')->nullable()->constrained('bookings')->restrictOnDelete();
            $table->string('wedding_applicant_role', 10)->nullable();
            $table->unique(['wedding_booking_id', 'wedding_applicant_role', 'service_id'], 'wedding_preparation_unique');
        });
        Schema::table('booking_appointments', function (Blueprint $table) {
            $table->enum('type', ['seminar', 'priest_interview', 'sacrament'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('wedding_preparation_unique');
            $table->dropConstrainedForeignId('wedding_booking_id');
            $table->dropColumn('wedding_applicant_role');
        });
        // Keep the expanded appointment type so recorded sacrament schedules remain valid.
    }
};
