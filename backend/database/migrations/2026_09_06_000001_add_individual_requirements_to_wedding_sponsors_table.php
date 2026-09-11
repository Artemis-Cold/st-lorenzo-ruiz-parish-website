<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wedding_sponsors', function (Blueprint $table) {
            $table->string('requirement_type')->nullable()->after('residence');
            $table->string('requirement_file_name')->nullable()->after('requirement_type');
            $table->string('requirement_file_path')->nullable()->after('requirement_file_name');
        });
    }

    public function down(): void
    {
        Schema::table('wedding_sponsors', function (Blueprint $table) {
            $table->dropColumn([
                'requirement_type',
                'requirement_file_name',
                'requirement_file_path',
            ]);
        });
    }
};
