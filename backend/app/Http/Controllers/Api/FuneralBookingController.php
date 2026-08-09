<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Funeral\StoreFuneralBookingRequest;
use App\Services\FuneralBookingService;
use Illuminate\Http\JsonResponse;

class FuneralBookingController extends Controller
{
    public function __construct(private FuneralBookingService $service) {}

    public function store(StoreFuneralBookingRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Funeral booking submitted successfully.',
            'data' => $this->service->store($request->validated()),
        ], 201);
    }
}
