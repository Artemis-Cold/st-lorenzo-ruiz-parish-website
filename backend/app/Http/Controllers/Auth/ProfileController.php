<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\CompleteProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __invoke(
        Request $request
    ): JsonResponse {

        return response()->json([
            'user' => new UserResource(
                $request->user()
            ),
        ]);
    }

    public function complete(CompleteProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            ...$request->validated(),
            'profile_completed' => true,
        ]);

        return response()->json([
            'user' => new UserResource($user->fresh()),
        ]);
    }
}
