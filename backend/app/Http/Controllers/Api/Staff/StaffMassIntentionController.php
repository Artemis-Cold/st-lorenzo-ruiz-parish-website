<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdateBookingStatusRequest;
use App\Models\MassIntentionEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StaffMassIntentionController extends Controller
{
    use ManagesBookingStatus;

    public function index(): JsonResponse
    {
        $entries = MassIntentionEntry::query()
            ->with(['massIntention.booking.user', 'massIntention.booking.documents'])
            ->latest()
            ->get()
            ->map(fn (MassIntentionEntry $entry) => $this->serialize($entry));

        return response()->json(['data' => $entries]);
    }

    public function updateStatus(
        UpdateBookingStatusRequest $request,
        MassIntentionEntry $massIntentionEntry
    ): JsonResponse {
        $entry = $massIntentionEntry->load([
            'massIntention.booking.user', 'massIntention.booking.documents',
        ]);
        $booking = $entry->massIntention->booking;

        $this->changeStatus($booking, $request->validated('status'), [
            'pending' => ['approved', 'rejected'],
        ]);

        $entry->load([
            'massIntention.booking.user', 'massIntention.booking.documents',
        ]);

        return response()->json(['data' => $this->serialize($entry)]);
    }

    private function serialize(MassIntentionEntry $entry): array
    {
        $massIntention = $entry->massIntention;
        $booking = $massIntention->booking;
        $receipt = $booking->documents->firstWhere('document_type', 'payment_receipt');

        return [
            'id' => $entry->id,
            'bookingId' => $booking->id,
            'date' => $massIntention->intention_date->format('m-d-Y'),
            'names' => collect($entry->names)->filter()->join(' & '),
            'contactNumber' => $booking->user->phone,
            'type' => $entry->intention_type,
            'amount' => (float) $entry->amount,
            'status' => $booking->status,
            'reference' => $booking->booking_reference,
            'paymentReference' => $massIntention->payment_reference,
            'receipt' => $receipt ? [
                'fileName' => $receipt->file_name,
                'url' => Storage::disk('public')->url($receipt->file_path),
            ] : null,
        ];
    }
}
