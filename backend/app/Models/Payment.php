<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    public const ACTIVE_STATUSES = ['awaiting_payment', 'pending_verification'];

    protected $fillable = [
        'booking_id',
        'method',
        'amount',
        'status',
        'reference_number',
        'receipt_document_id',
        'official_receipt_number',
        'confirmed_by',
        'confirmed_at',
        'voided_at',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'voided_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function receiptDocument(): BelongsTo
    {
        return $this->belongsTo(BookingDocument::class, 'receipt_document_id');
    }

    public function confirmer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
}
