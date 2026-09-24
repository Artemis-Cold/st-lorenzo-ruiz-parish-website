<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use App\Services\Auth\PhoneVerificationService;
use Illuminate\Http\JsonResponse;
use Throwable;

class RegisterController extends Controller
{
    public function __invoke(
        RegisterRequest $request,
        AuthService $authService,
        PhoneVerificationService $verification
    ): JsonResponse {
        $result = $authService->register(
            $request->validated()
        );

        $otpSent = true;

        try {
            $verification->send($result['user']);
        } catch (Throwable $exception) {
            report($exception);
            $otpSent = false;
        }

        return response()->json([
            'message' => $otpSent
                ? 'Account created. Enter the verification code sent to your mobile number.'
                : 'Account created. Request a new verification code to continue.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
            'verification' => [
                'required' => true,
                'otp_sent' => $otpSent,
            ],
        ], 201);
    }
}
