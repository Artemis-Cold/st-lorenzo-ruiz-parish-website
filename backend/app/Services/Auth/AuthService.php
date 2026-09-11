<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Services\Parishioner\ParishionerIdService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AuthService
{
    private const TERMS_VERSION = '2026-09-06';

    public function __construct(private UsernameGenerator $usernames) {}

    /**
     * Register a new parishioner.
     */
    public function register(array $data): array
    {
        $user = $this->createParishioner($data);

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

    private function createParishioner(array $data): User
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $username = $this->usernames->generate($data['first_name']);

            try {
                return User::create([
                    'parishioner_id' => ParishionerIdService::generate(),

                    'username' => $username,
                    'password' => Hash::make($data['password']),

                    'first_name' => $data['first_name'],
                    'middle_initial' => $data['middle_initial'] ?? null,
                    'last_name' => $data['last_name'],
                    'suffix' => $data['suffix'] ?? null,

                    'birth_date' => $data['birth_date'] ?? null,
                    'gender' => $data['gender'] ?? null,

                    'phone' => $data['phone'],
                    'phone_verified_at' => null,

                    'house_no' => $data['house_no'] ?? null,
                    'street' => $data['street'] ?? null,
                    'barangay' => $data['barangay'] ?? null,
                    'municipality' => $data['municipality'] ?? null,
                    'province' => $data['province'] ?? null,
                    'zip_code' => $data['zip_code'] ?? null,

                    'role' => 'parishioner',
                    'terms_accepted_at' => now(),
                    'terms_version' => self::TERMS_VERSION,
                ]);
            } catch (UniqueConstraintViolationException $exception) {
                $usernameWasTaken = User::query()
                    ->where('username', $username)
                    ->exists();

                if (! $usernameWasTaken || $attempt === 4) {
                    throw $exception;
                }
            }
        }

        throw new RuntimeException('Unable to create the parishioner account.');
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

        if (
            ! $user
            || $user->role !== 'parishioner'
            || ! Hash::check($credentials['password'], $user->password)
        ) {
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
     * Login a staff member or administrator.
     */
    public function loginStaff(array $credentials): array
    {
        $user = User::where('username', $credentials['username'])->first();

        if (
            ! $user
            || ! in_array($user->role, ['staff', 'admin'], true)
            || ! Hash::check($credentials['password'], $user->password)
        ) {
            abort(401, 'Invalid staff username or password.');
        }

        if (! $user->is_active) {
            abort(403, 'This staff account is inactive. Please contact an administrator.');
        }

        $token = $user
            ->createToken('staff-dashboard', ['staff'])
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
