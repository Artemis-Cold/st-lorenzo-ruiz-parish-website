<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->phone_verified_at) {
            return response()->json([
                'message' => 'Verify your mobile number before booking a parish service.',
                'code' => 'phone_verification_required',
            ], 403);
        }

        return $next($request);
    }
}
