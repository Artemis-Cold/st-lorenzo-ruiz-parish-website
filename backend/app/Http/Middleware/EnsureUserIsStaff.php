<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsStaff
{
    public function handle(Request $request, Closure $next): Response|JsonResponse
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, ['staff', 'admin'], true)) {
            return response()->json([
                'message' => 'This action is restricted to parish staff.',
            ], 403);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'This staff account is inactive.',
            ], 403);
        }

        return $next($request);
    }
}
