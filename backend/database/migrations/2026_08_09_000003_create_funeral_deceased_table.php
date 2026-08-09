<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funeral_deceased', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('first_name');
            $table->string('middle_initial', 1)->nullable();
            $table->string('last_name');
            $table->text('address');
            $table->string('death_cause');
            $table->unsignedSmallInteger('age');
            $table->date('birth_date');
            foreach (['father', 'mother', 'spouse'] as $person) {
                $table->string($person.'_first_name');
                $table->string($person.'_middle_initial', 1)->nullable();
                $table->string($person.'_last_name');
            }
            $table->boolean('baptized')->default(false);
            $table->boolean('confirmed')->default(false);
            $table->boolean('church_married')->default(false);
            $table->boolean('anointed_of_the_sick')->default(false);
            $table->enum('attends_mass', ['regular', 'sometimes', 'never']);
            $table->enum('confesses', ['regular', 'sometimes', 'never']);
            $table->text('characteristics')->nullable();
            $table->string('informant_first_name');
            $table->string('informant_middle_initial', 1)->nullable();
            $table->string('informant_last_name');
            $table->string('informant_relationship');
            $table->string('informant_contact_number', 30);
            $table->date('information_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funeral_deceased');
    }
};
