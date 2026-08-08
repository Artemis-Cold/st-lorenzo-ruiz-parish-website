<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('god_parents', function (Blueprint $table) {
            $table->foreignId('god_parent_pair_id')
                ->nullable()
                ->after('baptizand_id')
                ->constrained()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('god_parents', function (Blueprint $table) {
            $table->dropForeign(['god_parent_pair_id']);
            $table->dropColumn('god_parent_pair_id');
        });
    }
};
