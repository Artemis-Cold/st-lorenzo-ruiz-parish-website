<?php

namespace App\Support;

class LoginIdentity
{
    public static function phone(string $value): string
    {
        $value = trim($value);
        if (! preg_match('/^\+?[0-9\s()-]+$/', $value)) {
            return $value;
        }
        $digits = preg_replace('/\D/', '', $value);

        return preg_match('/^639\d{9}$/', $digits) ? '0'.substr($digits, 2) : $digits;
    }
}
