<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;

class ServicePackageController extends Controller
{
    public function index(string $code)
    {
        $service = Service::where('code', $code)->firstOrFail();

        return response()->json(
            $service->packages()
                ->where('is_active', true)
                ->orderByDesc('recommended')
                ->orderBy('base_price')
                ->get()
        );
    }
}