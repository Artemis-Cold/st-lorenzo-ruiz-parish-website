<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingScheduleReviewService;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingAppointmentController extends Controller
{
    public function store(Request $request, Booking $booking, SmsNotificationService $sms): JsonResponse
    {
        return DB::transaction(function () use ($request, $booking, $sms) {
            $booking = Booking::lockForUpdate()->findOrFail($booking->id);
            $serviceCode = $booking->service()->value('code');
            abort_unless(in_array($serviceCode, ['wedding', 'baptism', 'confirmation', 'first-communion'], true), 404);

            $allowedTypes = $serviceCode === 'wedding'
                ? ['seminar', 'priest_interview']
                : ['seminar'];
            if ($serviceCode === 'first-communion' || ($booking->wedding_booking_id && in_array($serviceCode, ['baptism', 'confirmation'], true))) {
                $allowedTypes[] = 'sacrament';
            }

            $data = $request->validate([
                'type' => ['required', Rule::in($allowedTypes)],
                'scheduledAt' => ['required', 'date', 'after:now'],
                'notes' => ['nullable', 'string', 'max:2000'],
            ]);

            if (in_array($booking->status, ['cancelled', 'rejected', 'completed'], true)) {
                throw ValidationException::withMessages(['scheduledAt' => 'This booking is no longer available for scheduling.']);
            }
            if ($data['type'] !== 'sacrament') {
                app(BookingScheduleReviewService::class)->requireUnlocked($booking);
            }

            $appointment = $booking->appointments()->updateOrCreate(
                ['type' => $data['type']],
                [
                    'created_by' => $request->user()->id,
                    'scheduled_at' => $data['scheduledAt'],
                    // The venue may be assigned or adjusted when the parishioner
                    // arrives, so staff only schedules the date and time.
                    'venue' => '',
                    'notes' => $data['notes'] ?? null,
                ]
            );

            $label = match ([$serviceCode, $appointment->type]) {
                ['baptism', 'sacrament'] => 'baptism ceremony',
                ['confirmation', 'sacrament'] => 'confirmation ceremony',
                ['first-communion', 'sacrament'] => 'First Communion ceremony',
                ['baptism', 'seminar'] => 'baptism seminar',
                ['confirmation', 'seminar'] => 'confirmation seminar',
                ['first-communion', 'seminar'] => 'First Communion seminar',
                ['wedding', 'seminar'] => 'wedding seminar',
                default => 'interview with the parish priest',
            };
            $when = $appointment->scheduled_at->timezone('Asia/Manila')->format('F j, Y \a\t g:i A');
            if ($booking->wedding_booking_id) {
                $label = "{$booking->wedding_applicant_role}'s {$label} for wedding {$booking->weddingBooking->booking_reference}";
            }
            $parentAttendanceNotice = '';
            if ($appointment->type === 'sacrament' && ($booking->wedding_booking_id || $serviceCode === 'first-communion')) {
                $booking->update([
                    'schedule_status' => 'confirmed', 'schedule_reason' => null,
                    'schedule_requested_at' => $booking->schedule_requested_at ?? now(),
                    'schedule_reviewed_at' => now(), 'schedule_reviewed_by' => $request->user()->id,
                    'details_submitted_at' => $booking->details_submitted_at ?? $booking->created_at,
                ]);
                $parentAttendanceNotice = ' Your ceremony schedule is confirmed. You may now submit requirements through My Profile.';
            }

            if ($serviceCode === 'wedding' && $appointment->type === 'priest_interview') {
                $requiresParents = $booking->weddingApplicants()
                    ->whereBetween('age', [18, 24])
                    ->exists();

                if ($requiresParents) {
                    $parentAttendanceNotice = ' The couple must attend with the parent/s of the applicant/s aged 18-24.';
                }
            }

            $sms->queue(
                $booking->loadMissing('user'),
                in_array($serviceCode, ['baptism', 'confirmation', 'first-communion'], true)
                    ? $serviceCode.'_'.$appointment->type
                    : $appointment->type,
                "St. Lorenzo Ruiz Parish: Your {$label} (Ref: {$booking->booking_reference}) is scheduled for {$when}.{$parentAttendanceNotice} Please arrive on time. Thank you."
            );

            return response()->json(['data' => [
                'id' => $appointment->id,
                'type' => $appointment->type,
                'scheduledAt' => $appointment->scheduled_at->toIso8601String(),
                'venue' => $appointment->venue,
                'notes' => $appointment->notes,
                'scheduleReview' => $booking->scheduleReview(),
            ]], 201);
        }, 3);
    }
}
