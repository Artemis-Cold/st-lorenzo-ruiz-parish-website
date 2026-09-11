<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mass_intentions', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->change();
        });
        Schema::table('document_request_bookings', function (Blueprint $table) {
            $table->string('payment_reference')->nullable()->change();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('method', 20);
            $table->decimal('amount', 10, 2);
            $table->string('status', 30);
            // Keep room for legacy references; all new GCash inputs are validated to exactly 13 digits.
            $table->string('reference_number', 100)->nullable()->index();
            $table->foreignId('receipt_document_id')
                ->nullable()
                ->constrained('booking_documents')
                ->nullOnDelete();
            $table->string('official_receipt_number')->nullable();
            $table->foreignId('confirmed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('voided_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'status']);
            $table->index(['method', 'status']);
        });

        DB::table('booking_documents')
            ->where('document_type', 'payment_receipt')
            ->orderBy('id')
            ->get()
            ->each(function ($receipt): void {
                $booking = DB::table('bookings')->where('id', $receipt->booking_id)->first();

                if (! $booking) {
                    return;
                }

                $massIntention = DB::table('mass_intentions')
                    ->where('booking_id', $booking->id)
                    ->first();
                $documentRequest = DB::table('document_request_bookings')
                    ->where('booking_id', $booking->id)
                    ->first();

                DB::table('payments')->insert([
                    'booking_id' => $booking->id,
                    'method' => 'gcash',
                    'amount' => $booking->total_amount
                        ?? $massIntention?->total_amount
                        ?? $documentRequest?->total_amount
                        ?? 0,
                    'status' => match ($receipt->status) {
                        'approved' => 'confirmed',
                        'rejected' => 'rejected',
                        default => 'pending_verification',
                    },
                    'reference_number' => $booking->payment_reference
                        ?? $massIntention?->payment_reference
                        ?? $documentRequest?->payment_reference,
                    'receipt_document_id' => $receipt->id,
                    'confirmed_by' => $receipt->status === 'approved'
                        ? $booking->processed_by
                        : null,
                    'confirmed_at' => $receipt->status === 'approved'
                        ? $booking->processed_at
                        : null,
                    'created_at' => $receipt->created_at,
                    'updated_at' => $receipt->updated_at,
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');

        Schema::table('mass_intentions', function (Blueprint $table) {
            $table->string('payment_reference')->nullable(false)->change();
        });
        Schema::table('document_request_bookings', function (Blueprint $table) {
            $table->string('payment_reference')->nullable(false)->change();
        });
    }
};
