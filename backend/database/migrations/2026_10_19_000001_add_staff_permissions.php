<?php

use App\Support\StaffPermissions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('staff_permissions')->nullable();
        });
        // Preserve operational access for existing staff, never account administration.
        DB::table('users')->where('role', 'staff')->update(['staff_permissions' => json_encode(array_keys(StaffPermissions::LABELS))]);
        if (! DB::table('users')->where('role', 'admin')->exists()) {
            DB::table('users')->where('role', 'staff')->where('username', 'parishadmin')->where('is_active', true)->update(['role' => 'admin']);
        }
        Schema::create('staff_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->json('details')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_audit_logs');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('staff_permissions'));
    }
};
