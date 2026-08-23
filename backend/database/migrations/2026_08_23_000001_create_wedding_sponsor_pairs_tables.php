<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wedding_sponsor_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('marriage_contract')->nullable();
            $table->string('confirmation_certificate')->nullable();
            $table->timestamps();
        });

        Schema::create('wedding_sponsors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_sponsor_pair_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->enum('role', ['godfather', 'godmother']);
            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('last_name');
            $table->text('residence');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wedding_sponsors');
        Schema::dropIfExists('wedding_sponsor_pairs');
    }
};
