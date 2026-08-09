<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_package_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_addon_id')
                ->constrained('package_addons')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['booking_id', 'package_addon_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_package_addons');
    }
};
