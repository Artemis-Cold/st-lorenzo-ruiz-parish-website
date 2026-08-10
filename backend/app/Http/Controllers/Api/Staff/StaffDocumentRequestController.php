<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdateBookingStatusRequest;
use App\Models\DocumentRequestBooking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StaffDocumentRequestController extends Controller
{
    use ManagesBookingStatus;

    public function index(): JsonResponse
    {
        $requests = DocumentRequestBooking::query()
            ->with(['items', 'booking.user', 'booking.documents'])
            ->latest()
            ->get()
            ->map(fn (DocumentRequestBooking $documentRequest) => $this->serialize($documentRequest));

        return response()->json(['data' => $requests]);
    }

    public function updateStatus(
        UpdateBookingStatusRequest $request,
        DocumentRequestBooking $documentRequestBooking
    ): JsonResponse {
        $documentRequest = $documentRequestBooking->load([
            'items', 'booking.user', 'booking.documents',
        ]);
        $booking = $documentRequest->booking;

        $this->changeStatus($booking, $request->validated('status'), [
            'pending' => ['approved', 'rejected', 'cancelled'],
            'approved' => ['completed', 'cancelled'],
        ]);

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
