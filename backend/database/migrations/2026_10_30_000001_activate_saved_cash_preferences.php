<?php

use App\Models\Booking;
use App\Services\PaymentService;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Booking::where('status', 'pending')->where('preferred_payment_method', 'cash')
            ->whereNotNull('physical_copies_received_at')->chunkById(100, function ($bookings) {
                foreach ($bookings as $booking) {
                    app(PaymentService::class)->activateCashPreference($booking);
                }
            });
    }

    public function down(): void
    {
        // Preserve payment records, which staff may already have processed.
    }
};
