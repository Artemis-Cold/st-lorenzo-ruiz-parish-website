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
    public function index(): JsonResponse
    {
        $transactions = BookingDocument::query()
            ->where('document_type', 'payment_receipt')
            ->whereHas('booking.service', fn ($query) => $query->whereIn('code', [
                'mass-intention', 'document-request', 'baptism', 'wedding', 'funeral',
            ]))
            ->with([
                'booking.service', 'booking.user', 'booking.massIntention',
                'booking.documentRequest', 'booking.package.inclusions',
                'booking.selectedAddons',
            ])
            ->latest()
            ->get()
            ->map(fn (BookingDocument $receipt) => $this->serialize($receipt));

        return response()->json(['data' => $transactions]);
    }

    public function updateStatus(
        Request $request,
        BookingDocument $bookingDocument,
        SmsNotificationService $sms
    ): JsonResponse
    {
        abort_unless($bookingDocument->document_type === 'payment_receipt', 404);
        $data = $request->validate(['status' => ['required', Rule::in(['confirmed', 'rejected'])]]);

        if ($bookingDocument->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'Only a pending payment can be confirmed or rejected.',
            ]);
        }

        DB::transaction(function () use ($bookingDocument, $data, $request) {
            $bookingDocument->update([
                'status' => $data['status'] === 'confirmed' ? 'approved' : 'rejected',
            ]);

            $booking = $bookingDocument->booking;
            $bookingStatus = in_array($booking->status, ['pending', 'paid'], true)
                ? ($data['status'] === 'confirmed' ? 'paid' : 'pending')
                : $booking->status;
            $booking->update([
                'status' => $bookingStatus,
                'processed_by' => $request->user()->id,
                'processed_at' => now(),
            ]);
        });

        $bookingDocument->load([
            'booking.service', 'booking.user', 'booking.massIntention',
            'booking.documentRequest', 'booking.package.inclusions',
            'booking.selectedAddons',
        ]);

        $booking = $bookingDocument->booking;
        $service = $booking->service->name;
        $reference = $booking->booking_reference;
        $message = $data['status'] === 'confirmed'
            ? "St. Lorenzo Ruiz Parish: Your GCash payment for {$service} (Ref: {$reference}) has been confirmed. Your booking is now marked as paid. Thank you."
            : "St. Lorenzo Ruiz Parish: We could not verify the GCash payment for {$service} (Ref: {$reference}). Please review the reference number and receipt, then submit your payment details again through My Profile.";
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
