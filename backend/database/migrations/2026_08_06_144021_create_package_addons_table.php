<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_addons', function (Blueprint $table) {

            $table->id();

            $table->foreignId('service_package_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->decimal('price', 10, 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_addons');
    }
};
