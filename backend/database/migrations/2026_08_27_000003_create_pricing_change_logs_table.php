<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('price_type');
            $table->unsignedBigInteger('priceable_id');
            $table->string('name');
            $table->decimal('old_amount', 10, 2);
            $table->decimal('new_amount', 10, 2);
            $table->timestamps();

            $table->index(['price_type', 'priceable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_change_logs');
    }
};
