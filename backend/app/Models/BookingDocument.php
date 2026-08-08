<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDocument extends Model
{
    protected $fillable = [

        'booking_id',

        'document_type',

        'file_name',

        'file_path',

        'status',

        'remarks',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
