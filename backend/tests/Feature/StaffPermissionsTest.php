<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Service;
use App\Models\User;
use App\Support\StaffPermissions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_accountant_can_only_read_transactions(): void
    {
        $staff = User::factory()->create(['role' => 'staff', 'staff_permissions' => ['transactions.view']]);
        Sanctum::actingAs($staff);
        $this->getJson('/api/staff/transactions')->assertOk();
        foreach (['dashboard', 'bookings', 'document-requests', 'mass-intentions', 'events', 'announcements', 'availability', 'settings/pricing', 'settings/staff', 'settings/audit', 'settings/permissions'] as $path) {
            $this->getJson('/api/staff/'.$path)->assertForbidden();
        }
        $service = Service::firstOrCreate(['code' => 'baptism'], ['name' => 'Baptism', 'is_active' => true]);
        $booking = Booking::create(['user_id' => $staff->id, 'service_id' => $service->id, 'booking_reference' => 'PERMISSION-TEST', 'total_amount' => 100, 'status' => 'pending']);
        $payment = Payment::create(['booking_id' => $booking->id, 'method' => 'cash', 'amount' => 100, 'status' => 'awaiting_payment']);
        $this->patchJson("/api/staff/transactions/{$payment->id}/status", ['status' => 'confirmed'])->assertForbidden();
        $this->assertSame('awaiting_payment', $payment->fresh()->status);
        $staff->forceFill(['staff_permissions' => ['transactions.view', 'transactions.confirm']])->save();
        $this->patchJson("/api/staff/transactions/{$payment->id}/status", [])->assertUnprocessable();
        $this->postJson('/api/staff/settings/staff', [])->assertForbidden();
    }

    public function test_permission_changes_apply_to_existing_sessions_and_are_audited(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff', 'staff_permissions' => ['transactions.view']]);
        Sanctum::actingAs($staff);
        $this->getJson('/api/staff/transactions')->assertOk();
        Sanctum::actingAs($admin);
        $this->patchJson("/api/staff/settings/staff/{$staff->id}/access", ['permissions' => [], 'is_active' => true])->assertOk();
        $this->assertDatabaseHas('staff_audit_logs', ['actor_id' => $admin->id, 'subject_id' => $staff->id, 'action' => 'staff.access_updated']);
        Sanctum::actingAs($staff); // Deliberately reuse the pre-change model/session.
        $this->getJson('/api/staff/transactions')->assertForbidden();
        $this->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.permissions', []);
    }

    public function test_accounts_cannot_escalate_or_modify_main_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff', 'staff_permissions' => []]);
        Sanctum::actingAs($staff);
        $this->patchJson("/api/staff/settings/staff/{$staff->id}/access", ['permissions' => ['transactions.confirm'], 'is_active' => true])->assertForbidden();
        Sanctum::actingAs($admin);
        $this->patchJson("/api/staff/settings/staff/{$admin->id}/access", ['permissions' => [], 'is_active' => false])->assertForbidden();
        $this->patchJson("/api/staff/settings/staff/{$staff->id}/access", ['permissions' => ['accounts.manage'], 'is_active' => true])->assertUnprocessable();
        $this->patchJson("/api/staff/settings/staff/{$staff->id}/access", ['permissions' => ['transactions.confirm'], 'is_active' => true])->assertOk()->assertJsonPath('user.permissions.1', 'transactions.view');
        $this->assertSame('admin', $admin->fresh()->role);
    }

    public function test_inactive_and_unconfigured_staff_are_denied(): void
    {
        foreach ([['is_active' => false, 'staff_permissions' => ['transactions.view']], ['is_active' => true, 'staff_permissions' => null]] as $state) {
            Sanctum::actingAs(User::factory()->create(['role' => 'staff', ...$state]));
            $this->getJson('/api/staff/transactions')->assertForbidden();
        }
    }

    public function test_profile_updates_cannot_change_permissions_or_role(): void
    {
        $staff = User::factory()->create(['role' => 'staff', 'staff_permissions' => []]);
        Sanctum::actingAs($staff);
        $this->patchJson('/api/staff/settings/profile', ['username' => $staff->username, 'first_name' => $staff->first_name, 'last_name' => $staff->last_name, 'phone' => $staff->phone, 'role' => 'admin', 'staff_permissions' => ['transactions.confirm']])->assertOk();
        $this->assertSame('staff', $staff->fresh()->role);
        $this->assertSame([], $staff->fresh()->staff_permissions);
    }

    public function test_migration_preserves_staff_access_and_bootstraps_only_seeded_admin(): void
    {
        $main = User::factory()->create(['username' => 'parishadmin', 'role' => 'staff']);
        $other = User::factory()->create(['role' => 'staff']);
        $migration = require database_path('migrations/2026_10_19_000001_add_staff_permissions.php');
        $migration->down();
        $migration->up();
        $this->assertSame('admin', $main->fresh()->role);
        $this->assertSame('staff', $other->fresh()->role);
        $this->assertSame(array_keys(StaffPermissions::LABELS), $other->fresh()->staff_permissions);
    }
}
