<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('funeral_deceased', function (Blueprint $table) {
            $table->string('spouse_first_name')->nullable()->change();
            $table->string('spouse_last_name')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('funeral_deceased', function (Blueprint $table) {
            $table->string('spouse_first_name')->nullable(false)->change();
            $table->string('spouse_last_name')->nullable(false)->change();
        });
    }
};
