<?php

namespace App\Services\Auth;

use App\Models\RegistrationPhoneOtp;
use App\Services\SmsNotificationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RegistrationPhoneVerificationService
{
    public function __construct(private SmsNotificationService $sms) {}

    public function send(string $phone): void
    {
        $code = (string) random_int(100000, 999999);

        DB::transaction(function () use ($phone, $code) {
            RegistrationPhoneOtp::where('phone', $phone)->whereNull('consumed_at')
                ->update(['consumed_at' => now()]);
            RegistrationPhoneOtp::create([
                'phone' => $phone,
                'code_hash' => hash('sha256', $code),
                'expires_at' => now()->addMinutes(10),
            ]);
            $this->sms->queueToPhone($phone, 'registration_phone_otp',
                "St. Lorenzo Ruiz Parish: Your sign-up verification code is {$code}. This code expires in 10 minutes. Do not share it with anyone.");
        });
    }

    public function consume(string $phone, string $code): void
    {
        $verified = DB::transaction(function () use ($phone, $code) {
            $otp = RegistrationPhoneOtp::where('phone', $phone)->whereNull('consumed_at')
                ->latest('id')->lockForUpdate()->first();
            if (! $otp || $otp->expires_at->isPast() || $otp->attempts >= 5) {
                return false;
            }
            if (! hash_equals($otp->code_hash, hash('sha256', $code))) {
                $otp->increment('attempts');

                return false;
            }
            $otp->update(['consumed_at' => now()]);

            return true;
        });

        if (! $verified) {
            throw ValidationException::withMessages(['otp' => 'The verification code is invalid or has expired.']);
        }
    }
}
