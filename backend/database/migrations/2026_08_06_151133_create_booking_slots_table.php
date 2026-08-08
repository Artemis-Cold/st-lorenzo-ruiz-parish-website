<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_slots', function (Blueprint $table) {

            $table->id();

            $table->foreignId('service_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('booking_date');

            $table->time('start_time');

            $table->time('end_time');

            // Maximum number of bookings allowed
            $table->unsignedTinyInteger('capacity')->default(1);

            // Secretary can temporarily disable a slot
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Prevent duplicate slots
            $table->unique([
                'service_id',
                'booking_date',
                'start_time',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_slots');
    }
};
