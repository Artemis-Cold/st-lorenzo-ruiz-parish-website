<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuneralChild extends Model
{
    protected $guarded = [];

    public function deceased(): BelongsTo
    {
        return $this->belongsTo(FuneralDeceased::class, 'funeral_deceased_id');
    }
}
