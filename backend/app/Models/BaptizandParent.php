<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BaptizandParent extends Model
{
    protected $fillable = [

        'baptizand_id',

        'relationship',

        'first_name',
        'middle_initial',
        'last_name',
        'suffix',

        'birth_place',
    ];

    public function baptizand(): BelongsTo
    {
        return $this->belongsTo(Baptizand::class);
    }
}
