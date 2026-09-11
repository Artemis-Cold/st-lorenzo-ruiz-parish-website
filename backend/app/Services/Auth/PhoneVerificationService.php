<?php

namespace App\Services\Auth;

use App\Models\PhoneVerificationOtp;
use App\Models\User;
use App\Services\SmsNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PhoneVerificationService
{
    public function __construct(private SmsNotificationService $sms) {}

    public function send(User $user): void
    {
        if ($user->phone_verified_at) {
            throw ValidationException::withMessages([
                'phone' => 'Your mobile number is already verified.',
            ]);
        }

        $code = (string) random_int(100000, 999999);

        DB::transaction(function () use ($user, $code) {
            PhoneVerificationOtp::query()
                ->where('user_id', $user->id)
                ->whereNull('consumed_at')
                ->update(['consumed_at' => now()]);

            PhoneVerificationOtp::create([
                'user_id' => $user->id,
                'code_hash' => hash('sha256', $code),
                'expires_at' => now()->addMinutes(10),
            ]);

            $this->sms->queueToUser(
                $user,
                'phone_verification_otp',
                "St. Lorenzo Ruiz Parish: Your username is {$user->username}. Your mobile verification code is {$code}. This code expires in 10 minutes. Do not share it with anyone."
            );
        });
    }

    public function verify(User $user, string $code): void
    {
        if ($user->phone_verified_at) {
            return;
        }

        $verified = DB::transaction(function () use ($user, $code) {
            $otp = PhoneVerificationOtp::query()
                ->where('user_id', $user->id)
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
            $user->forceFill(['phone_verified_at' => now()])->save();

            return true;
        });

        if (! $verified) {
            throw ValidationException::withMessages([
                'otp' => 'The verification code is invalid or has expired.',
            ]);
        }
    }
}
