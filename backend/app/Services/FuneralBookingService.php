<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\PackageAddon;
use App\Models\ServicePackage;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FuneralBookingService
{
    public function __construct(
        private BookingSlotAvailabilityService $availability,
        private BookingRequirementService $requirements,
        private BookingPricingService $pricing,
    ) {}

    public function store(array $data, User $user): Booking
    {
        return DB::transaction(function () use ($data, $user) {
            $slot = $this->availability->lockBookable(
                $data['booking_slot_id'],
                'funeral',
            );

            $package = ServicePackage::findOrFail($data['service_package_id']);
            if (! $package->is_active || $package->service_id !== $slot->service_id) {
                throw ValidationException::withMessages([
                    'service_package_id' => 'The selected package is unavailable for this service.',
                ]);
            }

            $addonIds = $data['selected_addon_ids'] ?? [];
            $addons = PackageAddon::query()
                ->where('service_package_id', $package->id)
                ->whereIn('id', $addonIds)
                ->get();
            if (count($addonIds) !== $addons->count()) {
                throw ValidationException::withMessages([
                    'selected_addon_ids' => 'One or more add-ons do not belong to this package.',
                ]);
            }

            $price = $this->pricing->calculate($package, $addons);

            $booking = Booking::create([
                'booking_reference' => $this->reference(),
                'user_id' => $user->id,
                'service_id' => $slot->service_id,
                'service_package_id' => $package->id,
                'booking_slot_id' => $slot->id,
                'total_amount' => $price['total'],
                'pricing_snapshot' => $price['snapshot'],
                'status' => 'pending',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $person = $data['deceased'];
            $deceased = $booking->funeralDeceased()->create([
                'first_name' => $person['first_name'],
                'middle_initial' => $person['middle_initial'] ?? null,
                'last_name' => $person['last_name'],
                'address' => $person['address'],
                'death_cause' => $person['death_cause'],
                'age' => CarbonImmutable::parse($person['birth_date'])->age,
                'birth_date' => $person['birth_date'],
                ...$this->relativeColumns($person),
                ...$person['sacraments'],
                'attends_mass' => $person['church_life']['attends_mass'],
                'confesses' => $person['church_life']['confesses'],
                'characteristics' => $person['characteristics'] ?? null,
                'informant_first_name' => $user->first_name,
                'informant_middle_initial' => $user->middle_initial,
                'informant_last_name' => $user->last_name,
                'informant_relationship' => $person['informant']['relationship'],
                'informant_contact_number' => $user->phone,
                'information_date' => today()->toDateString(),
            ]);

            foreach ($person['children'] ?? [] as $child) {
                $deceased->children()->create($child);
            }

            $booking->selectedAddons()->sync($addons->modelKeys());
            foreach ($data['documents'] ?? [] as $document) {
                /** @var UploadedFile $file */
                $file = $document['file'];
                $booking->documents()->create([
                    'document_type' => $document['document_type'],
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $file->store('booking-documents', 'public'),
                    'status' => 'pending',
                ]);
            }

            $booking->load([
                'funeralDeceased.children',
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

    private function relativeColumns(array $person): array
    {
        $columns = [];
        foreach (['father', 'mother'] as $relative) {
            foreach (['first_name', 'middle_initial', 'last_name'] as $field) {
                $columns[$relative.'_'.$field] = $person[$relative][$field] ?? null;
            }
        }

        foreach (['first_name', 'middle_initial', 'last_name'] as $field) {
            $columns['spouse_'.$field] = ($person['has_spouse'] ?? false)
                ? ($person['spouse'][$field] ?? null)
                : null;
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
