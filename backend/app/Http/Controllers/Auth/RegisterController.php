<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Throwable;

class RegisterController extends Controller
{
    public function __invoke(
        RegisterRequest $request,
        AuthService $authService,
        SmsNotificationService $sms
    ): JsonResponse {
        $result = $authService->register(
            $request->validated()
        );

        $reminderSent = true;

        try {
            $sms->queueToUser(
                $result['user'],
                'registration_verification_reminder',
                "St. Lorenzo Ruiz Parish: Your account has been created. Your username is {$result['user']->username}. Please verify your mobile number in Account Settings to access parish booking services."
            );
        } catch (Throwable $exception) {
            report($exception);
            $reminderSent = false;
        }

        return response()->json([
            'message' => 'Account created. Verify your mobile number to access parish booking services.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
            'verification' => [
                'required' => true,
                'otp_sent' => false,
                'reminder_sent' => $reminderSent,
            ],
        ], 201);
    }
}
