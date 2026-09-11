<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DocumentRequestBookingService
{
    public function __construct(private readonly PaymentService $payments) {}

    public function store(array $data, User $requester): Booking
    {
        return DB::transaction(function () use ($data, $requester) {
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
                'user_id' => $requester->id,
                'service_id' => $service->id,
                'service_package_id' => null,
                'booking_slot_id' => null,
                'payment_reference' => $data['payment_method'] === 'gcash'
                    ? $data['reference_number']
                    : null,
                'status' => 'pending',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $documentRequest = $booking->documentRequest()->create([
                'payment_reference' => $data['payment_method'] === 'gcash'
                    ? $data['reference_number']
                    : null,
                'total_amount' => $total,
            ]);

            foreach (collect($data['requests'])->groupBy('document_type') as $type => $copies) {
                $details = $this->normalizeRecordDetails(
                    $type,
                    $copies->first()['details'],
                    $requester,
                );

                foreach ($copies as $copy) {
                    $documentRequest->items()->create([
                        'document_type' => $type,
                        'details' => $details,
                        'price' => $prices[$type]->amount,
                    ]);
                }
            }

            $this->payments->createAttempt(
                $booking,
                $data['payment_method'],
                $data['reference_number'] ?? null,
                $data['receipt'] ?? null,
            );

            return $booking->load([
                'documentRequest.items',
                'documents',
                'payments.receiptDocument',
            ]);
        });
    }

    /** @param array<string, mixed> $details */
    private function normalizeRecordDetails(
        string $documentType,
        array $details,
        User $requester,
    ): array {
        $requesterAddress = collect([
            $requester->house_no,
            $requester->street,
            $requester->barangay,
            $requester->municipality,
            $requester->province,
            $requester->zip_code,
        ])->filter()->join(', ');

        if ($documentType === 'Request of Permission') {
            $details['full_name'] = $requester->full_name;
            $details['address'] = $requesterAddress;
        }

        if ($documentType === 'Marriage Certificate') {
            $details['address'] = $requesterAddress;

            if (($details['requester_role'] ?? null) === 'Bride') {
                $details['bride_name'] = $requester->full_name;
            }

            if (($details['requester_role'] ?? null) === 'Groom') {
                $details['groom_name'] = $requester->full_name;
            }
        }

        return $details;
    }

    private function reference(): string
    {
        do {
            $reference = 'DOC-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }
}
