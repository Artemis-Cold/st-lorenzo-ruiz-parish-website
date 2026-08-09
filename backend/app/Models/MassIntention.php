<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MassIntention extends Model
{
    protected $fillable = [
        'booking_id',
        'intention_date',
        'payment_reference',
        'total_amount',
    ];

    protected $casts = [
        'intention_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(MassIntentionEntry::class);
    }
}
