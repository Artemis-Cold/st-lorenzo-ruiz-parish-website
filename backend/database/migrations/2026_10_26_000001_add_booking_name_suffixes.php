<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const COLUMNS = [
        'wedding_applicants' => ['suffix', 'father_suffix', 'mother_suffix'],
        'wedding_sponsors' => ['suffix'],
        'funeral_deceased' => ['suffix', 'father_suffix', 'mother_suffix', 'spouse_suffix', 'informant_suffix'],
        'funeral_children' => ['suffix'],
    ];

    public function up(): void
    {
        foreach (self::COLUMNS as $name => $columns) {
            Schema::table($name, function (Blueprint $table) use ($columns) {
                foreach ($columns as $column) {
                    $table->string($column, 20)->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        foreach (self::COLUMNS as $name => $columns) {
            Schema::table($name, fn (Blueprint $table) => $table->dropColumn($columns));
        }
    }
};
