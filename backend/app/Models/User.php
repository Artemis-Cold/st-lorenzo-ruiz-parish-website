<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

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
        ];
    }

    protected $appends = [
        'full_name',
    ];

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_initial,
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
