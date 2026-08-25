<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\RescheduleBookingRequest;
use App\Models\Booking;
use App\Services\BookingRequirementService;
use App\Services\BookingReschedulingService;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ParishionerBookingController extends Controller
{
    private const RESCHEDULABLE_SERVICES = ['baptism', 'wedding', 'funeral'];

    private const PAYMENT_SERVICES = [
        'baptism', 'wedding', 'funeral', 'mass-intention', 'document-request',
    ];

    public function show(
        Request $request,
        Booking $booking,
        BookingRequirementService $requirements
    ): JsonResponse {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load([
            'service', 'package.inclusions', 'selectedAddons', 'slot', 'documents',
            'weddingApplicants', 'weddingSponsorPairs.sponsors', 'appointments',
            'baptizand.parents', 'baptizand.godParentPairs.godParents',
            'funeralDeceased.children', 'massIntention.entries',
            'documentRequest.items',
        ]);

        return response()->json(['data' => [
            'id' => $booking->id,
            'reference' => $booking->booking_reference,
            'service' => $booking->service?->name,
            'serviceCode' => $booking->service?->code,
            'status' => $booking->status,
            'bookingSlotId' => $booking->booking_slot_id,
            'canReschedule' => in_array($booking->service?->code, self::RESCHEDULABLE_SERVICES, true)
                && in_array($booking->status, ['pending', 'paid', 'approved'], true),
            'canUploadDocuments' => in_array($booking->service?->code, self::RESCHEDULABLE_SERVICES, true)
                && in_array($booking->status, ['pending', 'paid'], true),
            'missingRequirements' => $requirements->missing($booking),
            'submittedAt' => $booking->created_at->toIso8601String(),
            'remarks' => $booking->remarks,
            'schedule' => [
                'date' => $booking->slot?->booking_date?->toDateString()
                    ?? $booking->massIntention?->intention_date?->toDateString(),
                'startTime' => $booking->slot?->start_time,
                'endTime' => $booking->slot?->end_time,
            ],
            'package' => $booking->package ? [
                'name' => $booking->package->name,
                'baseAmount' => (float) $booking->package->base_price,
                'inclusions' => $booking->package->inclusions->pluck('name')->values(),
                'addons' => $booking->selectedAddons->map(fn ($addon) => [
                    'name' => $addon->name,
                    'price' => (float) $addon->price,
                ])->values(),
                'totalAmount' => $booking->total_amount,
            ] : null,
            'payment' => $this->paymentData($booking),
            'sections' => $this->sections($booking),
            'documents' => $this->documents($booking),
        ]]);
    }

    public function uploadDocument(
        Request $request,
        Booking $booking,
        BookingRequirementService $requirements,
        SmsNotificationService $sms
    ): JsonResponse {
        abort_unless($booking->user_id === $request->user()->id, 404);
        $serviceCode = $booking->service()->value('code');
        abort_unless(in_array($serviceCode, self::PAYMENT_SERVICES, true), 404);

        $booking->loadMissing(['massIntention', 'documentRequest']);

        if (! in_array($booking->status, ['pending', 'paid'], true)) {
            throw ValidationException::withMessages([
                'file' => 'Documents can only be added while the booking is pending staff approval.',
            ]);
        }

        $documentType = (string) $request->input('document_type');
        $fileTypes = str_starts_with($documentType, 'couple_photo')
            ? 'jpg,jpeg,png'
            : 'jpg,jpeg,png,pdf';

        $data = $request->validate([
            'document_type' => ['required', 'string', Rule::in($requirements->allowedTypes($booking))],
            'file' => ['required', 'file', 'mimes:'.$fileTypes, 'max:5120'],
        ]);

        if ($booking->documents()->where('document_type', $data['document_type'])->exists()) {
            throw ValidationException::withMessages([
                'file' => 'This requirement has already been uploaded.',
            ]);
        }

        $file = $data['file'];
        $document = $booking->documents()->create([
            'document_type' => $data['document_type'],
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $file->store('booking-documents', 'public'),
            'status' => 'pending',
        ]);
        $booking->load(['service', 'documents', 'baptizand', 'user']);
        $missing = $requirements->missing($booking);

        if ($missing === []) {
            $serviceName = $booking->service?->name ?? 'service';
            $sms->queue(
                $booking,
                'booking_requirements_complete',
                "St. Lorenzo Ruiz Parish: We have received all requirements for your {$serviceName} booking (Ref: {$booking->booking_reference}). Your documents are now awaiting parish staff review. Thank you."
            );
        }

        return response()->json([
            'message' => 'Requirement submitted successfully.',
            'data' => [
                'document' => [
                    'type' => $document->document_type,
                    'fileName' => $document->file_name,
                    'status' => $document->status,
                    'url' => Storage::disk('public')->url($document->file_path),
                ],
                'missingRequirements' => $missing,
            ],
        ], 201);
    }

    public function submitPayment(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);
        abort_unless(in_array($booking->service()->value('code'), self::RESCHEDULABLE_SERVICES, true), 404);

        if (! in_array($booking->status, ['pending', 'paid'], true)) {
            throw ValidationException::withMessages([
                'receipt' => 'Payment can no longer be submitted for this booking.',
            ]);
        }

        $existingReceipt = $booking->documents()
            ->where('document_type', 'payment_receipt')
            ->first();

        if ($existingReceipt?->status === 'approved' || $booking->status === 'paid') {
            throw ValidationException::withMessages([
                'receipt' => 'Payment for this booking has already been confirmed.',
            ]);
        }

        if ($existingReceipt?->status === 'pending') {
            throw ValidationException::withMessages([
                'receipt' => 'Your submitted payment is already awaiting parish staff verification.',
            ]);
        }

        $data = $request->validate([
            'reference_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('bookings', 'payment_reference')->ignore($booking->id),
                Rule::unique('mass_intentions', 'payment_reference')->ignore($booking->massIntention?->id),
                Rule::unique('document_request_bookings', 'payment_reference')->ignore($booking->documentRequest?->id),
            ],
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $file = $data['receipt'];
        $newPath = $file->store('booking-documents', 'public');
        $oldPath = $existingReceipt?->file_path;

        DB::transaction(function () use ($booking, $data, $file, $newPath, $existingReceipt) {
            $booking->update(['payment_reference' => $data['reference_number']]);
            $booking->massIntention?->update(['payment_reference' => $data['reference_number']]);
            $booking->documentRequest?->update(['payment_reference' => $data['reference_number']]);

            if ($existingReceipt) {
                $existingReceipt->update([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $newPath,
                    'status' => 'pending',
                    'remarks' => null,
                ]);

                return;
            }

            $booking->documents()->create([
                'document_type' => 'payment_receipt',
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $newPath,
                'status' => 'pending',
            ]);
        });

        if ($oldPath && $oldPath !== $newPath) {
            Storage::disk('public')->delete($oldPath);
        }

        $booking->load(['service', 'package.inclusions', 'selectedAddons', 'documents']);

        return response()->json([
            'message' => 'Payment submitted and is awaiting parish staff verification.',
            'data' => $this->paymentData($booking),
        ], 201);
    }

    public function reschedule(
        RescheduleBookingRequest $request,
        Booking $booking,
        BookingReschedulingService $service
    ): JsonResponse {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $updated = $service->reschedule(
            $booking,
            (int) $request->validated('booking_slot_id'),
            $request->user()->id,
        );

        return response()->json([
            'message' => 'Booking rescheduled successfully and submitted for staff review.',
            'data' => [
                'id' => $updated->id,
                'status' => $updated->status,
                'bookingSlotId' => $updated->booking_slot_id,
                'schedule' => [
                    'date' => $updated->slot?->booking_date?->toDateString(),
                    'startTime' => $updated->slot?->start_time,
                    'endTime' => $updated->slot?->end_time,
                ],
            ],
        ]);
    }

    private function sections(Booking $booking): array
    {
        return match ($booking->service?->code) {
            'wedding' => $this->weddingSections($booking),
            'funeral' => $this->funeralSections($booking),
            'baptism' => $this->baptismSections($booking),
            'mass-intention' => $this->massIntentionSections($booking),
            'document-request' => $this->documentRequestSections($booking),
            default => [],
        };
    }

    private function documents(Booking $booking): Collection
    {
        $sponsorPairs = $booking->weddingSponsorPairs->sortBy('id')->values();
        $pairNumbers = $sponsorPairs->mapWithKeys(
            fn ($pair, int $index) => [(string) $pair->id => $index + 1]
        );

        $documents = $booking->documents->map(function ($document) use ($pairNumbers) {
            $type = $document->document_type;

            if (preg_match('/^wedding_sponsor_(marriage_contract|confirmation_certificate)_(\d+)$/', $type, $matches)) {
                $pairNumber = $pairNumbers->get($matches[2]);

                if ($pairNumber !== null) {
                    $type = "sponsor_pair_{$pairNumber}_{$matches[1]}";
                }
            }

            return [
                'type' => $type,
                'fileName' => $document->file_name,
                'status' => $document->status,
                'url' => Storage::disk('public')->url($document->file_path),
            ];
        });

        $sponsorDocuments = $sponsorPairs->flatMap(function ($pair, int $index) {
            $pairNumber = $index + 1;

            return collect([
                'marriage_contract' => $pair->marriage_contract,
                'confirmation_certificate' => $pair->confirmation_certificate,
            ])->filter()->map(function (string $path, string $type) use ($pairNumber) {
                $label = 'Sponsor Pair '.$pairNumber.' '.str($type)->headline();
                $extension = pathinfo($path, PATHINFO_EXTENSION);

                return [
                    'type' => "sponsor_pair_{$pairNumber}_{$type}",
                    'fileName' => $label.($extension ? ".{$extension}" : ''),
                    'status' => 'submitted',
                    'url' => Storage::disk('public')->url($path),
                ];
            })->values();
        });

        return $documents->concat($sponsorDocuments)->values();
    }

    private function paymentData(Booking $booking): array
    {
        $receipt = $booking->documents->firstWhere('document_type', 'payment_receipt');
        $serviceCode = $booking->service?->code;
        $isSacrament = in_array($serviceCode, self::RESCHEDULABLE_SERVICES, true);
        $requiresPayment = in_array($serviceCode, self::PAYMENT_SERVICES, true);
        $reference = $booking->payment_reference
            ?? $booking->massIntention?->payment_reference
            ?? $booking->documentRequest?->payment_reference;
        $amount = $isSacrament
            ? $booking->total_amount
            : (float) ($booking->massIntention?->total_amount
                ?? $booking->documentRequest?->total_amount
                ?? 0);

        return [
            'required' => $requiresPayment,
            'referenceNumber' => $reference,
            'amount' => $amount,
            'status' => match ($receipt?->status) {
                'approved' => 'confirmed',
                'rejected' => 'rejected',
                'pending' => 'pending',
                default => 'not_submitted',
            },
            'receipt' => $receipt ? [
                'fileName' => $receipt->file_name,
                'url' => Storage::disk('public')->url($receipt->file_path),
            ] : null,
            'canSubmit' => $requiresPayment
                && $booking->status === 'pending'
                && (! $receipt || $receipt->status === 'rejected'),
        ];
    }

    private function weddingSections(Booking $booking): array
    {
        $sections = $booking->weddingApplicants->map(fn ($person) => [
            'title' => ucfirst($person->role).' information',
            'fields' => $this->fields([
                'Name' => $this->name($person->first_name, $person->middle_initial, $person->last_name),
                'Age' => $person->age,
                'Contact number' => $person->contact_number,
                'Address' => $person->address,
                'Baptized in' => $person->baptized_in,
                'Confirmed in' => $person->confirmed_in,
                "Father's name" => $this->name($person->father_first_name, $person->father_middle_initial, $person->father_last_name),
                "Mother's name" => $this->name($person->mother_first_name, $person->mother_middle_initial, $person->mother_last_name),
            ]),
        ])->values()->all();

        foreach ($booking->weddingSponsorPairs as $index => $pair) {
            $sections[] = [
                'title' => 'Principal sponsor pair '.($index + 1),
                'fields' => $pair->sponsors->map(fn ($sponsor) => [
                    'label' => $sponsor->role === 'godfather' ? 'Godfather (Ninong)' : 'Godmother (Ninang)',
                    'value' => $this->name($sponsor->first_name, $sponsor->middle_initial, $sponsor->last_name).' — '.$sponsor->residence,
                ])->values(),
            ];
        }

        if ($booking->appointments->isNotEmpty()) {
            $sections[] = [
                'title' => 'Appointments',
                'fields' => $booking->appointments->map(fn ($appointment) => [
                    'label' => $appointment->type === 'seminar' ? 'Wedding seminar' : 'Priest interview',
                    'value' => $appointment->scheduled_at->format('F j, Y g:i A').' — '.$appointment->venue,
                ])->values(),
            ];
        }

        return $sections;
    }

    private function funeralSections(Booking $booking): array
    {
        $person = $booking->funeralDeceased;
        if (! $person) {
            return [];
        }

        return [[
            'title' => 'Deceased information',
            'fields' => $this->fields([
                'Name' => $this->name($person->first_name, $person->middle_initial, $person->last_name),
                'Age' => $person->age,
                'Birth date' => $person->birth_date?->format('F j, Y'),
                'Address' => $person->address,
                'Cause of death' => $person->death_cause,
                "Father's name" => $this->name($person->father_first_name, $person->father_middle_initial, $person->father_last_name),
                "Mother's name" => $this->name($person->mother_first_name, $person->mother_middle_initial, $person->mother_last_name),
                "Spouse's name" => $this->name($person->spouse_first_name, $person->spouse_middle_initial, $person->spouse_last_name),
                'Children' => $person->children->map(fn ($child) => $this->name($child->first_name, $child->middle_initial, $child->last_name))->filter()->join(', '),
                'Informant' => $this->name($person->informant_first_name, $person->informant_middle_initial, $person->informant_last_name),
                'Informant relationship' => $person->informant_relationship,
                'Informant contact' => $person->informant_contact_number,
            ]),
        ]];
    }

    private function baptismSections(Booking $booking): array
    {
        $person = $booking->baptizand;
        if (! $person) {
            return [];
        }

        $sections = [[
            'title' => 'Baptizand information',
            'fields' => $this->fields([
                'Name' => $this->name($person->first_name, $person->middle_initial, $person->last_name, $person->suffix),
                'Birth date' => $person->birth_date?->format('F j, Y'),
                'Birth place' => $person->birth_place,
                'Age' => $person->age,
                'Gender' => $person->gender,
                'Address' => $person->address,
                'Contact number' => $person->contact_number,
                'Parents' => $person->parents->map(fn ($parent) => ucfirst($parent->relationship).': '.$this->name($parent->first_name, $parent->middle_initial, $parent->last_name, $parent->suffix))->join(', '),
                'Godparents' => $person->godParentPairs->flatMap(fn ($pair) => $pair->godParents)->map(fn ($godParent) => ucfirst($godParent->role).': '.$this->name($godParent->first_name, $godParent->middle_initial, $godParent->last_name, $godParent->suffix))->join(', '),
            ]),
        ]];

        if ($booking->appointments->isNotEmpty()) {
            $sections[] = [
                'title' => 'Seminar schedule',
                'fields' => $booking->appointments->map(fn ($appointment) => [
                    'label' => 'Baptism seminar',
                    'value' => $appointment->scheduled_at->format('F j, Y g:i A').' — '.$appointment->venue,
                ])->values(),
            ];
        }

        return $sections;
    }

    private function massIntentionSections(Booking $booking): array
    {
        $intention = $booking->massIntention;
        if (! $intention) {
            return [];
        }

        return [[
            'title' => 'Mass intention details',
            'fields' => $this->fields([
                'Intention date' => $intention->intention_date?->format('F j, Y'),
                'Payment reference' => $intention->payment_reference,
                'Total amount' => '₱'.number_format((float) $intention->total_amount, 2),
                'Intentions' => $intention->entries->map(fn ($entry) => $entry->intention_type.': '.collect($entry->names)->join(', '))->join(' | '),
            ]),
        ]];
    }

    private function documentRequestSections(Booking $booking): array
    {
        $request = $booking->documentRequest;
        if (! $request) {
            return [];
        }

        return [[
            'title' => 'Requested documents',
            'fields' => $request->items->map(fn ($item) => [
                'label' => $item->document_type,
                'value' => '₱'.number_format((float) $item->price, 2),
            ])->values(),
        ], [
            'title' => 'Payment details',
            'fields' => $this->fields([
                'Payment reference' => $request->payment_reference,
                'Total amount' => '₱'.number_format((float) $request->total_amount, 2),
            ]),
        ]];
    }

    private function fields(array $values): array
    {
        return collect($values)->filter(fn ($value) => $value !== null && $value !== '')
            ->map(fn ($value, $label) => ['label' => $label, 'value' => (string) $value])
            ->values()->all();
    }

    private function name(?string $first, ?string $middle, ?string $last, ?string $suffix = null): string
    {
        $initial = $middle ? rtrim($middle, '.').'.' : null;

        return trim(implode(' ', array_filter([$first, $initial, $last, $suffix])));
    }
}
