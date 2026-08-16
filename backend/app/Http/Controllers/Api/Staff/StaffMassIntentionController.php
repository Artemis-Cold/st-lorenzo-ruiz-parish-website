<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\MassIntentionEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StaffMassIntentionController extends Controller
{
    public function index(): JsonResponse
    {
        $entries = MassIntentionEntry::query()
            ->with(['massIntention.booking.user', 'massIntention.booking.documents'])
            ->latest()
            ->get()
            ->map(fn (MassIntentionEntry $entry) => $this->serialize($entry));

        return response()->json(['data' => $entries]);
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
