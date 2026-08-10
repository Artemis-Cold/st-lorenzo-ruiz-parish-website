<?php

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_initial' => ['nullable', 'string', 'max:1'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'phone' => [
                'required',
                'regex:/^09\d{9}$/',
                Rule::unique('users', 'phone')->ignore($this->user()->id),
            ],
            'birth_date' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:Male,Female'],
            'house_no' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:150'],
            'barangay' => ['required', 'string', 'max:150'],
            'municipality' => ['required', 'string', 'max:150'],
            'province' => ['required', 'string', 'max:150'],
            'zip_code' => ['nullable', 'string', 'max:20'],
        ];
    }
}
