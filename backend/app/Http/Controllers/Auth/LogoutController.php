<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __invoke(
        Request $request,
        AuthService $authService
    ): JsonResponse {

        $authService->logout(
            $request->user()
        );

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
