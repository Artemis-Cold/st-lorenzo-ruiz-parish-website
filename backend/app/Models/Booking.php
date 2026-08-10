<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Booking extends Model
{
    protected $fillable = [
        'booking_reference',
        'user_id',
        'service_id',
        'service_package_id',
        'booking_slot_id',
        'status',
        'processed_by',
        'processed_at',
        'remarks',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(ServicePackage::class, 'service_package_id');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function baptizand(): HasOne
    {
        return $this->hasOne(Baptizand::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(BookingDocument::class);
    }

    public function weddingApplicants(): HasMany
    {
        return $this->hasMany(WeddingApplicant::class);
    }

    public function funeralDeceased(): HasOne
    {
        return $this->hasOne(FuneralDeceased::class);
    }

    public function massIntention(): HasOne
    {
        return $this->hasOne(MassIntention::class);
    }

    public function documentRequest(): HasOne
    {
        return $this->hasOne(DocumentRequestBooking::class);
    }

    public function selectedAddons(): BelongsToMany
    {
        return $this->belongsToMany(
            PackageAddon::class,
            'booking_package_addons'
        )->withTimestamps();
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(BookingSlot::class, 'booking_slot_id');
    }
}
