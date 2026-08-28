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
    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $service = Service::firstWhere('code', 'document-request');

            if (! $service || ! $service->is_active) {
                throw ValidationException::withMessages([
                    'requests' => 'Document Request service is unavailable.',
                ]);
            }

            $prices = $service->fees()
                ->where('is_active', true)
                ->get()
                ->keyBy('name');

            $missingPrice = collect($data['requests'])
                ->pluck('document_type')
                ->first(fn (string $type) => ! $prices->has($type));

            if ($missingPrice) {
                throw ValidationException::withMessages([
                    'requests' => "The current price for {$missingPrice} is unavailable.",
                ]);
            }

            $total = collect($data['requests'])
                ->sum(fn (array $request) => (float) $prices[$request['document_type']]->amount);

            $booking = Booking::create([
                'booking_reference' => $this->reference(),
                'user_id' => auth()->id(),
                'service_id' => $service->id,
                'service_package_id' => null,
                'booking_slot_id' => null,
                'payment_reference' => $data['reference_number'],
                'status' => 'pending',
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
                    'price' => $prices[$request['document_type']]->amount,
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
