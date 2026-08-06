<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingSlot extends Model
{
    protected $fillable = [

        'service_id',

        'booking_date',

        'booking_time',

        'capacity',

        'is_active',

    ];

    protected $casts = [

        'booking_date'=>'date',

    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
