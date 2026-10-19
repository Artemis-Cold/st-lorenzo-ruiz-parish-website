<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FormationSacrament\StoreFormationSacramentBookingRequest;
use App\Services\FormationSacramentBookingService;
use Illuminate\Http\JsonResponse;

class FormationSacramentBookingController extends Controller
{
    public function __construct(private FormationSacramentBookingService $service) {}

    public function store(
        StoreFormationSacramentBookingRequest $request,
        string $serviceCode,
    ): JsonResponse {
        $booking = $this->service->store($request->validated());

        return response()->json([
            'message' => $serviceCode === 'confirmation'
                ? 'Confirmation booking submitted successfully.'
                : 'First Communion booking submitted successfully.',
            'data' => $booking,
        ], 201);
    }
}
