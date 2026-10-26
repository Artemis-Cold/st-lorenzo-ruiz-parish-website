<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\CompleteProfileRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfilePhotoRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

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
        $validated = $request->validated();
        $phoneChanged = $validated['phone'] !== $user->phone;

        try {
            $user->forceFill([
                ...$validated,
                'profile_completed' => true,
                'phone_verified_at' => $phoneChanged
                    ? null
                    : $user->phone_verified_at,
            ])->save();
        } catch (UniqueConstraintViolationException $exception) {
            foreach (['username', 'phone'] as $field) {
                if (isset($validated[$field]) && User::where($field, $validated[$field])->whereKeyNot($user->id)->exists()) {
                    throw ValidationException::withMessages([$field => "This {$field} is already taken."]);
                }
            }
            throw $exception;
        }

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['password' => $request->validated('password')]);

        $currentTokenId = $user->currentAccessToken()?->id;
        if ($currentTokenId) {
            $user->tokens()->whereKeyNot($currentTokenId)->delete();
        }

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function show(Request $request): JsonResponse
    {
        $bookingQuery = $request->user()
            ->bookings()
            ->with(['service', 'package', 'slot', 'massIntention', 'appointments']);

        $currentBookings = (clone $bookingQuery)
            ->whereIn('status', ['pending', 'paid', 'approved', 'ready_for_pickup'])
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
                    'booking_id' => $booking->id,
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
            'schedule_review' => $booking->scheduleReview(),
            'service' => $booking->service?->name,
            'package' => $booking->package?->name,
            'status' => $booking->status,
            'booking_date' => $booking->slot?->booking_date?->toDateString()
                ?? $booking->massIntention?->intention_date?->toDateString()
                ?? $booking->appointments->where('type', 'sacrament')->sortByDesc('id')->first()?->scheduled_at?->timezone('Asia/Manila')->toDateString(),
            'start_time' => $booking->slot?->start_time
                ?? $booking->massIntention?->mass_starts_at?->format('H:i')
                ?? $booking->appointments->where('type', 'sacrament')->sortByDesc('id')->first()?->scheduled_at?->timezone('Asia/Manila')->format('H:i'),
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
