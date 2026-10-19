<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Service;
use App\Models\ServicePackage;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FormationSacramentBookingService
{
    public function __construct(
        private BookingSlotAvailabilityService $availability,
        private BookingRequirementService $requirements,
        private BookingPricingService $pricing,
    ) {}

    public function store(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $serviceCode = $data['service_code'];
            $service = Service::where('code', $serviceCode)->firstOrFail();
            $booking = $serviceCode === 'first-communion'
                ? Booking::create([
                    'booking_reference' => $this->reference($serviceCode),
                    'user_id' => auth()->id(), 'service_id' => $service->id,
                    'status' => 'pending', 'schedule_status' => 'awaiting_review',
                    'schedule_requested_at' => now(), 'total_amount' => 0,
                ])
                : app(BookingScheduleReviewService::class)->lockForSubmission($data, $serviceCode);
            $slot = $booking->slot;
            $package = $serviceCode === 'confirmation'
                ? ServicePackage::query()->with('inclusions')->findOrFail($data['service_package_id'])
                : null;

            if ($package && (! $package->is_active || $package->service_id !== $service->id)) {
                throw ValidationException::withMessages([
                    'service_package_id' => 'The selected package is unavailable for this service.',
                ]);
            }

            $price = $package ? $this->pricing->calculate($package, collect()) : [
                'total' => 0,
                'snapshot' => ['package' => null, 'inclusions' => [], 'addons' => [], 'fees' => []],
            ];
            $booking->update([
                'details_submitted_at' => now(),
                'user_id' => auth()->id(),
                'service_id' => $service->id,
                'service_package_id' => $package?->id,
                'booking_slot_id' => $slot?->id,
                'total_amount' => $price['total'],
                'pricing_snapshot' => $price['snapshot'],
                'status' => 'pending',
                'remarks' => $data['remarks'] ?? null,
            ]);

            $candidate = $data['candidate'];
            $candidate['age'] = CarbonImmutable::parse($candidate['birth_date'])->age;
            $baptizand = $booking->baptizand()->create($candidate);

            foreach ($data['parents'] as $parent) {
                $baptizand->parents()->create($parent);
            }

            foreach ($data['sponsors'] ?? [] as $index => $sponsor) {
                /** @var UploadedFile|null $requirement */
                $requirement = $sponsor['requirement_file'] ?? null;
                $godParent = $baptizand->godParents()->create([
                    'sort_order' => $index + 1,
                    'role' => $sponsor['role'],
                    'first_name' => $sponsor['first_name'],
                    'middle_initial' => $sponsor['middle_initial'] ?? null,
                    'last_name' => $sponsor['last_name'],
                    'suffix' => $sponsor['suffix'] ?? null,
                    'residence' => $sponsor['address'],
                    'requirement_type' => $sponsor['requirement_type'] ?? null,
                ]);

                if ($requirement) {
                    $booking->documents()->create([
                        'document_type' => "confirmation_sponsor_individual_{$sponsor['requirement_type']}_{$godParent->id}",
                        'file_name' => $requirement->getClientOriginalName(),
                        'file_path' => $requirement->store('booking-documents', 'public'),
                        'status' => 'pending',
                    ]);
                }
            }

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
                'baptizand.parents', 'baptizand.godParents', 'documents',
                'package', 'service', 'user',
            ]);
            $this->requirements->notifySubmitted($booking);
            if ($serviceCode === 'first-communion') {
                app(SmsNotificationService::class)->queue($booking, 'booking_pending',
                    "St. Lorenzo Ruiz Parish: Your First Communion registration (Ref: {$booking->booking_reference}) is pending. The parish will assign the ceremony date and notify you by SMS when you may upload requirements through My Profile.");
            }

            return $booking;
        });
    }

    private function reference(string $serviceCode): string
    {
        $prefix = $serviceCode === 'confirmation' ? 'CNF' : 'COM';
        do {
            $reference = $prefix.'-'.strtoupper(Str::random(8));
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }
}
