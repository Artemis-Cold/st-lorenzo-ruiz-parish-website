<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('baptizands', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Booking
            |--------------------------------------------------------------------------
            */

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Name
            |--------------------------------------------------------------------------
            */

            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Birth Information
            |--------------------------------------------------------------------------
            */

            $table->date('birth_date');

            $table->string('birth_place');

            $table->unsignedTinyInteger('age');

            $table->enum('gender', [
                'Male',
                'Female',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Contact
            |--------------------------------------------------------------------------
            */

            $table->text('address');

            $table->string('contact_number');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baptizands');
    }
};
