<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarriageBann extends Model
{
    protected $fillable = [
        'booking_id',
        'published_by',
        'publication_start',
        'publication_end',
    ];

    protected function casts(): array
    {
        return [
            'publication_start' => 'date',
            'publication_end' => 'date',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
