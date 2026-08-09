<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wedding\StoreWeddingBookingRequest;
use App\Services\WeddingBookingService;
use Illuminate\Http\JsonResponse;

class WeddingBookingController extends Controller
{
    public function __construct(
        private WeddingBookingService $service
    ) {}

    public function store(StoreWeddingBookingRequest $request): JsonResponse
    {
        $booking = $this->service->store($request->validated());

        return response()->json([
            'message' => 'Wedding booking submitted successfully.',
            'data' => $booking,
        ], 201);
    }
}
