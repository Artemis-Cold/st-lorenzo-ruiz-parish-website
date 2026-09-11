<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Str;
use RuntimeException;

class UsernameGenerator
{
    private const MAX_LENGTH = 30;

    private const SUFFIX_LENGTH = 4;

    public function generate(string $firstName): string
    {
        $firstPart = explode(' ', Str::squish($firstName))[0] ?? '';
        $base = Str::lower(Str::ascii($firstPart));
        $base = preg_replace('/[^a-z0-9]/', '', $base) ?: 'parishioner';
        $base = mb_substr($base, 0, self::MAX_LENGTH);

        if (! $this->exists($base)) {
            return $base;
        }

        $base = mb_substr(
            $base,
            0,
            self::MAX_LENGTH - self::SUFFIX_LENGTH
        );
        $startingSuffix = random_int(1000, 9999);

        for ($offset = 0; $offset < 9000; $offset++) {
            $suffix = 1000 + (($startingSuffix - 1000 + $offset) % 9000);
            $candidate = $base.$suffix;

            if (! $this->exists($candidate)) {
                return $candidate;
            }
        }

        throw new RuntimeException(
            'Unable to generate a unique username for this first name.'
        );
    }

    private function exists(string $username): bool
    {
        return User::query()->where('username', $username)->exists();
    }
}
