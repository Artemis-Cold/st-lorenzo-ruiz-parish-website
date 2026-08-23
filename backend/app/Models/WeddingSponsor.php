<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeddingSponsor extends Model
{
    protected $fillable = [
        'wedding_sponsor_pair_id',
        'role',
        'first_name',
        'middle_initial',
        'last_name',
        'residence',
    ];

    public function pair(): BelongsTo
    {
        return $this->belongsTo(WeddingSponsorPair::class, 'wedding_sponsor_pair_id');
    }
}
