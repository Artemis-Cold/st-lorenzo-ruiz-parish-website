<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('barangay')->nullable()->change();
            $table->string('municipality')->nullable()->change();
            $table->string('province')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('barangay')->nullable(false)->change();
            $table->string('municipality')->nullable(false)->change();
            $table->string('province')->nullable(false)->change();
        });
    }
};
