<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GodParent extends Model
{
    protected $fillable = [
        'baptizand_id',
        'sort_order',
        'role',
        'first_name',
        'middle_initial',
        'last_name',
        'suffix',
        'residence',
        'requirement_type',
        'requirement_file_name',
        'requirement_file_path',
    ];

    public function baptizand(): BelongsTo
    {
        return $this->belongsTo(Baptizand::class);
    }
}
