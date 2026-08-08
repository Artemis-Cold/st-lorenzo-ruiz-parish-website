<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('god_parent_pairs', function (Blueprint $table) {

            $table->id();

            $table->foreignId('baptizand_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('marriage_contract')->nullable();

            $table->string('confirmation_certificate')->nullable();

            $table->timestamps();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('god_parent_pairs');
    }
};