<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassIntention\StoreMassIntentionBookingRequest;
use App\Services\MassIntentionBookingService;
use Illuminate\Http\JsonResponse;

class MassIntentionBookingController extends Controller
{
    public function __construct(
        private MassIntentionBookingService $service
    ) {}

    public function store(
        StoreMassIntentionBookingRequest $request
    ): JsonResponse {
        return response()->json([
            'message' => 'Mass Intention submitted successfully.',
            'data' => $this->service->store($request->validated()),
        ], 201);
    }
}
