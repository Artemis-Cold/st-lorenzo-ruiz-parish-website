<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\MassIntentionEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StaffMassIntentionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'type' => ['nullable', 'in:Anniversary,Birthday,Petition,Soul,Thanksgiving'],
            'status' => ['nullable', 'in:pending,paid,rejected,cancelled,completed'],
            'search' => ['nullable', 'string', 'max:100'],
            'date' => ['nullable', 'date_format:Y-m-d'],
            'time' => ['nullable', 'date_format:H:i'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = MassIntentionEntry::query();

        if (! empty($filters['type'])) {
            $query->where('intention_type', $filters['type']);
        }

        if (! empty($filters['status'])) {
            $query->whereHas(
                'massIntention.booking',
                fn ($booking) => $booking->where('status', $filters['status'])
            );
        }

        if (! empty($filters['date'])) {
            $query->whereHas(
                'massIntention',
                fn ($intention) => $intention->whereDate('intention_date', $filters['date'])
            );
        }

        if (! empty($filters['time'])) {
            $time = $filters['time'].':00';
            $query->whereHas(
                'massIntention',
                fn ($intention) => $intention->whereTime('mass_starts_at', $time)
            );
        }

        $searchTerms = preg_split('/\s+/', trim($filters['search'] ?? ''), -1, PREG_SPLIT_NO_EMPTY);

        foreach ($searchTerms ?: [] as $term) {
            $like = '%'.$term.'%';
            $query->where(function ($entry) use ($like) {
                $entry
                    ->where('names', 'like', $like)
                    ->orWhereHas('massIntention', fn ($intention) => $intention
                        ->where('payment_reference', 'like', $like)
                        ->orWhereHas('booking', fn ($booking) => $booking
                            ->where('booking_reference', 'like', $like)
                            ->orWhereHas('user', fn ($user) => $user
                                ->where('first_name', 'like', $like)
                                ->orWhere('middle_initial', 'like', $like)
                                ->orWhere('last_name', 'like', $like)
                                ->orWhere('username', 'like', $like)
                                ->orWhere('phone', 'like', $like))));
            });
        }

        $entries = $query
            ->with(['massIntention.booking.user', 'massIntention.booking.documents'])
            ->latest()
            ->paginate($filters['per_page'] ?? 10);

        $data = $entries->getCollection()
            ->map(fn (MassIntentionEntry $entry) => $this->serialize($entry));

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $entries->currentPage(),
                'last_page' => $entries->lastPage(),
                'per_page' => $entries->perPage(),
                'total' => $entries->total(),
                'from' => $entries->firstItem(),
                'to' => $entries->lastItem(),
            ],
        ]);
    }

    private function serialize(MassIntentionEntry $entry): array
    {
        $massIntention = $entry->massIntention;
        $booking = $massIntention->booking;
        $receipt = $booking->documents->firstWhere('document_type', 'payment_receipt');

        return [
            'id' => $entry->id,
            'bookingId' => $booking->id,
            'date' => $massIntention->intention_date->format('m-d-Y'),
            'massTitle' => $massIntention->mass_schedule_title,
            'massStartsAt' => $massIntention->mass_starts_at?->toIso8601String(),
            'massTime' => $massIntention->mass_starts_at?->format('g:i A'),
            'massLocation' => $massIntention->mass_location,
            'names' => collect($entry->names)->filter()->join(' & '),
            'contactNumber' => $booking->user->phone,
            'type' => $entry->intention_type,
            'amount' => (float) $entry->amount,
            'status' => $booking->status,
            'reference' => $booking->booking_reference,
            'paymentReference' => $massIntention->payment_reference,
            'receipt' => $receipt ? [
                'fileName' => $receipt->file_name,
                'url' => Storage::disk('public')->url($receipt->file_path),
            ] : null,
        ];
    }
}
