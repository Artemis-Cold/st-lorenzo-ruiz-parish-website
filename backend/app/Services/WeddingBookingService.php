<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingSlot;
use App\Models\PackageAddon;
use App\Models\ServicePackage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WeddingBookingService
{
    public function __construct(
        private BookingSlotAvailabilityService $availability,
        private BookingRequirementService $requirements
    ) {}

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $slot = $this->validateSlot($data['booking_slot_id']);
            $package = $this->validatePackage(
                $data['service_package_id'],
                $slot
            );
            $addonIds = $this->validateAddons(
                $data['selected_addon_ids'] ?? [],
                $package
            );

            $booking = Booking::create([
                'booking_reference' => $this->generateReference(),
                'user_id' => auth()->id(),
                'service_id' => $slot->service_id,
                'service_package_id' => $package->id,
                'booking_slot_id' => $slot->id,
                'remarks' => $data['remarks'] ?? null,
            ]);

            foreach (['groom', 'bride'] as $role) {
                $this->createApplicant(
                    $booking,
                    $role,
                    $data['applicant'][$role]
                );
            }

            $booking->selectedAddons()->sync($addonIds);
            $this->uploadDocuments($booking, $data['documents'] ?? []);

            $booking->load([
                'weddingApplicants',
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
        return $this->availability->lockBookable($slotId, 'wedding');
    }

    private function validatePackage(
        int $packageId,
        BookingSlot $slot
    ): ServicePackage {
        $package = ServicePackage::findOrFail($packageId);

        if (! $package->is_active || $package->service_id !== $slot->service_id) {
            throw ValidationException::withMessages([
                'service_package_id' => 'The selected package is unavailable for this service.',
            ]);
        }

        return $package;
    }

    private function validateAddons(
        array $addonIds,
        ServicePackage $package
    ): array {
        $validIds = PackageAddon::query()
            ->where('service_package_id', $package->id)
            ->whereIn('id', $addonIds)
            ->pluck('id')
            ->all();

        if (count($validIds) !== count($addonIds)) {
            throw ValidationException::withMessages([
                'selected_addon_ids' => 'One or more selected add-ons do not belong to this package.',
            ]);
        }

        return $validIds;
    }

    private function createApplicant(
        Booking $booking,
        string $role,
        array $person
    ): void {
        $booking->weddingApplicants()->create([
            'role' => $role,
            'first_name' => $person['first_name'],
            'middle_initial' => $person['middle_initial'] ?? null,
            'last_name' => $person['last_name'],
            'address' => $person['address'],
            'age' => $person['age'],
            'contact_number' => $person['contact_number'],
            'baptized_in' => $person['church']['baptized_in'],
            'confirmed_in' => $person['church']['confirmed_in'],
            'father_first_name' => $person['father']['first_name'],
            'father_middle_initial' => $person['father']['middle_initial'] ?? null,
            'father_last_name' => $person['father']['last_name'],
            'mother_first_name' => $person['mother']['first_name'],
            'mother_middle_initial' => $person['mother']['middle_initial'] ?? null,
            'mother_last_name' => $person['mother']['last_name'],
            'church_name' => $person['previous_church_marriage']['church_name'],
            'priest' => $person['previous_church_marriage']['priest'],
            'church_address' => $person['previous_church_marriage']['church_address'],
        ]);
    }

    private function uploadDocuments(Booking $booking, array $documents): void
    {
        foreach ($documents as $document) {
            /** @var UploadedFile $file */
            $file = $document['file'];
            $path = $file->store('booking-documents', 'public');

            $booking->documents()->create([
                'document_type' => $document['document_type'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'status' => 'pending',
            ]);
        }
    }

    private function generateReference(): string
    {
        do {
            $reference = 'WED-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }
}
