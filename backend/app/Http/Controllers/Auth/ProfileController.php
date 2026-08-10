<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\CompleteProfileRequest;
use App\Http\Requests\Profile\UpdateProfilePhotoRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __invoke(
        Request $request
    ): JsonResponse {

        return response()->json([
            'user' => new UserResource(
                $request->user()
            ),
        ]);
    }

    public function complete(CompleteProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            ...$request->validated(),
            'profile_completed' => true,
        ]);

        return response()->json([
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            ...$request->validated(),
            'profile_completed' => true,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $bookingQuery = $request->user()
            ->bookings()
            ->with(['service', 'package', 'slot', 'massIntention']);

        $currentBookings = (clone $bookingQuery)
            ->whereIn('status', ['pending', 'approved'])
            ->latest()
            ->get()
            ->map(fn ($booking) => $this->bookingData($booking));

        $recentBookings = (clone $bookingQuery)
            ->whereIn('status', ['completed', 'cancelled', 'rejected'])
            ->latest('updated_at')
            ->get()
            ->map(fn ($booking) => $this->bookingData($booking));

        $documents = $request->user()
            ->bookings()
            ->with('documentRequest.items')
            ->whereHas('documentRequest')
            ->latest()
            ->get()
            ->flatMap(fn ($booking) => $booking->documentRequest->items->map(
                fn ($item) => [
                    'id' => $item->id,
                    'booking_reference' => $booking->booking_reference,
                    'document_type' => $item->document_type,
                    'status' => $booking->status,
                    'price' => $item->price,
                    'requested_at' => $booking->created_at,
                ]
            ))->values();

        return response()->json([
            'user' => new UserResource($request->user()),
            'current_bookings' => $currentBookings,
            'recent_bookings' => $recentBookings,
            'documents' => $documents,
        ]);
    }

    private function bookingData($booking): array
    {
        return [
            'id' => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'service' => $booking->service?->name,
            'package' => $booking->package?->name,
            'status' => $booking->status,
            'booking_date' => $booking->slot?->booking_date?->toDateString()
                ?? $booking->massIntention?->intention_date?->toDateString(),
            'start_time' => $booking->slot?->start_time,
            'end_time' => $booking->slot?->end_time,
            'created_at' => $booking->created_at,
        ];
    }

    public function updatePhoto(
        UpdateProfilePhotoRequest $request
    ): JsonResponse {
        $user = $request->user();

        if ($user->profile_photo) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        $user->update([
            'profile_photo' => $request->file('profile_photo')
                ->store('profile-photos', 'public'),
        ]);

        return response()->json([
            'message' => 'Profile photo updated successfully.',
            'user' => new UserResource($user->fresh()),
        ]);
    }
}
