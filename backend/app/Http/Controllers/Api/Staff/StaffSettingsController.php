<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\CreateStaffRequest;
use App\Http\Requests\Staff\UpdateStaffPasswordRequest;
use App\Http\Requests\Staff\UpdateStaffProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\StaffPermissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StaffSettingsController extends Controller
{
    public function createStaff(CreateStaffRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $staff = User::create([
                ...$request->safe()->except(['password_confirmation', 'permissions']),
                'parishioner_id' => 'STAFF-'.strtoupper(str()->random(10)),
                'role' => 'staff',
                'is_active' => true,
                'profile_completed' => true,
                'barangay' => $request->user()->barangay ?? 'Dagatan',
                'municipality' => $request->user()->municipality ?? 'Taysan',
                'province' => $request->user()->province ?? 'Batangas',
            ]);
            $staff->forceFill(['staff_permissions' => StaffPermissions::normalize($request->validated('permissions'))])->save();
            DB::table('staff_audit_logs')->insert(['actor_id' => $request->user()->id, 'subject_id' => $staff->id, 'action' => 'staff.created', 'details' => json_encode(['permissions' => $staff->staff_permissions]), 'created_at' => now()]);

            return response()->json([
                'message' => 'Parish staff account created successfully.',
                'user' => new UserResource($staff),
            ], 201);
        });
    }

    public function accounts(): JsonResponse
    {
        return response()->json(['data' => UserResource::collection(User::whereIn('role', ['admin', 'staff'])->orderBy('first_name')->get())]);
    }

    public function permissions(): JsonResponse
    {
        return response()->json(['data' => StaffPermissions::LABELS]);
    }

    public function updateAccess(Request $request, User $staff): JsonResponse
    {
        $data = $request->validate([
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', 'distinct', Rule::in(array_keys(StaffPermissions::LABELS))],
            'is_active' => ['required', 'boolean'],
        ]);
        // No UI/API operation can demote, disable or overwrite a main admin.
        abort_unless($staff->role === 'staff' && $staff->id !== $request->user()->id, 403, 'Main Admin access cannot be changed here.');
        DB::transaction(function () use ($staff, $request, $data) {
            $staff = User::lockForUpdate()->findOrFail($staff->id);
            abort_unless($staff->role === 'staff', 403);
            $before = ['permissions' => $staff->staff_permissions ?? [], 'is_active' => $staff->is_active];
            $staff->forceFill(['staff_permissions' => StaffPermissions::normalize($data['permissions']), 'is_active' => $data['is_active']])->save();
            DB::table('staff_audit_logs')->insert(['actor_id' => $request->user()->id, 'subject_id' => $staff->id, 'action' => 'staff.access_updated', 'details' => json_encode(['before' => $before, 'after' => ['permissions' => $staff->staff_permissions, 'is_active' => $staff->is_active]]), 'created_at' => now()]);
        });

        return response()->json(['user' => new UserResource($staff->fresh()), 'message' => 'Staff permissions updated.']);
    }

    public function audit(): JsonResponse
    {
        return response()->json(DB::table('staff_audit_logs')->orderByDesc('id')->paginate(30));
    }

    public function updateProfile(UpdateStaffProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return response()->json([
            'message' => 'Staff profile updated successfully.',
            'user' => new UserResource($request->user()->fresh()),
        ]);
    }

    public function updatePassword(UpdateStaffPasswordRequest $request): JsonResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);
        $request->user()->tokens()->whereKeyNot($request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
