<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\RescheduleBookingRequest;
use App\Models\Booking;
use App\Services\BookingReschedulingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ParishionerBookingController extends Controller
{
    private const RESCHEDULABLE_SERVICES = ['baptism', 'wedding', 'funeral'];

    public function show(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->user_id === $request->user()->id, 404);

        $booking->load([
            'service', 'package.inclusions', 'selectedAddons', 'slot', 'documents',
            'weddingApplicants', 'weddingAppointments',
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
                && in_array($booking->status, ['pending', 'approved'], true),
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
            'sections' => $this->sections($booking),
            'documents' => $booking->documents->map(fn ($document) => [
                'type' => $document->document_type,
                'fileName' => $document->file_name,
                'status' => $document->status,
                'url' => Storage::disk('public')->url($document->file_path),
            ])->values(),
        ]]);
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

        if ($booking->weddingAppointments->isNotEmpty()) {
            $sections[] = [
                'title' => 'Appointments',
                'fields' => $booking->weddingAppointments->map(fn ($appointment) => [
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

        return [[
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
