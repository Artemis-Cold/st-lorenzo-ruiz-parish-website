<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentRequestItem extends Model
{
    protected $fillable = [
        'document_request_booking_id',
        'document_type',
        'details',
        'price',
    ];

    protected $casts = [
        'details' => 'array',
        'price' => 'decimal:2',
    ];

    public function documentRequest(): BelongsTo
    {
        return $this->belongsTo(DocumentRequestBooking::class);
    }
}
