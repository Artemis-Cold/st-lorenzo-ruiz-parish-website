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
        'mass_event_id',
        'mass_schedule_title',
        'mass_starts_at',
        'mass_location',
        'payment_reference',
        'total_amount',
    ];

    protected $casts = [
        'intention_date' => 'date',
        'mass_starts_at' => 'datetime',
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

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'mass_event_id');
    }
}
