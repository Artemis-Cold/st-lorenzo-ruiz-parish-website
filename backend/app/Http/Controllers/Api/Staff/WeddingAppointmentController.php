<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\SmsNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WeddingAppointmentController extends Controller
{
    public function store(Request $request, Booking $booking, SmsNotificationService $sms): JsonResponse
    {
        abort_unless($booking->service()->value('code') === 'wedding', 404);
        $data = $request->validate([
            'type' => ['required', Rule::in(['seminar', 'priest_interview'])],
            'scheduledAt' => ['required', 'date', 'after:now'],
            'venue' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $appointment = $booking->weddingAppointments()->updateOrCreate(
            ['type' => $data['type']],
            [
                'created_by' => $request->user()->id,
                'scheduled_at' => $data['scheduledAt'],
                'venue' => $data['venue'],
                'notes' => $data['notes'] ?? null,
            ]
        );

        $label = $appointment->type === 'seminar' ? 'wedding seminar' : 'interview with the parish priest';
        $when = $appointment->scheduled_at->format('F j, Y \a\t g:i A');
        $sms->queue(
            $booking->loadMissing('user'),
            $appointment->type,
            "St. Lorenzo Ruiz Parish: Your {$label} (Ref: {$booking->booking_reference}) is scheduled for {$when} at {$appointment->venue}. Please arrive on time. Thank you."
        );

        return response()->json(['data' => [
            'id' => $appointment->id,
            'type' => $appointment->type,
            'scheduledAt' => $appointment->scheduled_at->toIso8601String(),
            'venue' => $appointment->venue,
            'notes' => $appointment->notes,
        ]], 201);
    }
}
