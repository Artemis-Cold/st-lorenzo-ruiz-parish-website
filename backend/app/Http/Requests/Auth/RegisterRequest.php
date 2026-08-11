<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class RegisterRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => Str::lower(trim((string) $this->input('username'))),
            'phone' => preg_replace('/\D+/', '', (string) $this->input('phone')),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [

            'username' => [
                'required',
                'string',
                'min:5',
                'max:30',
                'unique:users,username',
            ],
            'password' => [
                'required',
                'confirmed',
                'min:8',
            ],

            'first_name' => [
                'required',
                'string',
            ],
            'middle_initial' => [
                'nullable',
                'string',
                'max:1',
            ],
            'last_name' => [
                'required',
                'string',
            ],
            'suffix' => [
                'nullable',
                'string',
            ],
            'phone' => [
                'required',
                'regex:/^09\d{9}$/',
                'unique:users,phone',
            ],
            'house_no' => ['nullable'],
            'street' => ['nullable'],
            'barangay' => ['nullable', 'string'],
            'municipality' => ['nullable', 'string'],
            'province' => ['nullable', 'string'],
            'zip_code' => ['nullable'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable'],
        ];
    }
}
