<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\ProfileController;

Route::prefix('auth')->group(function () {

    Route::post('/register', RegisterController::class);

    Route::post('/login', LoginController::class);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', LogoutController::class);

        Route::get('/me', ProfileController::class);

    });

    

});

Route::get('/', function () {
    return response()->json([
        'name' => 'ParishConnect API',
        'version' => '1.0.0',
        'status' => 'OK',
    ]);
});