<?php

namespace App\Jobs;

use App\Models\SmsMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class SendSmsMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [10, 30, 60];

    public function __construct(public int $smsMessageId) {}

    public function handle(): void
    {
        $sms = SmsMessage::findOrFail($this->smsMessageId);
        $driver = config('services.sms.driver', 'log');

        try {
            if ($driver === 'database') {
                Log::info('SMS notification stored for later delivery (database driver).', [
                    'sms_message_id' => $sms->id,
                    'recipient' => $sms->recipient,
                    'category' => $sms->category,
                ]);

                return;
            }

            if ($driver === 'log') {
                $this->sendToLog($sms);

                return;
            }

            if ($driver !== 'semaphore') {
                throw new RuntimeException("Unsupported SMS driver [{$driver}].");
            }

            $this->sendToSemaphore($sms);
        } catch (Throwable $exception) {
            $this->recordFailure($sms, $exception);

            // With the sync driver, this job runs inside the web request. The
            // notification must fail independently instead of turning an
            // already-saved booking into an HTTP 500 response.
            if (config('queue.default') !== 'sync') {
                throw $exception;
            }
        }
    }

    public function failed(Throwable $exception): void
    {
        SmsMessage::whereKey($this->smsMessageId)->update([
            'status' => 'failed', 'error_message' => $exception->getMessage(),
        ]);
    }

    private function sendToLog(SmsMessage $sms): void
    {
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
    }

    private function sendToSemaphore(SmsMessage $sms): void
    {
        $apiKey = config('services.semaphore.api_key');

        if (! $apiKey) {
            throw new RuntimeException('Semaphore API key is not configured.');
        }

        $response = Http::asForm()
            ->connectTimeout(config('services.semaphore.connect_timeout', 5))
            ->timeout(config('services.semaphore.request_timeout', 15))
            ->retry(2, 250)
            ->post(config('services.semaphore.endpoint'), array_filter([
                'apikey' => $apiKey,
                'number' => $sms->recipient,
                'message' => $sms->message,
                'sendername' => config('services.semaphore.sender_name'),
            ]));

        $response->throw();
        $result = $response->json('0');

        if (! is_array($result) || empty($result['message_id'])) {
            throw new RuntimeException('Semaphore returned an invalid response.');
        }

        $sms->update([
            'status' => 'sent',
            'provider_message_id' => (string) $result['message_id'],
            'sent_at' => now(),
            'error_message' => null,
        ]);
    }

    private function recordFailure(SmsMessage $sms, Throwable $exception): void
    {
        $sms->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);

        Log::warning('SMS notification failed without interrupting the request.', [
            'sms_message_id' => $sms->id,
            'driver' => config('services.sms.driver', 'log'),
            'error' => $exception->getMessage(),
        ]);
    }
}
