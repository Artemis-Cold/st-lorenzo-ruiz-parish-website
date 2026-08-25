<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marriage_banns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('publication_start');
            $table->date('publication_end');
            $table->timestamps();

            $table->index(['publication_start', 'publication_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marriage_banns');
    }
};
