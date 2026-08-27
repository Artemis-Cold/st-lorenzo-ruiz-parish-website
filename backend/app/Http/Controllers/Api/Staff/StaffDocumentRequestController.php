<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdateBookingStatusRequest;
use App\Models\DocumentRequestBooking;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StaffDocumentRequestController extends Controller
{
    use ManagesBookingStatus;

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:pending,paid,approved,ready_for_pickup,completed,rejected,cancelled'],
            'search' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = DocumentRequestBooking::query();

        if (! empty($filters['status'])) {
            $query->whereHas(
                'booking',
                fn ($booking) => $booking->where('status', $filters['status'])
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
            $query->where(function ($documentRequest) use ($like) {
                $documentRequest
                    ->where('payment_reference', 'like', $like)
                    ->orWhereHas('items', fn ($item) => $item
                        ->where('document_type', 'like', $like))
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

        $requests = $query
            ->with(['items', 'booking.user', 'booking.documents'])
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        $data = $requests->getCollection()
            ->map(fn (DocumentRequestBooking $documentRequest) => $this->serialize($documentRequest));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
                'from' => $requests->firstItem(),
                'to' => $requests->lastItem(),
            ],
        ]);
    }

    public function updateStatus(
        UpdateBookingStatusRequest $request,
        DocumentRequestBooking $documentRequestBooking
    ): JsonResponse {
        $documentRequest = $documentRequestBooking->load([
            'items', 'booking.user', 'booking.documents',
        ]);
        $booking = $documentRequest->booking;

        if ($request->validated('status') === 'ready_for_pickup' && $booking->status !== 'paid') {
            throw ValidationException::withMessages([
                'status' => 'Only a document request with a confirmed payment can be marked ready for pickup.',
            ]);
        }

        $this->changeStatus($booking, $request->validated('status'), [
            'pending' => ['rejected', 'cancelled'],
            'paid' => ['ready_for_pickup', 'rejected', 'cancelled'],
            'ready_for_pickup' => ['completed', 'cancelled'],
        ]);

        $status = $request->validated('status');
        $documentTypes = $documentRequest->items
            ->pluck('document_type')
            ->filter()
            ->unique()
            ->values()
            ->join(', ', ' and ');
        $documentTypes = $documentTypes ?: 'parish document';
        $reference = $booking->booking_reference;
        $message = match ($status) {
            'ready_for_pickup' => "St. Lorenzo Ruiz Parish: Your request for {$documentTypes} (Ref: {$reference}) is ready for pickup. Please claim it at the parish office during office hours. Thank you.",
            'completed' => "St. Lorenzo Ruiz Parish: Your request for {$documentTypes} (Ref: {$reference}) has been completed. Thank you for coordinating with the parish office.",
            'rejected' => "St. Lorenzo Ruiz Parish: Your request for {$documentTypes} (Ref: {$reference}) could not be approved. Please contact the parish office for assistance.",
            'cancelled' => "St. Lorenzo Ruiz Parish: Your request for {$documentTypes} (Ref: {$reference}) has been cancelled. Please contact the parish office if you have questions.",
            default => "St. Lorenzo Ruiz Parish: The status of your request for {$documentTypes} (Ref: {$reference}) has been updated.",
        };

        app(SmsNotificationService::class)->queue(
            $booking->loadMissing('user'),
            'document_status',
            $message
        );

        $documentRequest->load(['items', 'booking.user', 'booking.documents']);

        return response()->json(['data' => $this->serialize($documentRequest)]);
    }

    private function serialize(DocumentRequestBooking $documentRequest): array
    {
        $booking = $documentRequest->booking;
        $receipt = $booking->documents->firstWhere('document_type', 'payment_receipt');

        return [
            'id' => $documentRequest->id,
            'bookingId' => $booking->id,
            'date' => $booking->created_at->format('m-d-Y'),
            'name' => $booking->user->full_name,
            'contactNumber' => $booking->user->phone,
            'category' => 'Document',
            'subtype' => $documentRequest->items->pluck('document_type')->join(', '),
            'amount' => (float) $documentRequest->total_amount,
            'status' => $booking->status,
            'reference' => $booking->booking_reference,
            'paymentReference' => $documentRequest->payment_reference,
            'remarks' => $booking->remarks,
            'receipt' => $receipt ? [
                'fileName' => $receipt->file_name,
                'url' => Storage::disk('public')->url($receipt->file_path),
            ] : null,
            'documents' => $documentRequest->items->map(fn ($item) => [
                'id' => $item->id,
                'type' => $item->document_type,
                'price' => (float) $item->price,
                'details' => $item->details,
            ])->values(),
        ];
    }
}
