<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $user = $request->user()?->refresh();

        if (! $user || ! in_array($user->role, ['staff', 'admin'], true)) {
            return response()->json([
                'message' => 'This action is restricted to parish staff.',
            ], 403);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'This staff account is inactive.',
            ], 403);
        }

        $path = preg_replace('#^api/staff/?#', '', $request->path());
        $personal = in_array($path, ['settings/profile', 'settings/password'], true);
        $accountManagement = $path === 'settings/staff' || str_starts_with($path, 'settings/staff/') || $path === 'settings/permissions' || $path === 'settings/audit';
        $module = explode('/', $path)[0];
        $permission = match ($module) {
            'dashboard' => 'dashboard.view',
            'announcements' => 'announcements.manage',
            'events' => 'events.manage',
            'availability' => 'availability.manage',
            'bookings' => 'bookings.manage',
            'mass-intentions' => 'mass_intentions.view',
            'document-requests' => 'requests.manage',
            'transactions' => $request->isMethodSafe() ? 'transactions.view' : 'transactions.confirm',
            'settings' => $path === 'settings/pricing' ? 'pricing.manage' : null,
            default => null,
        };
        if (! $personal && (($accountManagement && $user->role !== 'admin') || (! $accountManagement && (! $permission || ! $user->hasStaffPermission($permission))))) {
            return response()->json(['message' => 'You do not have permission to access this feature.'], 403);
        }
        $response = $next($request);
        if (! $request->isMethodSafe() && $response->getStatusCode() < 400) {
            DB::table('staff_audit_logs')->insert([
                'actor_id' => $user->id, 'action' => $request->method().' '.$request->route()->uri(),
                'details' => json_encode(['resource' => $request->path()]), 'created_at' => now(),
            ]);
        }

        return $response;
    }
}
