<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\UpdateBookingStatusRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StaffBookingController extends Controller
{
    use ManagesBookingStatus;

    public function index(): JsonResponse
    {
        $bookings = Booking::query()
            ->whereHas('service', fn ($query) => $query->whereIn('code', [
                'wedding', 'funeral', 'baptism',
            ]))
            ->with([
                'user', 'service', 'package.inclusions', 'selectedAddons', 'slot',
                'documents', 'weddingApplicants', 'baptizand.parents',
                'baptizand.godParentPairs.godParents',
                'funeralDeceased.children',
                'weddingAppointments',
            ])
            ->latest()
            ->get()
            ->map(fn (Booking $booking) => $this->serialize($booking));

        return response()->json(['data' => $bookings]);
    }

    public function updateStatus(
        UpdateBookingStatusRequest $request,
        Booking $booking
    ): JsonResponse {
        abort_unless(
            in_array($booking->service()->value('code'), ['wedding', 'funeral', 'baptism'], true),
            404
        );

        $this->changeStatus($booking, $request->validated('status'), [
            'pending' => ['approved', 'rejected', 'cancelled'],
            'approved' => ['completed', 'cancelled'],
        ]);

        $booking->load([
            'user', 'service', 'package.inclusions', 'selectedAddons', 'slot',
            'documents', 'weddingApplicants', 'baptizand.parents',
            'baptizand.godParentPairs.godParents',
            'funeralDeceased.children',
            'weddingAppointments',
        ]);

        return response()->json(['data' => $this->serialize($booking)]);
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
                'packageName' => $booking->package?->name,
                'baseAmount' => (float) ($booking->package?->base_price ?? 0),
                'inclusions' => $booking->package?->inclusions->map(fn ($inclusion) => [
                    'name' => $inclusion->name,
                    'price' => (float) $inclusion->price,
                ])->values() ?? [],
                'addons' => $booking->selectedAddons->map(fn ($addon) => [
                    'name' => $addon->name,
                    'price' => (float) $addon->price,
                ])->values(),
                'schedule' => [
                    'date' => $booking->slot?->booking_date?->format('F j, Y'),
                    'startTime' => $booking->slot?->start_time,
                    'endTime' => $booking->slot?->end_time,
                ],
                'remarks' => $booking->remarks,
                'documents' => $booking->documents->map(fn ($document) => [
                    'type' => $document->document_type,
                    'fileName' => $document->file_name,
                    'status' => $document->status,
                    'url' => Storage::disk('public')->url($document->file_path),
                ])->values(),
                'serviceData' => $this->serviceData($booking),
                'appointments' => $booking->weddingAppointments->map(fn ($appointment) => [
                    'id' => $appointment->id,
                    'type' => $appointment->type,
                    'scheduledAt' => $appointment->scheduled_at->toIso8601String(),
                    'venue' => $appointment->venue,
                    'notes' => $appointment->notes,
                ])->values(),
            ],
        ];
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
