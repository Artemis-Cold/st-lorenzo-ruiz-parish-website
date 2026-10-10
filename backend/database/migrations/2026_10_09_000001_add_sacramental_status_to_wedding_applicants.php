<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_applicants', function (Blueprint $table) {
            $table->string('baptism_status', 3)->nullable();
            $table->string('confirmation_status', 3)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('wedding_applicants', function (Blueprint $table) {
            $table->dropColumn(['baptism_status', 'confirmation_status']);
        });
    }
};
