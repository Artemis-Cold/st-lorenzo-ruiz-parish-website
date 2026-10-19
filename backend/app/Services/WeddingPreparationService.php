<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ServicePackage;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WeddingPreparationService
{
    public function create(Booking $wedding, string $role, string $code, array $data): Booking
    {
        if (! empty($data['documents']) || collect($data['sponsors'] ?? [])->contains(fn ($sponsor) => ! empty($sponsor['requirement_file']))) {
            throw ValidationException::withMessages(["applicant.$role.preparations.$code.documents" => 'Wait for confirmation of this ceremony schedule before uploading its requirements.']);
        }
        $package = ServicePackage::with(['service', 'inclusions'])->where('is_active', true)
            ->whereHas('service', fn ($q) => $q->where('code', $code)->where('is_active', true))
            ->orderByDesc('recommended')->orderBy('id')->first();
        if (! $package) {
            throw ValidationException::withMessages(["applicant.$role.preparations.$code" => 'This sacrament package is unavailable. Please contact the parish office.']);
        }
        $pricing = app(BookingPricingService::class);
        $fees = [];
        if ($code === 'baptism' && count($data['sponsors']) > 2) {
            $fees[] = ['fee' => $pricing->fee('baptism', 'additional_sponsor'), 'quantity' => count($data['sponsors']) - 2];
        }
        $price = $pricing->calculate($package, collect(), $fees);
        $booking = Booking::create([
            'booking_reference' => ($code === 'baptism' ? 'BAP-' : 'CNF-').strtoupper(Str::random(12)),
            'user_id' => $wedding->user_id, 'service_id' => $package->service_id,
            'service_package_id' => $package->id, 'status' => 'pending',
            'total_amount' => $price['total'], 'pricing_snapshot' => $price['snapshot'],
            'wedding_booking_id' => $wedding->id, 'wedding_applicant_role' => $role,
            'schedule_status' => 'awaiting_review', 'schedule_requested_at' => now(), 'details_submitted_at' => now(),
            'remarks' => 'Wedding preparation. Schedule to be assigned by parish staff according to priest availability.',
        ]);
        $candidate = $data['candidate'];
        $candidate['age'] = CarbonImmutable::parse($candidate['birth_date'])->age;
        $person = $booking->baptizand()->create($candidate);
        foreach ($data['parents'] as $parent) {
            $person->parents()->create($parent);
        }
        foreach ($data['sponsors'] as $index => $sponsor) {
            $file = $sponsor['requirement_file'] ?? null;
            $record = $person->godParents()->create([
                ...collect($sponsor)->except('requirement_file')->all(), 'sort_order' => $index + 1,
            ]);
            if ($file) {
                $this->document($booking, "{$code}_".($code === 'baptism' ? 'godparent' : 'sponsor')."_individual_{$sponsor['requirement_type']}_{$record->id}", $file);
            }
        }
        foreach ($data['documents'] ?? [] as $document) {
            $this->document($booking, $document['document_type'], $document['file']);
        }
        app(SmsNotificationService::class)->queue($booking->load('user'), 'wedding_preparation_pending',
            "St. Lorenzo Ruiz Parish: The {$role}'s {$package->service->name} request (Ref: {$booking->booking_reference}), linked to wedding {$wedding->booking_reference}, is pending. It has a separate fee of PHP {$booking->total_amount}. Wait for staff to confirm its ceremony schedule by SMS before submitting requirements through My Profile.");

        return $booking;
    }

    private function document(Booking $booking, string $type, $file): void
    {
        $booking->documents()->create(['document_type' => $type, 'file_name' => $file->getClientOriginalName(), 'file_path' => $file->store('booking-documents', 'public'), 'status' => 'pending']);
    }
}
