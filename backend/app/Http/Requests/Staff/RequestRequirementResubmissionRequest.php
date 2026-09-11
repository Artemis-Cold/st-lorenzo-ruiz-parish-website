<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class RequestRequirementResubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'document_key' => [
                'required',
                'string',
                'max:100',
                'regex:/^(document:\d+|wedding-sponsor-individual:\d+|baptism-godparent-individual:\d+)$/',
            ],
            'reason' => ['required', 'string', 'min:5', 'max:300'],
        ];
    }

    public function messages(): array
    {
        return [
            'document_key.regex' => 'Select a valid submitted requirement.',
            'reason.required' => 'Explain why this requirement must be resubmitted.',
            'reason.min' => 'The reason must contain at least 5 characters.',
            'reason.max' => 'The reason must not exceed 300 characters.',
        ];
    }
}
