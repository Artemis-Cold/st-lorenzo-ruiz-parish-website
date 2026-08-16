<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\BookingDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class StaffTransactionController extends Controller
{
    public function index(): JsonResponse
    {
        $transactions = BookingDocument::query()
            ->where('document_type', 'payment_receipt')
            ->whereHas('booking.service', fn ($query) => $query->whereIn('code', ['mass-intention', 'document-request']))
            ->with(['booking.service', 'booking.user', 'booking.massIntention', 'booking.documentRequest'])
            ->latest()
            ->get()
            ->map(fn (BookingDocument $receipt) => $this->serialize($receipt));

        return response()->json(['data' => $transactions]);
    }

    public function updateStatus(Request $request, BookingDocument $bookingDocument): JsonResponse
    {
        abort_unless($bookingDocument->document_type === 'payment_receipt', 404);
        $data = $request->validate(['status' => ['required', Rule::in(['confirmed', 'rejected'])]]);
        $bookingDocument->update(['status' => $data['status'] === 'confirmed' ? 'approved' : 'rejected']);

        $bookingDocument->load(['booking.service', 'booking.user', 'booking.massIntention', 'booking.documentRequest']);

        if ($bookingDocument->booking->service->code === 'mass-intention') {
            $bookingDocument->booking->update([
                'status' => $data['status'] === 'confirmed' ? 'paid' : 'rejected',
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
        }

        return response()->json(['data' => $this->serialize($bookingDocument)]);
    }

    private function serialize(BookingDocument $receipt): array
    {
        $booking = $receipt->booking;
        $isMass = $booking->service->code === 'mass-intention';
        $payment = $isMass ? $booking->massIntention : $booking->documentRequest;

        return [
            'id' => $receipt->id,
            'date' => $booking->created_at->format('m-d-Y'),
            'name' => $booking->user->full_name,
            'contactNumber' => $booking->user->phone,
            'type' => $isMass ? 'Mass Intention' : 'Document Request',
            'reference' => $payment?->payment_reference,
            'amount' => (float) ($payment?->total_amount ?? 0),
            'receipt' => ['fileName' => $receipt->file_name, 'url' => Storage::disk('public')->url($receipt->file_path)],
            'status' => match ($receipt->status) {
                'approved' => 'confirmed', 'rejected' => 'rejected', default => 'pending'
            },
        ];
    }
}
