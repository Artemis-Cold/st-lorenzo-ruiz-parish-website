<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GodParent extends Model
{
    protected $fillable = [
        'baptizand_id',
        'god_parent_pair_id',
        'role',
        'first_name',
        'middle_initial',
        'last_name',
        'suffix',
        'residence',
    ];

    public function pair(): BelongsTo
    {
        return $this->belongsTo(GodParentPair::class, 'god_parent_pair_id');
    }
}
