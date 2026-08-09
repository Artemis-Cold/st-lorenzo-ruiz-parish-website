<?php

use App\Http\Controllers\Api\BaptismBookingController;
use App\Http\Controllers\Api\BookingSlotController;
use App\Http\Controllers\Api\ServicePackageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

    Route::post('/register', RegisterController::class);

    Route::post('/login', LoginController::class);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', LogoutController::class);

        Route::get('/me', ProfileController::class);

    });

});

Route::middleware('auth:sanctum')->group(function () {

    Route::post(
        '/bookings/baptism',
        [BaptismBookingController::class, 'store']
    );

    Route::patch('/profile/complete', [ProfileController::class, 'complete']);

});

Route::get(
    '/services/{code}/packages',
    [ServicePackageController::class, 'index']
);

Route::get(
    '/booking-slots',
    [BookingSlotController::class, 'index']
);

Route::get('/', function () {
    return response()->json([
        'name' => 'ParishConnect API',
        'version' => '1.0.0',
        'status' => 'OK',
    ]);
});
