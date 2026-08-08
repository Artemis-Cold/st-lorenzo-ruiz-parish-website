<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
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

            'middle_name' => [
                'nullable',
                'string',
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
                'unique:users,phone',
            ],

            'house_no' => ['nullable'],

            'street' => ['nullable'],

            'barangay' => ['required'],

            'municipality' => ['required'],

            'province' => ['required'],

            'zip_code' => ['nullable'],

            'birth_date' => ['nullable', 'date'],

            'gender' => ['nullable'],
        ];
    }
}
