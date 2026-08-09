<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mass_intention_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mass_intention_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('intention_type');
            $table->json('names');
            $table->decimal('amount', 10, 2)->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mass_intention_entries');
    }
};
