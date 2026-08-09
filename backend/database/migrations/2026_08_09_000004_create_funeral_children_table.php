<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funeral_children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funeral_deceased_id')
                ->constrained('funeral_deceased')
                ->cascadeOnDelete();
            $table->string('first_name');
            $table->string('middle_initial', 1)->nullable();
            $table->string('last_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funeral_children');
    }
};
