<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\CreateStaffRequest;
use App\Http\Requests\Staff\UpdateStaffPasswordRequest;
use App\Http\Requests\Staff\UpdateStaffProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StaffSettingsController extends Controller
{
    public function createStaff(CreateStaffRequest $request): JsonResponse
    {
        $staff = User::create([
            ...$request->safe()->except(['password_confirmation']),
            'parishioner_id' => 'STAFF-'.strtoupper(str()->random(10)),
            'role' => 'staff',
            'is_active' => true,
            'profile_completed' => true,
            'barangay' => $request->user()->barangay ?? 'Dagatan',
            'municipality' => $request->user()->municipality ?? 'Taysan',
            'province' => $request->user()->province ?? 'Batangas',
        ]);

        return response()->json([
            'message' => 'Parish staff account created successfully.',
            'user' => new UserResource($staff),
        ], 201);
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
