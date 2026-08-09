<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DocumentRequestBookingService
{
    private const PRICES = [
        'Baptismal Certificate' => 100,
        'Confirmation Certificate' => 100,
        'Death Certificate' => 100,
        'Marriage Certificate' => 100,
        'Request of Permission' => 100,
    ];

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $service = Service::firstWhere('code', 'document-request');

            if (! $service || ! $service->is_active) {
                throw ValidationException::withMessages([
                    'requests' => 'Document Request service is unavailable.',
                ]);
            }

            $total = collect($data['requests'])
                ->sum(fn (array $request) => self::PRICES[$request['document_type']]);

            $booking = Booking::create([
                'booking_reference' => $this->reference(),
                'user_id' => auth()->id(),
                'service_id' => $service->id,
                'service_package_id' => null,
                'booking_slot_id' => null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            $documentRequest = $booking->documentRequest()->create([
                'payment_reference' => $data['reference_number'],
                'total_amount' => $total,
            ]);

            foreach ($data['requests'] as $request) {
                $documentRequest->items()->create([
                    'document_type' => $request['document_type'],
                    'details' => $request['details'],
                    'price' => self::PRICES[$request['document_type']],
                ]);
            }

            /** @var UploadedFile $receipt */
            $receipt = $data['receipt'];
            $booking->documents()->create([
                'document_type' => 'payment_receipt',
                'file_name' => $receipt->getClientOriginalName(),
                'file_path' => $receipt->store('booking-documents', 'public'),
                'status' => 'pending',
            ]);

            return $booking->load([
                'documentRequest.items',
                'documents',
            ]);
        });
    }

    private function reference(): string
    {
        do {
            $reference = 'DOC-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }
}
