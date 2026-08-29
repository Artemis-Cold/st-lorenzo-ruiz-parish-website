<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\RegistrationPhoneVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationPhoneVerificationController extends Controller
{
    public function __invoke(Request $request, RegistrationPhoneVerificationService $verification): JsonResponse
    {
        $request->merge(['phone' => preg_replace('/\D+/', '', (string) $request->input('phone'))]);
        $data = $request->validate(['phone' => ['required', 'regex:/^09\d{9}$/', 'unique:users,phone']]);
        $verification->send($data['phone']);

        return response()->json(['message' => 'A verification code was sent to your mobile number.']);
    }
}
