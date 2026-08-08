<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Baptizand extends Model
{
    protected $fillable = [

        'booking_id',

        'first_name',
        'middle_initial',
        'last_name',
        'suffix',

        'birth_date',
        'birth_place',

        'age',

        'gender',

        'address',

        'contact_number',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function parents(): HasMany
    {
        return $this->hasMany(BaptizandParent::class);
    }

    public function godParentPairs(): HasMany
    {
        return $this->hasMany(GodParentPair::class);
    }
}
