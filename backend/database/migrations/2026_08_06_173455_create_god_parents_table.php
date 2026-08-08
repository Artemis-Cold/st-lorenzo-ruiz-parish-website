<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('god_parents', function (Blueprint $table) {

            $table->id();

            $table->foreignId('baptizand_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('role', [
                'godfather',
                'godmother',
            ]);

            $table->string('first_name');
            $table->string('middle_initial')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();

            $table->text('residence');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('god_parents');
    }
};
