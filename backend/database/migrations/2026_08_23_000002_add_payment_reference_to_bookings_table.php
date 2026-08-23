<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->after('booking_reference')->index();
        });

        DB::table('mass_intentions')
            ->select(['booking_id', 'payment_reference'])
            ->whereNotNull('payment_reference')
            ->orderBy('booking_id')
            ->each(fn ($payment) => DB::table('bookings')
                ->where('id', $payment->booking_id)
                ->update(['payment_reference' => $payment->payment_reference]));

        DB::table('document_request_bookings')
            ->select(['booking_id', 'payment_reference'])
            ->whereNotNull('payment_reference')
            ->orderBy('booking_id')
            ->each(fn ($payment) => DB::table('bookings')
                ->where('id', $payment->booking_id)
                ->update(['payment_reference' => $payment->payment_reference]));
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['payment_reference']);
            $table->dropColumn('payment_reference');
        });
    }
};
