<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\RescheduleBookingRequest;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\BookingRequirementService;
use App\Services\BookingReschedulingService;
use App\Services\PaymentService;
use App\Services\SmsNotificationService;
use App\Support\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
            'weddingApplicants', 'weddingSponsors', 'appointments',
            'baptizand.parents', 'baptizand.godParents',
            'funeralDeceased.children', 'massIntention.entries',
            'documentRequest.items',
            'payments.receiptDocument',
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
                'startTime' => $booking->slot?->start_time
                    ?? $booking->massIntention?->mass_starts_at?->format('H:i'),
                'endTime' => $booking->slot?->end_time,
            ],
            'package' => $booking->package ? [
                'name' => $booking->pricing_snapshot['package']['name'] ?? $booking->package->name,
                'baseAmount' => Money::decimal($booking->pricing_snapshot['package']['basePrice'] ?? $booking->package->base_price),
                'inclusions' => collect($booking->pricing_snapshot['inclusions'] ?? [])
                    ->pluck('name')
                    ->whenEmpty(fn () => $booking->package->inclusions->pluck('name'))
                    ->values(),
                'addons' => collect($booking->pricing_snapshot['addons'] ?? $booking->selectedAddons->map(fn ($addon) => [
                    'name' => $addon->name,
                    'price' => $addon->price,
                ])->values())->map(fn ($addon) => [
                    ...$addon,
                    'price' => Money::decimal($addon['price'] ?? 0),
                ])->values(),
                'fees' => collect($booking->pricing_snapshot['fees'] ?? [])->map(fn ($fee) => [
                    ...$fee,
                    'price' => Money::decimal($fee['price'] ?? 0),
                    'subtotal' => Money::decimal($fee['subtotal'] ?? 0),
                ])->values(),
                'totalAmount' => Money::decimal($booking->total_amount),
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
        $fileTypes = match (true) {
            str_starts_with($documentType, 'couple_photo') => 'jpg,jpeg,png',
            str_starts_with($documentType, 'wedding_sponsor_'),
            str_starts_with($documentType, 'baptism_godparent_') => 'pdf',
            default => 'jpg,jpeg,png,pdf',
        };

        $data = $request->validate([
            'document_type' => ['required', 'string', Rule::in($requirements->allowedTypes($booking))],
            'file' => ['required', 'file', 'mimes:'.$fileTypes, 'max:5120'],
        ]);

        $existingDocument = $booking->documents()
            ->where('document_type', $data['document_type'])
            ->first();

        if ($existingDocument && $existingDocument->status !== 'rejected') {
            throw ValidationException::withMessages([
                'file' => 'This requirement has already been uploaded.',
            ]);
        }

        $file = $data['file'];
        $newPath = $file->store('booking-documents', 'public');
        $oldPath = $existingDocument?->file_path;

        if ($existingDocument) {
            $existingDocument->update([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $newPath,
                'status' => 'pending',
                'remarks' => null,
            ]);
            $document = $existingDocument->refresh();
        } else {
            $document = $booking->documents()->create([
                'document_type' => $data['document_type'],
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $newPath,
                'status' => 'pending',
            ]);
        }

        if ($oldPath && $oldPath !== $newPath) {
            Storage::disk('public')->delete($oldPath);
        }

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
                    'remarks' => $document->remarks,
                    'url' => Storage::disk('public')->url($document->file_path),
                ],
                'missingRequirements' => $missing,
            ],
        ], 201);
    }

    public function submitPayment(
        Request $request,
        Booking $booking,
        PaymentService $payments
    ): JsonResponse {
        abort_unless($booking->user_id === $request->user()->id, 404);
        $serviceCode = $booking->service()->value('code');
        abort_unless(in_array($serviceCode, self::PAYMENT_SERVICES, true), 404);

        if (! in_array($booking->status, ['pending', 'paid'], true)) {
            throw ValidationException::withMessages([
                'receipt' => 'Payment can no longer be submitted for this booking.',
            ]);
        }

        if ($booking->status === 'paid' || $booking->payments()->where('status', 'confirmed')->exists()) {
            throw ValidationException::withMessages([
                'payment_method' => 'Payment for this booking has already been confirmed.',
            ]);
        }

        $request->mergeIfMissing(['payment_method' => 'gcash']);

        $allowedMethods = in_array($serviceCode, ['mass-intention', 'document-request'], true)
            ? ['gcash']
            : ['gcash', 'cash'];

        $data = $request->validate([
            'payment_method' => ['required', Rule::in($allowedMethods)],
            'reference_number' => [
                'required_if:payment_method,gcash',
                'nullable',
                'digits:13',
                Rule::unique('payments', 'reference_number'),
                Rule::unique('bookings', 'payment_reference')->ignore($booking->id),
                Rule::unique('mass_intentions', 'payment_reference')->ignore($booking->massIntention?->id),
                Rule::unique('document_request_bookings', 'payment_reference')->ignore($booking->documentRequest?->id),
            ],
            'receipt' => [
                'required_if:payment_method,gcash',
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
        ], [
            'payment_method.in' => 'GCash is the only accepted payment method for this service.',
            'reference_number.digits' => 'Enter the 13-digit GCash transaction reference number.',
        ]);

        $payment = $payments->createAttempt(
            $booking,
            $data['payment_method'],
            $data['reference_number'] ?? null,
            $data['receipt'] ?? null,
        );

        $booking->load([
            'service', 'package.inclusions', 'selectedAddons', 'documents',
            'payments.receiptDocument',
        ]);

        return response()->json([
            'message' => $payment->method === 'cash'
                ? 'Cash payment selected. Please pay at the parish office.'
                : 'GCash payment submitted and is awaiting parish staff verification.',
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
        $sponsors = $booking->weddingSponsors->sortBy('sort_order')->values();
        $sponsorNumbers = $sponsors->mapWithKeys(
            fn ($sponsor, int $index) => [(string) $sponsor->id => $index + 1]
        );
        $godParents = $booking->baptizand?->godParents?->sortBy('sort_order')->values() ?? collect();
        $godParentNumbers = $godParents->mapWithKeys(
            fn ($godParent, int $index) => [(string) $godParent->id => $index + 1]
        );

        $documents = $booking->documents
            ->reject(fn ($document) => $document->document_type === 'payment_receipt')
            ->map(function ($document) use ($sponsorNumbers, $godParentNumbers) {
                $type = $document->document_type;

                if (preg_match('/^wedding_sponsor_individual_(marriage_contract|confirmation_certificate)_(\d+)$/', $type, $matches)) {
                    $sponsorNumber = $sponsorNumbers->get($matches[2]);

                    if ($sponsorNumber !== null) {
                        $type = "sponsor_{$sponsorNumber}_{$matches[1]}";
                    }
                }

                if (preg_match('/^baptism_godparent_individual_(marriage_contract|confirmation_certificate)_(\d+)$/', $type, $matches)) {
                    $godParentNumber = $godParentNumbers->get($matches[2]);

                    if ($godParentNumber !== null) {
                        $type = "godparent_{$godParentNumber}_{$matches[1]}";
                    }
                }

                return [
                    'id' => $document->id,
                    'type' => $type,
                    'requirementType' => $document->document_type,
                    'fileName' => $document->file_name,
                    'status' => $document->status,
                    'remarks' => $document->remarks,
                    'url' => Storage::disk('public')->url($document->file_path),
                ];
            });

        $sponsorDocuments = $sponsors
            ->filter(fn ($sponsor) => filled($sponsor->requirement_file_path))
            ->map(function ($sponsor) use ($sponsorNumbers) {
                $sponsorNumber = $sponsorNumbers->get((string) $sponsor->id);
                $type = $sponsor->requirement_type;
                $path = $sponsor->requirement_file_path;
                $label = "Sponsor {$sponsorNumber} ".str($type)->headline();
                $extension = pathinfo($path, PATHINFO_EXTENSION);

                return [
                    'id' => null,
                    'type' => "sponsor_{$sponsorNumber}_{$type}",
                    'requirementType' => "wedding_sponsor_individual_{$type}_{$sponsor->id}",
                    'fileName' => $sponsor->requirement_file_name
                        ?: $label.($extension ? ".{$extension}" : ''),
                    'status' => 'submitted',
                    'remarks' => null,
                    'url' => Storage::disk('public')->url($path),
                ];
            })
            ->values();

        $godParentDocuments = $godParents
            ->filter(fn ($godParent) => filled($godParent->requirement_file_path))
            ->map(function ($godParent) use ($godParentNumbers) {
                $godParentNumber = $godParentNumbers->get((string) $godParent->id);
                $type = $godParent->requirement_type;
                $path = $godParent->requirement_file_path;
                $label = "Godparent {$godParentNumber} ".str($type)->headline();
                $extension = pathinfo($path, PATHINFO_EXTENSION);

                return [
                    'id' => null,
                    'type' => "godparent_{$godParentNumber}_{$type}",
                    'requirementType' => "baptism_godparent_individual_{$type}_{$godParent->id}",
                    'fileName' => $godParent->requirement_file_name
                        ?: $label.($extension ? ".{$extension}" : ''),
                    'status' => 'submitted',
                    'remarks' => null,
                    'url' => Storage::disk('public')->url($path),
                ];
            })
            ->values();

        return $documents
            ->concat($sponsorDocuments)
            ->concat($godParentDocuments)
            ->values();
    }

    private function paymentData(Booking $booking): array
    {
        $serviceCode = $booking->service?->code;
        $isSacrament = in_array($serviceCode, self::RESCHEDULABLE_SERVICES, true);
        $requiresPayment = in_array($serviceCode, self::PAYMENT_SERVICES, true);
        $payment = $booking->payments
            ->whereIn('status', [...Payment::ACTIVE_STATUSES, 'confirmed', 'rejected'])
            ->sortByDesc('id')
            ->first();
        $receipt = $payment?->receiptDocument;
        $amount = Money::decimal($isSacrament
            ? $booking->total_amount
            : ($booking->massIntention?->total_amount
                ?? $booking->documentRequest?->total_amount
                ?? 0));

        return [
            'required' => $requiresPayment,
            'method' => $payment?->method,
            'referenceNumber' => $payment?->reference_number,
            'officialReceiptNumber' => $payment?->official_receipt_number,
            'amount' => $amount,
            'status' => $payment?->status ?? 'not_submitted',
            'receipt' => $receipt ? [
                'fileName' => $receipt->file_name,
                'url' => Storage::disk('public')->url($receipt->file_path),
            ] : null,
            'canChangeMethod' => $requiresPayment
                && $booking->status === 'pending'
                && $payment?->status !== 'confirmed',
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

        foreach ($booking->weddingSponsors as $index => $sponsor) {
            $sections[] = [
                'title' => 'Principal sponsor '.($index + 1),
                'fields' => [[
                    'label' => $sponsor->role === 'godfather' ? 'Godfather (Ninong)' : 'Godmother (Ninang)',
                    'value' => collect([
                        $this->name($sponsor->first_name, $sponsor->middle_initial, $sponsor->last_name),
                        $sponsor->residence,
                        $sponsor->requirement_type
                            ? str($sponsor->requirement_type)->headline().' selected'
                            : null,
                    ])->filter()->join(' — '),
                ]],
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
                'Godparents' => $person->godParents->map(fn ($godParent) => collect([
                    ucfirst($godParent->role).': '.$this->name($godParent->first_name, $godParent->middle_initial, $godParent->last_name, $godParent->suffix),
                    $godParent->requirement_type ? str($godParent->requirement_type)->headline() : null,
                ])->filter()->join(' — '))->join(', '),
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
                'Mass schedule' => $intention->mass_starts_at
                    ? $intention->mass_starts_at->format('g:i A').' — '.$intention->mass_schedule_title
                    : null,
                'Venue' => $intention->mass_location,
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
