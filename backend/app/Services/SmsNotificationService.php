<?php

namespace App\Services;

use App\Jobs\SendSmsMessage;
use App\Models\Booking;
use App\Models\SmsMessage;
use App\Models\User;

class SmsNotificationService
{
    public function queue(Booking $booking, string $category, string $message): SmsMessage
    {
        return $this->queueToUser($booking->user, $category, $message, $booking->id);
    }

    public function queueToUser(User $user, string $category, string $message, ?int $bookingId = null): SmsMessage
    {
        $sms = SmsMessage::create([
            'user_id' => $user->id,
            'booking_id' => $bookingId,
            'category' => $category,
            'recipient' => $this->normalize($user->phone),
            'message' => $message,
        ]);

        if (config('services.sms.driver', 'log') !== 'database') {
            SendSmsMessage::dispatch($sms->id)->afterCommit();
        }

        return $sms;
    }

    private function normalize(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone);

        return str_starts_with($digits, '09') ? '63'.substr($digits, 1) : $digits;
    }
}
