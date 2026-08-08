<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(
        RegisterRequest $request,
        AuthService $authService
    ): JsonResponse {

        $result = $authService->register(
            $request->validated()
        );

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 201);
    }
}
