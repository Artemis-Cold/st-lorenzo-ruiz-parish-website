<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeddingSponsorPair extends Model
{
    protected $fillable = [
        'booking_id',
        'marriage_contract',
        'confirmation_certificate',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function sponsors(): HasMany
    {
        return $this->hasMany(WeddingSponsor::class);
    }
}
