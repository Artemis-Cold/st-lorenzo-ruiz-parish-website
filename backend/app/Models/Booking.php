<?php

namespace App\Models;

use App\Support\Money;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $appends = [
        'total_amount',
    ];

    protected $fillable = [
        'booking_reference',
        'payment_reference',
        'preferred_payment_method',
        'user_id',
        'service_id',
        'service_package_id',
        'booking_slot_id',
        'total_amount',
        'pricing_snapshot',
        'status',
        'processed_by',
        'processed_at',
        'remarks',
        'wedding_booking_id',
        'wedding_applicant_role',
        'documents_approved_notified_at',
        'physical_copies_received_at',
        'physical_copies_received_by',
        'schedule_status',
        'schedule_reason',
        'schedule_requested_at',
        'schedule_reviewed_at',
        'schedule_reviewed_by',
        'details_submitted_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'schedule_requested_at' => 'datetime',
        'schedule_reviewed_at' => 'datetime',
        'details_submitted_at' => 'datetime',
        'documents_approved_notified_at' => 'datetime',
        'physical_copies_received_at' => 'datetime',
        'total_amount' => 'decimal:2',
        'pricing_snapshot' => 'array',
    ];

    public function getTotalAmountAttribute(): string
    {
        if (($this->attributes['total_amount'] ?? null) !== null) {
            return Money::decimal($this->attributes['total_amount']);
        }

        return Money::decimal(($this->package?->base_price ?? 0)
            + ($this->package?->inclusions->sum('price') ?? 0)
            + $this->selectedAddons->sum('price'));
    }

    public function scheduleConfirmed(): bool
    {
        return $this->schedule_status === null || $this->schedule_status === 'confirmed';
    }

    public function awaitingDetails(): bool
    {
        return $this->schedule_status !== null && $this->details_submitted_at === null;
    }

    public function scheduleReview(): ?array
    {
        return $this->schedule_status === null ? null : [
            'status' => $this->schedule_status,
            'reason' => $this->schedule_reason,
            'requestedAt' => $this->schedule_requested_at?->toIso8601String(),
            'reviewedAt' => $this->schedule_reviewed_at?->toIso8601String(),
            'detailsSubmitted' => ! $this->awaitingDetails(),
        ];
    }

    public function scopeScheduleHeld($query)
    {
        return $query->where(fn ($q) => $q->whereNull('schedule_status')->orWhere('schedule_status', '!=', 'rejected'));
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function weddingBooking(): BelongsTo
    {
        return $this->belongsTo(self::class, 'wedding_booking_id');
    }

    public function preparations(): HasMany
    {
        return $this->hasMany(self::class, 'wedding_booking_id');
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

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function weddingApplicants(): HasMany
    {
        return $this->hasMany(WeddingApplicant::class);
    }

    public function weddingSponsors(): HasMany
    {
        return $this->hasMany(WeddingSponsor::class)->orderBy('sort_order');
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

    public function appointments(): HasMany
    {
        return $this->hasMany(BookingAppointment::class);
    }

    public function marriageBann(): HasOne
    {
        return $this->hasOne(MarriageBann::class);
    }
}
