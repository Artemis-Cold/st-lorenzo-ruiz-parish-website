<?php

namespace App\Services\Parishioner;

use App\Models\User;

class ParishionerIdService
{
    public static function generate(): string
    {
        $year = now()->year;

        $lastUser = User::whereYear('created_at', $year)
            ->whereNotNull('parishioner_id')
            ->latest('id')
            ->first();

        if (! $lastUser) {
            $number = 1;
        } else {
            $lastNumber = (int) substr($lastUser->parishioner_id, -6);

            $number = $lastNumber + 1;
        }

        return sprintf(
            'PR-%d-%06d',
            $year,
            $number
        );
    }
}
