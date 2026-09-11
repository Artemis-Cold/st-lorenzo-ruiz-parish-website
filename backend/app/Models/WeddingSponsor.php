<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeddingSponsor extends Model
{
    protected $fillable = [
        'booking_id',
        'sort_order',
        'role',
        'first_name',
        'middle_initial',
        'last_name',
        'residence',
        'requirement_type',
        'requirement_file_name',
        'requirement_file_path',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
