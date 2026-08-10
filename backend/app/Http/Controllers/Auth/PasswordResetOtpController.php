<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\PasswordResetOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetOtpController extends Controller
{
    public function send(Request $request, PasswordResetOtpService $service): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'regex:/^09\d{9}$/'],
            'portal' => ['required', Rule::in(['parishioner', 'staff'])],
        ]);

        if (! $service->send($data['username'], $data['phone'], $data['portal'])) {
            throw ValidationException::withMessages([
                'phone' => 'The username and registered mobile number do not match our records.',
            ]);
        }

        return response()->json([
            'message' => 'A verification code has been sent to your registered mobile number.',
        ]);
    }

    public function reset(Request $request, PasswordResetOtpService $service): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'regex:/^09\d{9}$/'],
            'portal' => ['required', Rule::in(['parishioner', 'staff'])],
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $service->reset($data['username'], $data['phone'], $data['portal'], $data['otp'], $data['password']);

        return response()->json(['message' => 'Password reset successfully. You may now sign in.']);
    }
}
