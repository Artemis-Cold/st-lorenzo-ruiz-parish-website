<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'code',
        'name',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function packages(): HasMany
    {
        return $this->hasMany(ServicePackage::class);
    }

    public function bookingSlots()
{
    return $this->hasMany(BookingSlot::class);
}
}