<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;

class ServiceFeeController extends Controller
{
    public function index(string $code): JsonResponse
    {
        $service = Service::query()
            ->where('code', $code)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $service->fees()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn ($fee) => [
                    'id' => $fee->id,
                    'code' => $fee->code,
                    'name' => $fee->name,
                    'amount' => (float) $fee->amount,
                ])
                ->values(),
        ]);
    }
}
