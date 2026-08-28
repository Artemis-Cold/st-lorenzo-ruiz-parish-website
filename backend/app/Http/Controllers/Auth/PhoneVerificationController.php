<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\Auth\PhoneVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhoneVerificationController extends Controller
{
    public function send(
        Request $request,
        PhoneVerificationService $verification
    ): JsonResponse {
        abort_unless($request->user()->role === 'parishioner', 403);

        $verification->send($request->user());

        return response()->json([
            'message' => 'A verification code was sent to your mobile number.',
        ]);
    }

    public function verify(
        Request $request,
        PhoneVerificationService $verification
    ): JsonResponse {
        abort_unless($request->user()->role === 'parishioner', 403);

        $validated = $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $verification->verify($request->user(), $validated['otp']);

        return response()->json([
            'message' => 'Your mobile number has been verified successfully.',
            'user' => new UserResource($request->user()->fresh()),
        ]);
    }
}
