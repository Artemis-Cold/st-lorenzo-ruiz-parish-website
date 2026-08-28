<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\RequestRequirementResubmissionRequest;
use App\Http\Requests\Staff\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Services\BookingRequirementService;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class StaffBookingController extends Controller
{
    use ManagesBookingStatus;

    public function __construct(private BookingRequirementService $requirements) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'service' => ['nullable', 'in:wedding,funeral,baptism'],
            'status' => ['nullable', 'in:pending,paid,approved,rejected,cancelled,completed'],
            'search' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Booking::query()
            ->whereHas('service', fn ($query) => $query->whereIn('code', [
                'wedding', 'funeral', 'baptism',
            ]));

        if (! empty($filters['service'])) {
            $query->whereHas(
                'service',
                fn ($service) => $service->where('code', $filters['service'])
            );
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['date'])) {
            $query->whereHas(
                'slot',
                fn ($slot) => $slot->whereDate('booking_date', $filters['date'])
            );
        }

        $searchTerms = preg_split('/\s+/', trim($filters['search'] ?? ''), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($searchTerms ?: [] as $term) {
            $like = '%'.$term.'%';
            $query->where(function ($booking) use ($like) {
                $booking
                    ->where('booking_reference', 'like', $like)
                    ->orWhereHas('user', fn ($user) => $user
                        ->where('first_name', 'like', $like)
                        ->orWhere('middle_initial', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('username', 'like', $like)
                        ->orWhere('phone', 'like', $like))
                    ->orWhereHas('weddingApplicants', fn ($applicant) => $applicant
                        ->where('first_name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('contact_number', 'like', $like))
                    ->orWhereHas('funeralDeceased', fn ($deceased) => $deceased
                        ->where('first_name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('informant_contact_number', 'like', $like))
                    ->orWhereHas('baptizand', fn ($baptizand) => $baptizand
                        ->where('first_name', 'like', $like)
                        ->orWhere('last_name', 'like', $like)
                        ->orWhere('contact_number', 'like', $like));
            });
        }

        $bookings = $query
            ->with([
                'user', 'service', 'package.inclusions', 'selectedAddons', 'slot',
                'documents', 'weddingApplicants', 'weddingSponsorPairs.sponsors', 'baptizand.parents',
                'baptizand.godParentPairs.godParents',
                'funeralDeceased.children',
                'appointments',
                'marriageBann',
            ])
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        $data = $bookings->getCollection()
            ->map(fn (Booking $booking) => $this->serialize($booking));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'from' => $bookings->firstItem(),
                'to' => $bookings->lastItem(),
            ],
        ]);
    }

    public function updateStatus(
        UpdateBookingStatusRequest $request,
        Booking $booking
    ): JsonResponse {
        abort_unless(
            in_array($booking->service()->value('code'), ['wedding', 'funeral', 'baptism'], true),
            404
        );

        if ($request->validated('status') === 'approved') {
            if (! in_array($booking->status, ['pending', 'paid'], true)) {
                throw ValidationException::withMessages([
                    'status' => "A {$booking->status} booking cannot be changed to approved.",
                ]);
            }

            if ($this->requirements->missing($booking) !== []) {
                throw ValidationException::withMessages([
                    'documents' => 'This booking cannot be approved until all required documents are submitted.',
                ]);
            }

            $hasConfirmedPayment = $booking->documents()
                ->where('document_type', 'payment_receipt')
                ->where('status', 'approved')
                ->exists();

            if (! $hasConfirmedPayment) {
                throw ValidationException::withMessages([
                    'payment' => 'This booking cannot be approved until its payment is confirmed.',
                ]);
            }
        }

        $this->changeStatus($booking, $request->validated('status'), [
            'pending' => ['approved', 'rejected', 'cancelled'],
            'paid' => ['approved', 'rejected', 'cancelled'],
            'approved' => ['completed', 'cancelled'],
        ]);

        $booking->load([
            'user', 'service', 'package.inclusions', 'selectedAddons', 'slot',
            'documents', 'weddingApplicants', 'weddingSponsorPairs.sponsors', 'baptizand.parents',
            'baptizand.godParentPairs.godParents',
            'funeralDeceased.children',
            'appointments',
            'marriageBann',
        ]);

        return response()->json(['data' => $this->serialize($booking)]);
    }

    public function remindRequirements(Booking $booking): JsonResponse
    {
        abort_unless(
            in_array($booking->service()->value('code'), ['wedding', 'funeral', 'baptism'], true),
            404
        );

        if (! $this->requirements->notifyIfIncomplete($booking)) {
            throw ValidationException::withMessages([
                'documents' => 'This booking has no missing requirements.',
            ]);
        }

        return response()->json([
            'message' => 'The missing-requirements SMS reminder has been queued.',
        ]);
    }

    public function requestRequirementResubmission(
        RequestRequirementResubmissionRequest $request,
        Booking $booking
    ): JsonResponse {
        abort_unless(
            in_array($booking->service()->value('code'), ['wedding', 'funeral', 'baptism'], true),
            404
        );

        if (! in_array($booking->status, ['pending', 'paid'], true)) {
            throw ValidationException::withMessages([
                'document_key' => 'Requirements can only be reviewed while the booking is pending approval.',
            ]);
        }

        $result = $this->requirements->requestResubmission(
            $booking,
            $request->validated('document_key'),
            $request->validated('reason'),
        );

        $booking->load([
            'user', 'service', 'package.inclusions', 'selectedAddons', 'slot',
            'documents', 'weddingApplicants', 'weddingSponsorPairs.sponsors', 'baptizand.parents',
            'baptizand.godParentPairs.godParents',
            'funeralDeceased.children',
            'appointments',
            'marriageBann',
        ]);

        return response()->json([
            'message' => "The parishioner was notified to resubmit {$result['label']}.",
            'data' => $this->serialize($booking),
        ]);
    }

    public function remindPayment(
        Booking $booking,
        SmsNotificationService $sms
    ): JsonResponse {
        abort_unless(
            in_array($booking->service()->value('code'), ['wedding', 'funeral', 'baptism'], true),
            404
        );

        $receipt = $booking->documents()
            ->where('document_type', 'payment_receipt')
            ->first();

        if ($booking->status === 'paid' || $receipt?->status === 'approved') {
            throw ValidationException::withMessages([
                'payment' => 'This booking payment has already been confirmed.',
            ]);
        }

        if ($receipt?->status === 'pending') {
            throw ValidationException::withMessages([
                'payment' => 'This payment is already awaiting staff verification.',
            ]);
        }

        $booking->loadMissing(['user', 'service', 'package.inclusions', 'selectedAddons']);
        $amount = number_format($booking->total_amount, 2);
        $service = $booking->service->name;
        $reference = $booking->booking_reference;
        $sms->queue(
            $booking,
            'payment_reminder',
            "St. Lorenzo Ruiz Parish: Payment reminder for your {$service} booking (Ref: {$reference}). Amount due: PHP {$amount}. Please submit your GCash reference number and receipt through My Profile. Thank you."
        );

        return response()->json([
            'message' => 'The payment SMS reminder has been queued.',
        ]);
    }

    private function serialize(Booking $booking): array
    {
        $type = match ($booking->service->code) {
            'wedding' => 'Marriage',
            'funeral' => 'Funeral',
            default => 'Baptism',
        };

        $names = match ($booking->service->code) {
            'wedding' => $booking->weddingApplicants
                ->map(fn ($person) => trim("{$person->first_name} {$person->last_name}"))
                ->join(' & '),
            'funeral' => trim(implode(' ', array_filter([
                $booking->funeralDeceased?->first_name,
                $booking->funeralDeceased?->last_name,
            ]))),
            default => trim(implode(' ', array_filter([
                $booking->baptizand?->first_name,
                $booking->baptizand?->last_name,
            ]))),
        };

        $contact = match ($booking->service->code) {
            'wedding' => $booking->weddingApplicants->first()?->contact_number,
            'funeral' => $booking->funeralDeceased?->informant_contact_number,
            default => $booking->baptizand?->contact_number,
        } ?: $booking->user->phone;
        $pricing = $booking->pricing_snapshot;

        return [
            'id' => $booking->id,
            'reference' => $booking->booking_reference,
            'date' => $booking->slot?->booking_date?->format('m-d-Y')
                ?? $booking->created_at->format('m-d-Y'),
            'names' => $names ?: $booking->user->full_name,
            'contactNumber' => $contact,
            'type' => $type,
            'amount' => $booking->total_amount,
            'status' => $booking->status,
            'details' => [
                'submittedBy' => $booking->user->full_name,
                'packageName' => $pricing['package']['name'] ?? $booking->package?->name,
                'baseAmount' => (float) ($pricing['package']['basePrice'] ?? $booking->package?->base_price ?? 0),
                'inclusions' => $pricing['inclusions'] ?? ($booking->package?->inclusions->map(fn ($inclusion) => [
                    'name' => $inclusion->name,
                    'price' => (float) $inclusion->price,
                ])->values() ?? []),
                'addons' => $pricing['addons'] ?? $booking->selectedAddons->map(fn ($addon) => [
                    'name' => $addon->name,
                    'price' => (float) $addon->price,
                ])->values(),
                'fees' => $pricing['fees'] ?? [],
                'schedule' => [
                    'date' => $booking->slot?->booking_date?->format('F j, Y'),
                    'startTime' => $booking->slot?->start_time,
                    'endTime' => $booking->slot?->end_time,
                ],
                'remarks' => $booking->remarks,
                'payment' => $this->paymentData($booking),
                'marriageBanns' => $booking->marriageBann ? [
                    'id' => $booking->marriageBann->id,
                    'publicationStart' => $booking->marriageBann->publication_start->toDateString(),
                    'publicationEnd' => $booking->marriageBann->publication_end->toDateString(),
                ] : null,
                'documents' => $this->documents($booking),
                'missingRequirements' => $this->requirements->missing($booking),
                'serviceData' => $this->serviceData($booking),
                'appointments' => $booking->appointments->map(fn ($appointment) => [
                    'id' => $appointment->id,
                    'type' => $appointment->type,
                    'scheduledAt' => $appointment->scheduled_at->toIso8601String(),
                    'venue' => $appointment->venue,
                    'notes' => $appointment->notes,
                ])->values(),
            ],
        ];
    }

    private function paymentData(Booking $booking): array
    {
        $receipt = $booking->documents->firstWhere('document_type', 'payment_receipt');

        return [
            'referenceNumber' => $booking->payment_reference,
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
            'canRemind' => $booking->status === 'pending'
                && (! $receipt || $receipt->status === 'rejected'),
        ];
    }

    private function documents(Booking $booking): Collection
    {
        $sponsorPairs = $booking->weddingSponsorPairs->sortBy('id')->values();
        $pairNumbers = $sponsorPairs->mapWithKeys(
            fn ($pair, int $index) => [(string) $pair->id => $index + 1]
        );
        $godParentPairs = $booking->baptizand?->godParentPairs?->sortBy('id')->values() ?? collect();
        $godParentPairNumbers = $godParentPairs->mapWithKeys(
            fn ($pair, int $index) => [(string) $pair->id => $index + 1]
        );

        $documents = $booking->documents->map(function ($document) use ($pairNumbers, $godParentPairNumbers) {
            $type = $document->document_type;

            if (preg_match('/^wedding_sponsor_(marriage_contract|confirmation_certificate)_(\d+)$/', $type, $matches)) {
                $pairNumber = $pairNumbers->get($matches[2]);

                if ($pairNumber !== null) {
                    $type = "sponsor_pair_{$pairNumber}_{$matches[1]}";
                }
            }

            if (preg_match('/^godparent_(marriage_contract|confirmation_certificate)_(\d+)$/', $type, $matches)) {
                $pairNumber = $godParentPairNumbers->get($matches[2]);

                if ($pairNumber !== null) {
                    $type = "godparent_pair_{$pairNumber}_{$matches[1]}";
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
                'reviewKey' => $document->document_type === 'payment_receipt'
                    ? null
                    : "document:{$document->id}",
            ];
        });

        $sponsorDocuments = $sponsorPairs->flatMap(function ($pair, int $index) {
            $pairNumber = $index + 1;

            return collect([
                'marriage_contract' => $pair->marriage_contract,
                'confirmation_certificate' => $pair->confirmation_certificate,
            ])->filter()->map(function (string $path, string $type) use ($pair, $pairNumber) {
                $label = 'Sponsor Pair '.$pairNumber.' '.str($type)->headline();
                $extension = pathinfo($path, PATHINFO_EXTENSION);

                return [
                    'id' => null,
                    'type' => "sponsor_pair_{$pairNumber}_{$type}",
                    'requirementType' => "wedding_sponsor_{$type}_{$pair->id}",
                    'fileName' => $label.($extension ? ".{$extension}" : ''),
                    'status' => 'submitted',
                    'remarks' => null,
                    'url' => Storage::disk('public')->url($path),
                    'reviewKey' => "wedding-sponsor:{$pair->id}:{$type}",
                ];
            })->values();
        });

        $godParentDocuments = $godParentPairs->flatMap(function ($pair, int $index) {
            $pairNumber = $index + 1;

            return collect([
                'marriage_contract' => $pair->marriage_contract,
                'confirmation_certificate' => $pair->confirmation_certificate,
            ])->filter()->map(function (string $path, string $type) use ($pair, $pairNumber) {
                $label = 'Godparent Pair '.$pairNumber.' '.str($type)->headline();
                $extension = pathinfo($path, PATHINFO_EXTENSION);

                return [
                    'id' => null,
                    'type' => "godparent_pair_{$pairNumber}_{$type}",
                    'requirementType' => "godparent_{$type}_{$pair->id}",
                    'fileName' => $label.($extension ? ".{$extension}" : ''),
                    'status' => 'submitted',
                    'remarks' => null,
                    'url' => Storage::disk('public')->url($path),
                    'reviewKey' => "baptism-godparent:{$pair->id}:{$type}",
                ];
            })->values();
        });

        return $documents->concat($sponsorDocuments)->concat($godParentDocuments)->values();
    }

    private function serviceData(Booking $booking): array
    {
        if ($booking->service->code === 'wedding') {
            return [
                'applicants' => $booking->weddingApplicants->map(fn ($person) => [
                    'role' => ucfirst($person->role),
                    'name' => $this->personName($person->first_name, $person->middle_initial, $person->last_name),
                    'age' => $person->age,
                    'address' => $person->address,
                    'contactNumber' => $person->contact_number,
                    'baptizedIn' => $person->baptized_in,
                    'confirmedIn' => $person->confirmed_in,
                    'fatherName' => $this->personName($person->father_first_name, $person->father_middle_initial, $person->father_last_name),
                    'motherName' => $this->personName($person->mother_first_name, $person->mother_middle_initial, $person->mother_last_name),
                    'previousMarriage' => [
                        'churchName' => $person->church_name,
                        'priest' => $person->priest,
                        'churchAddress' => $person->church_address,
                    ],
                ])->values(),
                'sponsorPairs' => $booking->weddingSponsorPairs->map(fn ($pair) => [
                    'sponsors' => $pair->sponsors->map(fn ($sponsor) => [
                        'role' => $sponsor->role,
                        'name' => $this->personName($sponsor->first_name, $sponsor->middle_initial, $sponsor->last_name),
                        'residence' => $sponsor->residence,
                    ])->values(),
                ])->values(),
            ];
        }

        if ($booking->service->code === 'funeral') {
            $person = $booking->funeralDeceased;

            return ['deceased' => $person ? [
                'name' => $this->personName($person->first_name, $person->middle_initial, $person->last_name),
                'age' => $person->age,
                'birthDate' => $person->birth_date?->format('F j, Y'),
                'address' => $person->address,
                'deathCause' => $person->death_cause,
                'informantName' => $this->personName($person->informant_first_name, $person->informant_middle_initial, $person->informant_last_name),
                'informantRelationship' => $person->informant_relationship,
                'informantContactNumber' => $person->informant_contact_number,
                'fatherName' => $this->personName($person->father_first_name, $person->father_middle_initial, $person->father_last_name),
                'motherName' => $this->personName($person->mother_first_name, $person->mother_middle_initial, $person->mother_last_name),
                'spouseName' => $this->personName($person->spouse_first_name, $person->spouse_middle_initial, $person->spouse_last_name),
                'characteristics' => $person->characteristics,
                'churchLife' => [
                    'attendsMass' => $person->attends_mass,
                    'confesses' => $person->confesses,
                ],
                'sacraments' => [
                    'baptized' => $person->baptized,
                    'confirmed' => $person->confirmed,
                    'churchMarried' => $person->church_married,
                    'anointedOfTheSick' => $person->anointed_of_the_sick,
                ],
                'children' => $person->children->map(fn ($child) => $this->personName($child->first_name, $child->middle_initial, $child->last_name))->values(),
            ] : null];
        }

        $person = $booking->baptizand;

        return ['baptizand' => $person ? [
            'name' => $this->personName($person->first_name, $person->middle_initial, $person->last_name, $person->suffix),
            'birthDate' => $person->birth_date?->format('F j, Y'),
            'birthPlace' => $person->birth_place,
            'age' => $person->age,
            'gender' => $person->gender,
            'address' => $person->address,
            'contactNumber' => $person->contact_number,
            'parents' => $person->parents->map(fn ($parent) => [
                'relationship' => ucfirst($parent->relationship),
                'name' => $this->personName($parent->first_name, $parent->middle_initial, $parent->last_name, $parent->suffix),
                'birthPlace' => $parent->birth_place,
            ])->values(),
            'godParents' => $person->godParentPairs
                ->flatMap(fn ($pair) => $pair->godParents)
                ->map(fn ($godParent) => [
                    'role' => ucfirst($godParent->role),
                    'name' => $this->personName($godParent->first_name, $godParent->middle_initial, $godParent->last_name, $godParent->suffix),
                    'residence' => $godParent->residence,
                ])->values(),
        ] : null];
    }

    private function personName(?string $first, ?string $middle, ?string $last, ?string $suffix = null): string
    {
        $initial = $middle ? rtrim($middle, '.').'.' : null;

        return trim(implode(' ', array_filter([$first, $initial, $last, $suffix])));
    }
}
