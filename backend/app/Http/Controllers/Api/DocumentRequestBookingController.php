<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest\StoreDocumentRequestBookingRequest;
use App\Services\DocumentRequestBookingService;
use Illuminate\Http\JsonResponse;

class DocumentRequestBookingController extends Controller
{
    public function __construct(
        private DocumentRequestBookingService $service
    ) {}

    public function store(
        StoreDocumentRequestBookingRequest $request
    ): JsonResponse {
        return response()->json([
            'message' => 'Document request submitted successfully.',
            'data' => $this->service->store($request->validated()),
        ], 201);
    }
}
