<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Services\Parishioner\ParishionerIdService;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * Register a new parishioner.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'parishioner_id' => ParishionerIdService::generate(),

            'username' => $data['username'],
            'password' => Hash::make($data['password']),

            'first_name' => $data['first_name'],
            'middle_initial' => $data['middle_initial'] ?? null,
            'last_name' => $data['last_name'],
            'suffix' => $data['suffix'] ?? null,

            'birth_date' => $data['birth_date'] ?? null,
            'gender' => $data['gender'] ?? null,

            'phone' => $data['phone'],

            'house_no' => $data['house_no'] ?? null,
            'street' => $data['street'] ?? null,
            'barangay' => $data['barangay'] ?? null,
            'municipality' => $data['municipality'] ?? null,
            'province' => $data['province'] ?? null,
            'zip_code' => $data['zip_code'] ?? null,

            'role' => 'parishioner',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Sanctum Token
        |--------------------------------------------------------------------------
        */

        $token = $user
            ->createToken('mobile')
            ->plainTextToken;

        return [
            'user' => $user->fresh(),
            'token' => $token,
        ];
    }

    /**
     * Login user.
     */
    public function login(array $credentials): array
    {
        $user = User::where(
            'username',
            $credentials['username']
        )->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            abort(401, 'Invalid username or password.');
        }

        $token = $user
            ->createToken('mobile')
            ->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout current user.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
