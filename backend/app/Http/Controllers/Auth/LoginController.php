<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __invoke(
        LoginRequest $request,
        AuthService $authService
    ): JsonResponse {

        $result = $authService->login(
            $request->validated()
        );

        return response()->json([
            'message' => 'Login successful.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ]);
    }
}