<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\MarriageBann;
use App\Services\BookingRequirementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MarriageBannController extends Controller
{
    public function publicIndex(): JsonResponse
    {
        $banns = MarriageBann::query()
            ->whereDate('publication_start', '<=', today())
            ->whereDate('publication_end', '>=', today())
            ->whereHas('booking', fn ($query) => $query
                ->where('status', 'approved')
                ->whereHas('service', fn ($service) => $service->where('code', 'wedding')))
            ->with([
                'booking.slot',
                'booking.weddingApplicants',
                'booking.documents' => fn ($query) => $query
                    ->where('document_type', 'like', 'couple_photo%'),
            ])
            ->orderBy('publication_end')
            ->get()
            ->map(fn (MarriageBann $bann) => $this->serializePublic($bann));

        return response()->json(['data' => $banns]);
    }

    public function store(
        Request $request,
        Booking $booking,
        BookingRequirementService $requirements
    ): JsonResponse {
        abort_unless($booking->service()->value('code') === 'wedding', 404);
        $booking->load([
            'service', 'slot', 'documents', 'weddingApplicants',
            'weddingSponsors', 'marriageBann', 'payments',
        ]);

        if ($booking->status !== 'approved') {
            throw ValidationException::withMessages([
                'booking' => 'Marriage banns can only be published for an approved wedding booking.',
            ]);
        }

        if (! $booking->payments->contains('status', 'confirmed')) {
            throw ValidationException::withMessages([
                'booking' => 'The wedding payment must be confirmed before publishing its marriage banns.',
            ]);
        }

        if ($requirements->missing($booking) !== []) {
            throw ValidationException::withMessages([
                'booking' => 'All wedding requirements must be complete before publishing its marriage banns.',
            ]);
        }

        $data = $request->validate([
            'publicationStart' => ['required', 'date', 'after_or_equal:today'],
            'publicationEnd' => ['required', 'date', 'after_or_equal:publicationStart'],
        ]);

        if (! $booking->slot?->booking_date) {
            throw ValidationException::withMessages([
                'booking' => 'The wedding must have a valid schedule before publishing its marriage banns.',
            ]);
        }

        if ($booking->slot->booking_date->isBefore($data['publicationEnd'])) {
            throw ValidationException::withMessages([
                'publicationEnd' => 'The publication end date must not be later than the wedding date.',
            ]);
        }

        $bann = MarriageBann::updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'published_by' => $request->user()->id,
                'publication_start' => $data['publicationStart'],
                'publication_end' => $data['publicationEnd'],
            ]
        );

        return response()->json([
            'message' => 'Marriage banns published successfully.',
            'data' => $this->serializeStaff($bann->fresh()),
        ], $bann->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        abort_unless($booking->service()->value('code') === 'wedding', 404);
        $bann = $booking->marriageBann()->firstOrFail();
        $bann->delete();

        return response()->json([
            'message' => 'Marriage banns removed from public view.',
        ]);
    }

    private function serializePublic(MarriageBann $bann): array
    {
        $applicants = $bann->booking->weddingApplicants->keyBy('role');

        return [
            'id' => $bann->id,
            'groomName' => $this->name($applicants->get('groom')),
            'brideName' => $this->name($applicants->get('bride')),
            'weddingDate' => $bann->booking->slot?->booking_date?->toDateString(),
            'weddingTime' => $bann->booking->slot?->start_time
                ? substr($bann->booking->slot->start_time, 0, 5)
                : null,
            'publicationStart' => $bann->publication_start->toDateString(),
            'publicationEnd' => $bann->publication_end->toDateString(),
            'photos' => $bann->booking->documents
                ->sortBy('document_type')
                ->map(fn ($document) => [
                    'url' => Storage::disk('public')->url($document->file_path),
                ])
                ->values(),
        ];
    }

    private function serializeStaff(MarriageBann $bann): array
    {
        return [
            'id' => $bann->id,
            'publicationStart' => $bann->publication_start->toDateString(),
            'publicationEnd' => $bann->publication_end->toDateString(),
        ];
    }

    private function name($person): string
    {
        if (! $person) {
            return 'Name unavailable';
        }

        return trim(collect([
            $person->first_name,
            $person->middle_initial ? rtrim($person->middle_initial, '.').'.' : null,
            $person->last_name,
        ])->filter()->join(' '));
    }
}
