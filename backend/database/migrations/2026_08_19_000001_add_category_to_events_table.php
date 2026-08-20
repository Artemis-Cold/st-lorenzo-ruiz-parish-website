<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('category', 20)->default('event')->after('created_by')->index();
        });

        DB::table('events')
            ->whereIn('title', ['Daily Mass', 'Sunday Mass'])
            ->update(['category' => 'mass']);
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
