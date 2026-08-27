<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('bookings')
            ->where('status', 'paid')
            ->whereNotExists(function (Builder $query) {
                $query->selectRaw('1')
                    ->from('booking_documents')
                    ->whereColumn('booking_documents.booking_id', 'bookings.id')
                    ->where('booking_documents.document_type', 'payment_receipt')
                    ->where('booking_documents.status', 'approved');
            })
            ->update([
                'status' => 'pending',
                'processed_by' => null,
                'processed_at' => null,
            ]);
    }

    public function down(): void
    {
        // The previous unverified paid state cannot be restored safely.
    }
};
