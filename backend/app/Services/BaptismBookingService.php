<?php

namespace App\Services;

use App\Models\Baptizand;
use App\Models\Booking;
use App\Models\BookingSlot;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BaptismBookingService
{
    public function __construct(
        private BookingSlotAvailabilityService $availability,
        private BookingRequirementService $requirements
    ) {}

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {

            $slot = $this->validateSlot($data['booking_slot_id']);

            $booking = $this->createBooking($slot, $data);

            $baptizand = $this->createBaptizand($booking, $data['baptizand']);

            $this->createParents($baptizand, $data['parents']);

            $this->createGodParentPairs($baptizand, $data['god_parents']);

            $this->uploadDocuments($booking, $data['documents'] ?? []);

            $booking->load([
                'baptizand.parents',
                'baptizand.godParentPairs.godParents',
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
        $slot = BookingSlot::query()->lockForUpdate()->findOrFail($slotId);

        $this->availability->ensureBookable($slot);

        return $slot;
    }

    private function createBooking(
        BookingSlot $slot,
        array $data
    ): Booking {
        return Booking::create([
            'booking_reference' => $this->generateReference(),

            'user_id' => auth()->id(),

            'service_id' => $slot->service_id,

            'service_package_id' => $data['service_package_id'],

            'booking_slot_id' => $slot->id,

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

    private function createGodParentPairs(
        Baptizand $baptizand,
        array $pairs
    ): void {

        foreach ($pairs as $pair) {

            $marriageContractPath = isset($pair['requirements']['marriage_contract'])
                ? $pair['requirements']['marriage_contract']->store('godparent-documents', 'public')
                : null;

            $confirmationCertPath = isset($pair['requirements']['confirmation_certificate'])
                ? $pair['requirements']['confirmation_certificate']->store('godparent-documents', 'public')
                : null;

            $godParentPair = $baptizand->godParentPairs()->create([
                'marriage_contract' => $marriageContractPath,
                'confirmation_certificate' => $confirmationCertPath,
            ]);

            $godParentPair->godParents()->create([
                'baptizand_id' => $baptizand->id,
                'role' => 'godfather',
                'first_name' => $pair['god_father']['first_name'],
                'middle_initial' => $pair['god_father']['middle_initial'] ?? null,
                'last_name' => $pair['god_father']['last_name'],
                'suffix' => $pair['god_father']['suffix'] ?? null,
                'residence' => $pair['god_father']['residence'],
            ]);

            $godParentPair->godParents()->create([
                'baptizand_id' => $baptizand->id,
                'role' => 'godmother',
                'first_name' => $pair['god_mother']['first_name'],
                'middle_initial' => $pair['god_mother']['middle_initial'] ?? null,
                'last_name' => $pair['god_mother']['last_name'],
                'suffix' => $pair['god_mother']['suffix'] ?? null,
                'residence' => $pair['god_mother']['residence'],
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
