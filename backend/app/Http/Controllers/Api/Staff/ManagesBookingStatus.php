<?php

namespace App\Http\Controllers\Api\Staff;

use App\Models\Booking;
use Illuminate\Validation\ValidationException;

trait ManagesBookingStatus
{
    private function changeStatus(
        Booking $booking,
        string $status,
        array $transitions
    ): Booking {
        $allowed = $transitions[$booking->status] ?? [];

        if (! in_array($status, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => "A {$booking->status} booking cannot be changed to {$status}.",
            ]);
        }

        $booking->update([
            'status' => $status,
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return $booking->refresh();
    }
}
