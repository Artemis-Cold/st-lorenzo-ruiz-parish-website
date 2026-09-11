<?php

namespace App\Services;

use App\Models\Baptizand;
use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\ServicePackage;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BaptismBookingService
{
    public function __construct(
        private BookingSlotAvailabilityService $availability,
        private BookingRequirementService $requirements,
        private BookingPricingService $pricing,
    ) {}

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {

            $slot = $this->validateSlot($data['booking_slot_id']);

            $package = ServicePackage::query()
                ->with('inclusions')
                ->findOrFail($data['service_package_id']);

            if (! $package->is_active || $package->service_id !== $slot->service_id) {
                throw ValidationException::withMessages([
                    'service_package_id' => 'The selected package is unavailable for this service.',
                ]);
            }

            $additionalSponsorCount = max(count($data['god_parents']) - 2, 0);
            $fees = [];

            if ($additionalSponsorCount > 0) {
                $fees[] = [
                    'fee' => $this->pricing->fee('baptism', 'additional_sponsor'),
                    'quantity' => $additionalSponsorCount,
                ];
            }

            $price = $this->pricing->calculate($package, collect(), $fees);

            $booking = $this->createBooking($slot, $data, $package, $price);

            $baptizand = $this->createBaptizand($booking, $data['baptizand']);

            $this->createParents($baptizand, $data['parents']);

            $this->createGodParents($baptizand, $data['god_parents']);

            $this->uploadDocuments($booking, $data['documents'] ?? []);

            $booking->load([
                'baptizand.parents',
                'baptizand.godParents',
                'documents',
                'package',
                'selectedAddons',
                'service',
                'user',
            ]);

            $this->requirements->notifyIfIncomplete($booking);

            return $booking;
        });
    }

    private function validateSlot(int $slotId): BookingSlot
    {
        return $this->availability->lockBookable($slotId, 'baptism');
    }

    private function createBooking(
        BookingSlot $slot,
        array $data,
        ServicePackage $package,
        array $price,
    ): Booking {
        return Booking::create([
            'booking_reference' => $this->generateReference(),

            'user_id' => auth()->id(),

            'service_id' => $slot->service_id,

            'service_package_id' => $package->id,

            'booking_slot_id' => $slot->id,

            'total_amount' => $price['total'],

            'pricing_snapshot' => $price['snapshot'],

            'status' => 'pending',

            'remarks' => $data['remarks'] ?? null,
        ]);
    }

    private function generateReference(): string
    {
        do {
            $reference = 'BPT-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }

    private function createBaptizand(
        Booking $booking,
        array $data
    ): Baptizand {
        $data['age'] = CarbonImmutable::parse($data['birth_date'])->age;

        return $booking->baptizand()->create($data);

    }

    private function createParents(
        Baptizand $baptizand,
        array $parents
    ): void {

        foreach ($parents as $parent) {

            $baptizand->parents()->create($parent);

        }
    }

    private function createGodParents(
        Baptizand $baptizand,
        array $godParents
    ): void {
        foreach ($godParents as $index => $godParent) {
            /** @var UploadedFile|null $requirement */
            $requirement = $godParent['requirement_file'] ?? null;
            $baptizand->godParents()->create([
                'sort_order' => $index + 1,
                'role' => $godParent['role'],
                'first_name' => $godParent['first_name'],
                'middle_initial' => $godParent['middle_initial'] ?? null,
                'last_name' => $godParent['last_name'],
                'suffix' => $godParent['suffix'] ?? null,
                'residence' => $godParent['residence'],
                'requirement_type' => $godParent['requirement_type'],
                'requirement_file_name' => $requirement?->getClientOriginalName(),
                'requirement_file_path' => $requirement?->store(
                    'godparent-documents',
                    'public',
                ),
            ]);
        }
    }

    private function uploadDocuments(
        Booking $booking,
        array $documents
    ): void {

        foreach ($documents as $document) {

            /** @var UploadedFile $file */
            $file = $document['file'];

            $path = $file->store(
                'booking-documents',
                'public'
            );

            $booking->documents()->create([

                'document_type' => $document['document_type'],

                'file_name' => $file->getClientOriginalName(),

                'file_path' => $path,

                'status' => 'pending',

            ]);
        }
    }
}
