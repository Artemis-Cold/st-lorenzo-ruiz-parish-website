<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'parishioner_id',
        'username',
        'password',

        'first_name',
        'middle_initial',
        'last_name',
        'suffix',

        'birth_date',
        'gender',

        'phone',

        'house_no',
        'street',
        'barangay',
        'municipality',
        'province',
        'zip_code',

        'profile_photo',

        'role',
        'is_active',
        'profile_completed',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'profile_completed' => 'boolean',
        ];
    }

    protected $appends = [
        'full_name',
    ];

    protected function middleInitial(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => filled($value) ? mb_strtoupper(trim($value)) : null,
        );
    }

    public function getFullNameAttribute(): string
    {
        $middleInitial = $this->middle_initial
            ? rtrim($this->middle_initial, '.').'.'
            : null;

        return trim(implode(' ', array_filter([
            $this->first_name,
            $middleInitial,
            $this->last_name,
            $this->suffix,
        ])));
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function approvedBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'approved_by');
    }
}
