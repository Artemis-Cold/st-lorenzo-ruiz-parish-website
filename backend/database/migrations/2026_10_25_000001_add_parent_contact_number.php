<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('baptizand_parents', function (Blueprint $table) {
            $table->string('contact_number', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('baptizand_parents', fn (Blueprint $table) => $table->dropColumn('contact_number'));
    }
};
