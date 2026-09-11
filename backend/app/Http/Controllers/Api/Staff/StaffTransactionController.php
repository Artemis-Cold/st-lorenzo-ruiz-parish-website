<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\SmsNotificationService;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StaffTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:pending,awaiting_payment,pending_verification,confirmed,rejected,voided'],
            'method' => ['nullable', 'in:gcash,cash'],
            'service' => ['nullable', 'in:mass-intention,document-request,baptism,wedding,funeral'],
            'search' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Payment::query()
            ->whereHas('booking.service', fn ($query) => $query->whereIn('code', [
                'mass-intention', 'document-request', 'baptism', 'wedding', 'funeral',
            ]));

        if (($filters['status'] ?? null) === 'pending') {
            $query->whereIn('status', Payment::ACTIVE_STATUSES);
        } elseif (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['method'])) {
            $query->where('method', $filters['method']);
        }

        if (! empty($filters['service'])) {
            $query->whereHas(
                'booking.service',
                fn ($service) => $service->where('code', $filters['service'])
            );
        }

        if (! empty($filters['date'])) {
            $query->whereDate('created_at', $filters['date']);
        }

        $searchTerms = preg_split('/\s+/', trim($filters['search'] ?? ''), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($searchTerms ?: [] as $term) {
            $like = '%'.$term.'%';
            $query->where(function ($payment) use ($like) {
                $payment
                    ->where('reference_number', 'like', $like)
                    ->orWhere('official_receipt_number', 'like', $like)
                    ->orWhereHas('receiptDocument', fn ($receipt) => $receipt->where('file_name', 'like', $like))
                    ->orWhereHas('booking', fn ($booking) => $booking
                        ->where('booking_reference', 'like', $like)
                        ->orWhereHas('user', fn ($user) => $user
                            ->where('first_name', 'like', $like)
                            ->orWhere('middle_initial', 'like', $like)
                            ->orWhere('last_name', 'like', $like)
                            ->orWhere('username', 'like', $like)
                            ->orWhere('phone', 'like', $like)));
            });
        }

        $transactions = $query
            ->with([
                'receiptDocument', 'booking.service', 'booking.user',
                'booking.massIntention', 'booking.documentRequest.items',
                'booking.package.inclusions', 'booking.selectedAddons',
            ])
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        return response()->json([
            'data' => $transactions->getCollection()
                ->map(fn (Payment $payment) => $this->serialize($payment)),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'from' => $transactions->firstItem(),
                'to' => $transactions->lastItem(),
            ],
        ]);
    }

    public function updateStatus(
        Request $request,
        Payment $payment,
        SmsNotificationService $sms
    ): JsonResponse {
        $data = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'rejected'])],
            'amount_received' => [
                Rule::requiredIf($payment->method === 'cash' && $request->input('status') === 'confirmed'),
                'nullable', 'numeric', 'min:0.01', 'decimal:0,2',
            ],
            'official_receipt_number' => [
                Rule::requiredIf($payment->method === 'cash' && $request->input('status') === 'confirmed'),
                'nullable', 'string', 'max:100',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($payment->method === 'cash' && $data['status'] === 'rejected') {
            throw ValidationException::withMessages([
                'status' => 'Cash payments cannot be rejected. Leave them awaiting payment or confirm the cash received.',
            ]);
        }

        if ($payment->method === 'cash'
            && round((float) $data['amount_received'], 2) !== round((float) $payment->amount, 2)) {
            throw ValidationException::withMessages([
                'amount_received' => 'The received amount must equal the amount due.',
            ]);
        }

        DB::transaction(function () use ($payment, $data, $request) {
            $lockedPayment = Payment::query()->lockForUpdate()->findOrFail($payment->id);
            $allowedStatus = $lockedPayment->method === 'cash'
                ? 'awaiting_payment'
                : 'pending_verification';

            if ($lockedPayment->status !== $allowedStatus) {
                throw ValidationException::withMessages([
                    'status' => 'Only the active, unconfirmed payment attempt can be processed.',
                ]);
            }

            if (! in_array($lockedPayment->booking()->value('status'), ['pending', 'paid'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'Payment verification is unavailable after the related request has moved beyond payment review.',
                ]);
            }

            $lockedPayment->update([
                'status' => $data['status'],
                'official_receipt_number' => $data['official_receipt_number'] ?? null,
                'confirmed_by' => $data['status'] === 'confirmed' ? $request->user()->id : null,
                'confirmed_at' => $data['status'] === 'confirmed' ? now() : null,
                'notes' => $data['notes'] ?? null,
            ]);

            $lockedPayment->receiptDocument?->update([
                'status' => $data['status'] === 'confirmed' ? 'approved' : 'rejected',
            ]);

            $lockedPayment->booking->update([
                'status' => $data['status'] === 'confirmed' ? 'paid' : 'pending',
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
        });

        $payment->refresh()->load([
            'receiptDocument', 'booking.service', 'booking.user',
            'booking.massIntention', 'booking.documentRequest.items',
            'booking.package.inclusions', 'booking.selectedAddons',
        ]);

        $booking = $payment->booking;
        $service = $booking->service->name;
        $reference = $booking->booking_reference;
        $isDocumentRequest = $booking->service->code === 'document-request';
        $documentTypes = $booking->documentRequest?->items
            ->pluck('document_type')->filter()->unique()->values()->join(', ', ' and ')
            ?: 'parish document';

        $message = match (true) {
            $data['status'] === 'confirmed' && $payment->method === 'cash' && $isDocumentRequest => "St. Lorenzo Ruiz Parish: We received your cash payment of PHP {$payment->amount} for {$documentTypes} (Ref: {$reference}; OR: {$payment->official_receipt_number}). Your document request is now being prepared. We will notify you by SMS when it is ready for pickup. Thank you.",
            $data['status'] === 'confirmed' && $payment->method === 'cash' => "St. Lorenzo Ruiz Parish: We received your cash payment of PHP {$payment->amount} for {$service} (Ref: {$reference}; OR: {$payment->official_receipt_number}). Your booking is now paid. Thank you.",
            $data['status'] === 'confirmed' && $isDocumentRequest => "St. Lorenzo Ruiz Parish: Your GCash payment for {$documentTypes} (Ref: {$reference}) has been confirmed. Your document request is now being prepared. We will notify you by SMS when it is ready for pickup. Thank you.",
            $data['status'] === 'confirmed' => "St. Lorenzo Ruiz Parish: Your GCash payment for {$service} (Ref: {$reference}) has been confirmed. Your booking is now paid. Thank you.",
            default => "St. Lorenzo Ruiz Parish: We could not verify the GCash payment for {$service} (Ref: {$reference}). Please submit corrected payment details through My Profile or select cash payment at the parish office.",
        };
        $sms->queue($booking, 'payment_status', $message);

        return response()->json(['data' => $this->serialize($payment)]);
    }

    private function serialize(Payment $payment): array
    {
        $booking = $payment->booking;
        $type = match ($booking->service->code) {
            'mass-intention' => 'Mass Intention',
            'document-request' => 'Document Request',
            'wedding' => 'Wedding',
            'funeral' => 'Funeral',
            default => 'Baptism',
        };
        $receipt = $payment->receiptDocument;

        return [
            'id' => $payment->id,
            'bookingReference' => $booking->booking_reference,
            'date' => $payment->created_at->format('m-d-Y'),
            'name' => $booking->user->full_name,
            'contactNumber' => $booking->user->phone,
            'type' => $type,
            'method' => $payment->method,
            'reference' => $payment->reference_number,
            'officialReceiptNumber' => $payment->official_receipt_number,
            'amount' => Money::decimal($payment->amount),
            'receipt' => $receipt ? [
                'fileName' => $receipt->file_name,
                'url' => Storage::disk('public')->url($receipt->file_path),
            ] : null,
            'status' => $payment->status,
            'notes' => $payment->notes,
        ];
    }
}
