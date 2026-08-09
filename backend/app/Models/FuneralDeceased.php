<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FuneralDeceased extends Model
{
    protected $table = 'funeral_deceased';

    protected $guarded = [];

    protected $casts = [
        'birth_date' => 'date',
        'information_date' => 'date',
        'baptized' => 'boolean',
        'confirmed' => 'boolean',
        'church_married' => 'boolean',
        'anointed_of_the_sick' => 'boolean',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function children(): HasMany
    {
        return $this->hasMany(FuneralChild::class);
    }
}
