<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GodParentPair extends Model
{
    protected $fillable = [

        'baptizand_id',

        'marriage_contract',

        'confirmation_certificate',

    ];

    public function baptizand(): BelongsTo
    {
        return $this->belongsTo(Baptizand::class);
    }

    public function godParents(): HasMany
    {
        return $this->hasMany(GodParent::class);
    }
}
