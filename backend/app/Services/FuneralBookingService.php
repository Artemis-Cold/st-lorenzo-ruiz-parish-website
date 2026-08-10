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

class FuneralBookingService
{
    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $slot = BookingSlot::query()->lockForUpdate()
                ->findOrFail($data['booking_slot_id']);
            if (! $slot->is_active || $slot->bookings()->count() >= $slot->capacity) {
                throw ValidationException::withMessages([
                    'booking_slot_id' => 'Selected booking slot is unavailable.',
                ]);
            }

            $package = ServicePackage::findOrFail($data['service_package_id']);
            if (! $package->is_active || $package->service_id !== $slot->service_id) {
                throw ValidationException::withMessages([
                    'service_package_id' => 'The selected package is unavailable for this service.',
                ]);
            }

            $addonIds = $data['selected_addon_ids'] ?? [];
            $validAddonIds = PackageAddon::query()
                ->where('service_package_id', $package->id)
                ->whereIn('id', $addonIds)
                ->pluck('id')
                ->all();
            if (count($addonIds) !== count($validAddonIds)) {
                throw ValidationException::withMessages([
                    'selected_addon_ids' => 'One or more add-ons do not belong to this package.',
                ]);
            }

            $booking = Booking::create([
                'booking_reference' => $this->reference(),
                'user_id' => auth()->id(),
                'service_id' => $slot->service_id,
                'service_package_id' => $package->id,
                'booking_slot_id' => $slot->id,
                'remarks' => $data['remarks'] ?? null,
            ]);

            $person = $data['deceased'];
            $deceased = $booking->funeralDeceased()->create([
                'first_name' => $person['first_name'],
                'middle_initial' => $person['middle_initial'] ?? null,
                'last_name' => $person['last_name'],
                'address' => $person['address'],
                'death_cause' => $person['death_cause'],
                'age' => $person['age'],
                'birth_date' => $person['birth_date'],
                ...$this->relativeColumns($person),
                ...$person['sacraments'],
                'attends_mass' => $person['church_life']['attends_mass'],
                'confesses' => $person['church_life']['confesses'],
                'characteristics' => $person['characteristics'] ?? null,
                'informant_first_name' => $person['informant']['first_name'],
                'informant_middle_initial' => $person['informant']['middle_initial'] ?? null,
                'informant_last_name' => $person['informant']['last_name'],
                'informant_relationship' => $person['informant']['relationship'],
                'informant_contact_number' => $person['informant']['contact_number'],
                'information_date' => $person['informant']['date_provided'],
            ]);

            foreach ($person['children'] ?? [] as $child) {
                $deceased->children()->create($child);
            }

            $booking->selectedAddons()->sync($validAddonIds);
            foreach ($data['documents'] as $document) {
                /** @var UploadedFile $file */
                $file = $document['file'];
                $booking->documents()->create([
                    'document_type' => $document['document_type'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $file->store('booking-documents', 'public'),
                    'status' => 'pending',
                ]);
            }

            return $booking->load([
                'funeralDeceased.children',
                'documents',
                'package',
                'selectedAddons',
            ]);
        });
    }

    private function relativeColumns(array $person): array
    {
        $columns = [];
        foreach (['father', 'mother', 'spouse'] as $relative) {
            foreach (['first_name', 'middle_initial', 'last_name'] as $field) {
                $columns[$relative.'_'.$field] = $person[$relative][$field] ?? null;
            }
        }

        return $columns;
    }

    private function reference(): string
    {
        do {
            $reference = 'FUN-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }
}
