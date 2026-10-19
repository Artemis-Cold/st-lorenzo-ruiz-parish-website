<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingScheduleReviewService
{
    public const SERVICES = ['baptism', 'wedding', 'funeral', 'confirmation', 'first-communion'];

    public function __construct(private BookingSlotAvailabilityService $availability, private SmsNotificationService $sms) {}

    public function request(int $slotId, string $code, User $user): Booking
    {
        if ($code === 'first-communion') {
            throw ValidationException::withMessages(['booking_slot_id' => 'The parish assigns the First Communion ceremony date. Submit the registration form without selecting a schedule.']);
        }

        return DB::transaction(function () use ($slotId, $code, $user) {
            // Serializes repeat submissions by the same parishioner as well as slot claims.
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $existing = Booking::where('user_id', $user->id)->whereHas('service', fn ($q) => $q->where('code', $code))
                ->where('status', 'pending')->whereIn('schedule_status', ['awaiting_review', 'confirmed'])
                ->whereNull('details_submitted_at')->first();
            if ($existing) {
                throw ValidationException::withMessages(['booking_slot_id' => 'You already have an unfinished schedule request for this service. Open it to continue or change its schedule.']);
            }
            $slot = $this->availability->lockBookable($slotId, $code);
            $booking = Booking::create([
                'booking_reference' => 'SCH-'.strtoupper(Str::random(12)),
                'user_id' => $user->id, 'service_id' => $slot->service_id,
                'booking_slot_id' => $slot->id, 'status' => 'pending', 'total_amount' => 0,
                'schedule_status' => 'awaiting_review', 'schedule_requested_at' => now(),
            ]);
            $this->notifyRequested($booking);

            return $booking;
        }, 3);
    }

    public function notifyRequested(Booking $booking): void
    {
        $booking->loadMissing(['user', 'service', 'slot']);
        $this->sms->queue($booking, 'schedule_requested',
            "St. Lorenzo Ruiz Parish: Your {$booking->service->name} schedule request (Ref: {$booking->booking_reference}) for {$this->when($booking)} is awaiting admin confirmation. Please wait for confirmation before submitting requirements.");
    }

    public function review(Booking $booking, string $decision, ?string $reason, int $staffId): Booking
    {
        return DB::transaction(function () use ($booking, $decision, $reason, $staffId) {
            $booking = Booking::with(['service', 'slot', 'user'])->lockForUpdate()->findOrFail($booking->id);
            if ($booking->schedule_status !== 'awaiting_review' || ! in_array($booking->status, ['pending', 'paid'], true)) {
                throw ValidationException::withMessages(['decision' => 'This schedule is no longer awaiting review. Refresh the booking.']);
            }
            $reason = trim($reason ?? '');
            if ($decision === 'rejected' && $reason === '') {
                throw ValidationException::withMessages(['reason' => 'Enter the reason for rejecting this schedule.']);
            }
            if ($decision === 'confirmed') {
                if ($booking->booking_slot_id) {
                    $this->availability->lockBookable($booking->booking_slot_id, $booking->service->code, $booking->id);
                } elseif ((! $booking->wedding_booking_id && $booking->service->code !== 'first-communion') || ! $booking->appointments()->where('type', 'sacrament')->where('scheduled_at', '>', now())->exists()) {
                    throw ValidationException::withMessages(['decision' => 'Assign a future ceremony date and time before confirming this schedule.']);
                }
            }
            $booking->update([
                'schedule_status' => $decision, 'schedule_reason' => $decision === 'rejected' ? $reason : null,
                'schedule_reviewed_at' => now(), 'schedule_reviewed_by' => $staffId,
            ]);
            $next = ($booking->wedding_booking_id || $booking->service->code === 'first-communion') ? 'Contact the parish office to arrange another schedule.' : 'Open My Profile to choose another date and time.';
            $message = $decision === 'confirmed'
                ? "Your {$booking->service->name} schedule on {$this->when($booking)} is confirmed. You may now submit requirements through My Profile."
                : "Your requested {$booking->service->name} schedule on {$this->when($booking)} was rejected. Reason: {$reason}. {$next}";
            $this->sms->queue($booking, 'schedule_'.$decision, "St. Lorenzo Ruiz Parish (Ref: {$booking->booking_reference}): {$message}");

            return $booking;
        }, 3);
    }

    /** Called inside the existing booking transaction, before any files are stored. */
    public function lockForSubmission(array $data, string $code): Booking
    {
        if (empty($data['schedule_request_id'])) {
            $this->rejectEarlyFiles($data);

            return $this->request((int) $data['booking_slot_id'], $code, auth()->user());
        }
        $booking = Booking::whereKey($data['schedule_request_id'] ?? 0)->where('user_id', auth()->id())->lockForUpdate()->first();
        if (! $booking || $booking->service()->value('code') !== $code || $booking->booking_slot_id !== (int) $data['booking_slot_id']) {
            throw ValidationException::withMessages(['schedule_request_id' => 'Use your schedule request for this service.']);
        }
        if ($booking->status !== 'pending' || ! in_array($booking->schedule_status, ['awaiting_review', 'confirmed'], true) || ! $booking->awaitingDetails()) {
            throw ValidationException::withMessages(['schedule_request_id' => 'Choose a new schedule if rejected. Each request may only have its booking details submitted once.']);
        }
        if (! $booking->scheduleConfirmed()) {
            $this->rejectEarlyFiles($data);
        }
        $this->availability->lockBookable($booking->booking_slot_id, $code, $booking->id);

        return $booking;
    }

    private function rejectEarlyFiles(array $data): void
    {
        array_walk_recursive($data, function ($value) {
            if ($value instanceof UploadedFile) {
                throw ValidationException::withMessages(['documents' => 'Admin must confirm your schedule before you upload any requirements.']);
            }
        });
    }

    public function requireUnlocked(Booking $booking): void
    {
        if (! $booking->scheduleConfirmed() || $booking->awaitingDetails()) {
            throw ValidationException::withMessages(['schedule' => 'Complete your booking details and wait for admin to confirm your schedule before submitting requirements.']);
        }
    }

    private function when(Booking $booking): string
    {
        if ($booking->slot) {
            return $booking->slot->booking_date->format('F j, Y').' at '.substr($booking->slot->start_time, 0, 5);
        }

        return $booking->appointments()->where('type', 'sacrament')->first()?->scheduled_at?->timezone('Asia/Manila')->format('F j, Y \a\t g:i A') ?? 'a date to be assigned';
    }
}
