<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $fees = DB::table('service_fees')->whereIn('service_id', DB::table('services')->select('id')->where('code', 'document-request'));
        foreach (['death_certificate' => 'Funeral Certificate', 'baptism_permission' => 'Baptism Permit', 'confirmation_permission' => 'Confirmation Permit'] as $code => $name) {
            (clone $fees)->where('code', $code)->update(['name' => $name]);
        }
        (clone $fees)->whereIn('code', ['request_of_permission', 'permission_of_marriage_banns', 'publication_of_marriage_banns'])->update(['is_active' => false]);
        // Existing document requests and their prices remain unchanged.
    }

    public function down(): void
    {
        $fees = DB::table('service_fees')->whereIn('service_id', DB::table('services')->select('id')->where('code', 'document-request'));
        foreach (['death_certificate' => 'Death Certificate', 'baptism_permission' => 'Baptism Permission', 'confirmation_permission' => 'Confirmation Permission'] as $code => $name) {
            (clone $fees)->where('code', $code)->update(['name' => $name]);
        }
        (clone $fees)->whereIn('code', ['request_of_permission', 'permission_of_marriage_banns', 'publication_of_marriage_banns'])->update(['is_active' => true]);
    }
};
