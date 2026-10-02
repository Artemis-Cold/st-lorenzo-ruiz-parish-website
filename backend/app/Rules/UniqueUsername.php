<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UniqueUsername implements ValidationRule
{
    public function __construct(private ?int $ignoreId = null) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (User::whereRaw('LOWER(username) = ?', [strtolower($value)])
            ->when($this->ignoreId, fn ($query) => $query->whereKeyNot($this->ignoreId))->exists()) {
            $fail('This username is already taken.');
        }
    }
}
