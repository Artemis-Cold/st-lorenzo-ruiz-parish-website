<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeddingApplicant extends Model
{
    protected $fillable = [
        'booking_id',
        'role',
        'first_name',
        'middle_initial',
        'last_name',
        'address',
        'age',
        'contact_number',
        'baptized_in',
        'confirmed_in',
        'father_first_name',
        'father_middle_initial',
        'father_last_name',
        'mother_first_name',
        'mother_middle_initial',
        'mother_last_name',
        'church_name',
        'priest',
        'church_address',
    ];

    protected $casts = [
        'age' => 'integer',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
