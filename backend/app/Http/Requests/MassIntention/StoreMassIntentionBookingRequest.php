<?php

namespace App\Http\Requests\MassIntention;

use Illuminate\Foundation\Http\FormRequest;

class StoreMassIntentionBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'intention_date' => ['required', 'date', 'after_or_equal:today'],
            'groups' => ['required', 'array', 'min:1'],
            'groups.*.type' => [
                'required',
                'distinct',
                'in:Special Intention,Thanksgiving,Birthday,Anniversary,Petition,Soul',
            ],
            'groups.*.entries' => ['required', 'array', 'min:1'],
            'groups.*.entries.*.names' => ['required', 'array', 'min:1', 'max:3'],
            'groups.*.entries.*.names.*' => ['required', 'string', 'max:150'],
            'reference_number' => [
                'required',
                'string',
                'max:100',
                'unique:mass_intentions,payment_reference',
            ],
            'receipt' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
