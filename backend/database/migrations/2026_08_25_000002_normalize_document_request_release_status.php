<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('bookings')
            ->where('status', 'approved')
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('document_request_bookings')
                    ->whereColumn('document_request_bookings.booking_id', 'bookings.id');
            })
            ->whereExists(function ($query) {
                $query->selectRaw('1')
                    ->from('booking_documents')
                    ->whereColumn('booking_documents.booking_id', 'bookings.id')
                    ->where('booking_documents.document_type', 'payment_receipt')
                    ->where('booking_documents.status', 'approved');
            })
            ->update([
                'status' => 'paid',
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // The previous approval/processing state cannot be reconstructed safely.
    }
};
