<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wedding_applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['groom', 'bride']);
            $table->string('first_name');
            $table->string('middle_initial', 1)->nullable();
            $table->string('last_name');
            $table->text('address');
            $table->unsignedSmallInteger('age');
            $table->string('contact_number', 30);
            $table->string('baptized_in');
            $table->string('confirmed_in');
            $table->string('father_first_name');
            $table->string('father_middle_initial', 1)->nullable();
            $table->string('father_last_name');
            $table->string('mother_first_name');
            $table->string('mother_middle_initial', 1)->nullable();
            $table->string('mother_last_name');
            $table->string('church_name');
            $table->string('priest');
            $table->text('church_address');
            $table->timestamps();

            $table->unique(['booking_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wedding_applicants');
    }
};
