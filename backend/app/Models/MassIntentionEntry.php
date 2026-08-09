<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MassIntentionEntry extends Model
{
    protected $fillable = [
        'mass_intention_id',
        'intention_type',
        'names',
        'amount',
    ];

    protected $casts = [
        'names' => 'array',
        'amount' => 'decimal:2',
    ];

    public function massIntention(): BelongsTo
    {
        return $this->belongsTo(MassIntention::class);
    }
}
