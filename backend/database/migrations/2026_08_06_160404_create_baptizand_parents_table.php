<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('baptizand_parents', function (Blueprint $table) {

            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Relationship
            |--------------------------------------------------------------------------
            */

            $table->foreignId('baptizand_id')
                ->constrained()
                ->cascadeOnDelete();

            /*zacc
            |--------------------------------------------------------------------------
            | Father / Mother
            |--------------------------------------------------------------------------
            */

            $table->enum('relationship', [
                'father',
                'mother',
            ]);

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
            | Birth
            |--------------------------------------------------------------------------
            */

            $table->string('birth_place');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baptizand_parents');
    }
};
