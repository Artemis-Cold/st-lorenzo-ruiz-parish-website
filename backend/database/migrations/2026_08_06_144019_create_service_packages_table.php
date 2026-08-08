<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_packages', function (Blueprint $table) {

            $table->id();

            $table->foreignId('service_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->decimal('base_price', 10, 2);

            $table->boolean('recommended')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_packages');
    }
};
