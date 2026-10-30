<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function activateCashPreference(Booking $booking): void
    {
        DB::transaction(function () use ($booking) {
            $locked = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            if ($locked->status !== 'pending' || $locked->preferred_payment_method !== 'cash'
                || (float) $this->amountFor($locked) <= 0
                || ! app(BookingRequirementService::class)->paymentReady($locked)
                || $locked->payments()->whereIn('status', [...Payment::ACTIVE_STATUSES, 'confirmed'])->exists()) {
                return;
            }
            $this->createAttempt($locked, 'cash');
        });
    }

    public function createAttempt(
        Booking $booking,
        string $method,
        ?string $referenceNumber = null,
        ?UploadedFile $receipt = null,
    ): Payment {
        return DB::transaction(function () use ($booking, $method, $referenceNumber, $receipt) {
            $lockedBooking = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            $serviceCode = $lockedBooking->service()->value('code');
            app(BookingRequirementService::class)->requirePaymentReady($lockedBooking);
            $amount = $this->amountFor($lockedBooking);
            if ((float) $amount <= 0) {
                throw ValidationException::withMessages(['payment_method' => 'No payment is required for this booking.']);
            }

            if (in_array($serviceCode, ['mass-intention', 'document-request'], true) && $method !== 'gcash') {
                throw ValidationException::withMessages([
                    'payment_method' => 'GCash is the only accepted payment method for this service.',
                ]);
            }

            if ($lockedBooking->status === 'paid' || $lockedBooking->payments()->where('status', 'confirmed')->exists()) {
                throw ValidationException::withMessages([
                    'payment_method' => 'This booking payment has already been confirmed.',
                ]);
            }

            $active = $lockedBooking->payments()
                ->whereIn('status', Payment::ACTIVE_STATUSES)
                ->latest('id')
                ->first();

            if ($active && $active->method === $method) {
                $message = $method === 'cash'
                    ? 'Cash payment is already awaiting payment at the parish office.'
                    : 'Your GCash payment is already awaiting parish staff verification.';

                throw ValidationException::withMessages(['payment_method' => $message]);
            }

            $active?->update([
                'status' => 'voided',
                'voided_at' => now(),
                'notes' => 'Payment method changed by the parishioner.',
            ]);
            $active?->receiptDocument?->update([
                'status' => 'rejected',
                'remarks' => 'Payment method changed by the parishioner.',
            ]);

            $receiptDocument = null;
            if ($method === 'gcash' && $receipt) {
                $receiptDocument = $lockedBooking->documents()->create([
                    'document_type' => 'payment_receipt',
                    'file_name' => $receipt->getClientOriginalName(),
                    'file_path' => $receipt->store('booking-documents', 'public'),
                    'status' => 'pending',
                ]);
            }

            $payment = $lockedBooking->payments()->create([
                'method' => $method,
                'amount' => $amount,
                'status' => $method === 'gcash' ? 'pending_verification' : 'awaiting_payment',
                'reference_number' => $method === 'gcash' ? $referenceNumber : null,
                'receipt_document_id' => $receiptDocument?->id,
            ]);

            $lockedBooking->update([
                'preferred_payment_method' => $method,
                'payment_reference' => $method === 'gcash' ? $referenceNumber : null,
            ]);
            $lockedBooking->massIntention?->update([
                'payment_reference' => $method === 'gcash' ? $referenceNumber : null,
            ]);
            $lockedBooking->documentRequest?->update([
                'payment_reference' => $method === 'gcash' ? $referenceNumber : null,
            ]);

            return $payment->load(['booking', 'receiptDocument']);
        });
    }

    public function amountFor(Booking $booking): string
    {
        $booking->loadMissing(['service', 'package.inclusions', 'selectedAddons', 'massIntention', 'documentRequest']);

        return match ($booking->service?->code) {
            'mass-intention' => (string) ($booking->massIntention?->total_amount ?? 0),
            'document-request' => (string) ($booking->documentRequest?->total_amount ?? 0),
            default => (string) $booking->total_amount,
        };
    }
}
