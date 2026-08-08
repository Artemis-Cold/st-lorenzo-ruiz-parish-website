<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServicePackage extends Model
{
    protected $fillable = [
        'service_id',
        'name',
        'base_price',
        'recommended',
        'active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'recommended' => 'boolean',
        'active' => 'boolean',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function inclusions(): HasMany
    {
        return $this->hasMany(PackageInclusion::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(PackageAddon::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
