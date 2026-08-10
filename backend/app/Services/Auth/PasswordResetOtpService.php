<?php

namespace App\Services\Auth;

use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Services\SmsNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordResetOtpService
{
    public function __construct(private SmsNotificationService $sms) {}

    public function send(string $username, string $phone, string $portal): bool
    {
        $user = $this->matchingUser($username, $phone, $portal);
        if (! $user || ($portal === 'staff' && ! $user->is_active)) {
            return false;
        }

        $code = (string) random_int(100000, 999999);

        DB::transaction(function () use ($user, $portal, $code) {
            PasswordResetOtp::query()
                ->where('user_id', $user->id)
                ->where('portal', $portal)
                ->whereNull('consumed_at')
                ->update(['consumed_at' => now()]);

            PasswordResetOtp::create([
                'user_id' => $user->id,
                'portal' => $portal,
                'code_hash' => hash('sha256', $code),
                'expires_at' => now()->addMinutes(10),
            ]);

            $this->sms->queueToUser(
                $user,
                'password_reset_otp',
                "St. Lorenzo Parish: Your password reset code is {$code}. It expires in 10 minutes. Do not share this code."
            );
        });

        return true;
    }

    public function reset(string $username, string $phone, string $portal, string $code, string $password): void
    {
        $user = $this->matchingUser($username, $phone, $portal);
        if (! $user) {
            $this->invalidCode();
        }

        $reset = DB::transaction(function () use ($user, $portal, $code, $password) {
            $otp = PasswordResetOtp::query()
                ->where('user_id', $user->id)
                ->where('portal', $portal)
                ->whereNull('consumed_at')
                ->latest('id')
                ->lockForUpdate()
                ->first();

            if (! $otp || $otp->expires_at->isPast() || $otp->attempts >= 5) {
                return false;
            }

            if (! hash_equals($otp->code_hash, hash('sha256', $code))) {
                $otp->increment('attempts');
                return false;
            }

            $otp->update(['consumed_at' => now()]);
            $user->update(['password' => Hash::make($password)]);
            $user->tokens()->delete();
            return true;
        });

        if (! $reset) {
            $this->invalidCode();
        }
    }

    private function matchingUser(string $username, string $phone, string $portal): ?User
    {
        return User::query()
            ->where('username', $username)
            ->where('phone', $phone)
            ->when(
                $portal === 'parishioner',
                fn ($query) => $query->where('role', 'parishioner'),
                fn ($query) => $query->whereIn('role', ['staff', 'admin'])
            )->first();
    }

    private function invalidCode(): never
    {
        throw ValidationException::withMessages([
            'otp' => 'The verification code is invalid or has expired.',
        ]);
    }
}
