<?php

namespace App\Jobs;

use App\Models\SmsMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendSmsMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public int $smsMessageId) {}

    public function handle(): void
    {
        $sms = SmsMessage::findOrFail($this->smsMessageId);
        $driver = config('services.sms.driver', 'log');

        if ($driver === 'log') {
            Log::info('SMS notification (log driver)', [
                'sms_message_id' => $sms->id,
                'recipient' => $sms->recipient,
                'category' => $sms->category,
                'message' => $sms->message,
            ]);

            $sms->update([
                'status' => 'sent',
                'provider_message_id' => 'log-'.$sms->id,
                'sent_at' => now(),
                'error_message' => null,
            ]);

            return;
        }

        if ($driver !== 'semaphore') {
            throw new \RuntimeException("Unsupported SMS driver [{$driver}].");
        }

        $apiKey = config('services.semaphore.api_key');

        if (! $apiKey) {
            $sms->update(['status' => 'failed', 'error_message' => 'Semaphore API key is not configured.']);

            return;
        }

        $response = Http::asForm()->timeout(15)->post(config('services.semaphore.endpoint'), array_filter([
            'apikey' => $apiKey,
            'number' => $sms->recipient,
            'message' => $sms->message,
            'sendername' => config('services.semaphore.sender_name'),
        ]));

        $response->throw();
        $result = $response->json('0');
        $sms->update([
            'status' => 'sent',
            'provider_message_id' => $result['message_id'] ?? null,
            'sent_at' => now(),
            'error_message' => null,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        SmsMessage::whereKey($this->smsMessageId)->update([
            'status' => 'failed', 'error_message' => $exception->getMessage(),
        ]);
    }
}
