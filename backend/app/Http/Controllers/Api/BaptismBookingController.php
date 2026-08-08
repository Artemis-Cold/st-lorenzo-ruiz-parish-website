<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Baptism\StoreBaptismBookingRequest;
use App\Services\BaptismBookingService;

class BaptismBookingController extends Controller
{
    public function __construct(
        private BaptismBookingService $service
    ) {}

    public function store(StoreBaptismBookingRequest $request)
    {
        $booking = $this->service->store($request->validated());

        return response()->json([
            'message' => 'Baptism booking submitted successfully.',
            'data' => $booking,
        ], 201);
    }
}
