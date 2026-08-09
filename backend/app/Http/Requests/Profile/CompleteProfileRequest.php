<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;

class CompleteProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'barangay' => ['required', 'string'],
            'municipality' => ['required', 'string'],
            'province' => ['required', 'string'],
            'house_no' => ['nullable', 'string'],
            'street' => ['nullable', 'string'],
            'zip_code' => ['nullable', 'string'],
            'birth_date' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:Male,Female'],
        ];
    }
}
