<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\BookingDocument;
use App\Services\SmsNotificationService;
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
            'status' => ['nullable', 'in:pending,confirmed,rejected'],
            'service' => ['nullable', 'in:mass-intention,document-request,baptism,wedding,funeral'],
            'search' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = BookingDocument::query()
            ->where('document_type', 'payment_receipt')
            ->whereHas('booking.service', fn ($query) => $query->whereIn('code', [
                'mass-intention', 'document-request', 'baptism', 'wedding', 'funeral',
            ]));

        if (! empty($filters['status'])) {
            $databaseStatus = match ($filters['status']) {
                'confirmed' => 'approved',
                'rejected' => 'rejected',
                default => 'pending',
            };
            $query->where('status', $databaseStatus);
        }

        if (! empty($filters['service'])) {
            $query->whereHas(
                'booking.service',
                fn ($service) => $service->where('code', $filters['service'])
            );
        }

        if (! empty($filters['date'])) {
            $query->whereHas(
                'booking',
                fn ($booking) => $booking->whereDate('created_at', $filters['date'])
            );
        }

        $searchTerms = preg_split('/\s+/', trim($filters['search'] ?? ''), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($searchTerms ?: [] as $term) {
            $like = '%'.$term.'%';
            $query->where(function ($receipt) use ($like) {
                $receipt
                    ->where('file_name', 'like', $like)
                    ->orWhereHas('booking', fn ($booking) => $booking
                        ->where('booking_reference', 'like', $like)
                        ->orWhere('payment_reference', 'like', $like)
                        ->orWhereHas('user', fn ($user) => $user
                            ->where('first_name', 'like', $like)
                            ->orWhere('middle_initial', 'like', $like)
                            ->orWhere('last_name', 'like', $like)
                            ->orWhere('username', 'like', $like)
                            ->orWhere('phone', 'like', $like))
                        ->orWhereHas('massIntention', fn ($mass) => $mass
                            ->where('payment_reference', 'like', $like))
                        ->orWhereHas('documentRequest', fn ($document) => $document
                            ->where('payment_reference', 'like', $like)));
            });
        }

        $transactions = $query
            ->with([
                'booking.service', 'booking.user', 'booking.massIntention',
                'booking.documentRequest.items', 'booking.package.inclusions',
                'booking.selectedAddons',
            ])
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        $data = $transactions->getCollection()
            ->map(fn (BookingDocument $receipt) => $this->serialize($receipt));

        return response()->json([
            'data' => $data,
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
        BookingDocument $bookingDocument,
        SmsNotificationService $sms
    ): JsonResponse {
        abort_unless($bookingDocument->document_type === 'payment_receipt', 404);
        $data = $request->validate(['status' => ['required', Rule::in(['confirmed', 'rejected'])]]);

        if ($bookingDocument->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Only a pending payment can be confirmed or rejected.',
            ]);
        }

        if (! in_array($bookingDocument->booking()->value('status'), ['pending', 'paid'], true)) {
            throw ValidationException::withMessages([
                'status' => 'Payment verification is no longer available after the related request has moved beyond payment review.',
            ]);
        }

        DB::transaction(function () use ($bookingDocument, $data, $request) {
            $bookingDocument->update([
                'status' => $data['status'] === 'confirmed' ? 'approved' : 'rejected',
            ]);

            $booking = $bookingDocument->booking;
            $booking->update([
                // Paid is assigned only here, after parish staff confirms the receipt.
                'status' => $data['status'] === 'confirmed' ? 'paid' : 'pending',
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
        });

        $bookingDocument->load([
            'booking.service', 'booking.user', 'booking.massIntention',
            'booking.documentRequest.items', 'booking.package.inclusions',
            'booking.selectedAddons',
        ]);

        $booking = $bookingDocument->booking;
        $service = $booking->service->name;
        $reference = $booking->booking_reference;
        $isDocumentRequest = $booking->service->code === 'document-request';
        $documentTypes = $booking->documentRequest?->items
            ->pluck('document_type')
            ->filter()
            ->unique()
            ->values()
            ->join(', ', ' and ') ?: 'parish document';
        $message = match (true) {
            $data['status'] === 'confirmed' && $isDocumentRequest => "St. Lorenzo Ruiz Parish: Your GCash payment for {$documentTypes} (Ref: {$reference}) has been confirmed. Your document request is now being prepared. We will notify you by SMS when it is ready for pickup. Thank you.",
            $data['status'] === 'confirmed' => "St. Lorenzo Ruiz Parish: Your GCash payment for {$service} (Ref: {$reference}) has been confirmed. Your booking is now marked as paid. Thank you.",
            default => "St. Lorenzo Ruiz Parish: We could not verify the GCash payment for {$service} (Ref: {$reference}). Please review the reference number and receipt, then submit your payment details again through My Profile.",
        };
        $sms->queue($booking, 'payment_status', $message);

        return response()->json(['data' => $this->serialize($bookingDocument)]);
    }

    private function serialize(BookingDocument $receipt): array
    {
        $booking = $receipt->booking;
        $serviceCode = $booking->service->code;
        $payment = match ($serviceCode) {
            'mass-intention' => $booking->massIntention,
            'document-request' => $booking->documentRequest,
            default => null,
        };
        $type = match ($serviceCode) {
            'mass-intention' => 'Mass Intention',
            'document-request' => 'Document Request',
            'wedding' => 'Wedding',
            'funeral' => 'Funeral',
            default => 'Baptism',
        };

        return [
            'id' => $receipt->id,
            'bookingReference' => $booking->booking_reference,
            'date' => $booking->created_at->format('m-d-Y'),
            'name' => $booking->user->full_name,
            'contactNumber' => $booking->user->phone,
            'type' => $type,
            'reference' => $booking->payment_reference ?? $payment?->payment_reference,
            'amount' => (float) ($payment?->total_amount ?? $booking->total_amount),
            'receipt' => ['fileName' => $receipt->file_name, 'url' => Storage::disk('public')->url($receipt->file_path)],
            'status' => match ($receipt->status) {
                'approved' => 'confirmed', 'rejected' => 'rejected', default => 'pending'
            },
        ];
    }
}
