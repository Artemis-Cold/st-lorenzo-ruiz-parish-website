<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('package_inclusions')
            ->whereIn('service_package_id', DB::table('service_packages')->select('id')->whereIn('service_id', DB::table('services')->select('id')->where('code', 'baptism')))
            ->whereIn('name', ['Ritu', 'Ritwal', 'Ritu (ritwal ng Binyag)'])
            ->update(['name' => 'Rite of Baptism (Ritu ng Binyag)']);
    }

    public function down(): void
    {
        DB::table('package_inclusions')->where('name', 'Rite of Baptism (Ritu ng Binyag)')->update(['name' => 'Ritu']);
    }
};
