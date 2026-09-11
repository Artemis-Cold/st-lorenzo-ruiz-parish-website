<?php

namespace App\Support;

final class Money
{
    public static function decimal(int|float|string|null $amount): string
    {
        return number_format((float) ($amount ?? 0), 2, '.', '');
    }
}
