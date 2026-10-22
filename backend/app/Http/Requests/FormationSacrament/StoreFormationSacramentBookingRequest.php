<?php

namespace App\Http\Requests\FormationSacrament;

use App\Http\Requests\Concerns\HasReadableBookingAttributes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFormationSacramentBookingRequest extends FormRequest
{
    use HasReadableBookingAttributes;

    protected function prepareForValidation(): void
    {
        $this->merge(['service_code' => $this->route('serviceCode')]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $confirmation = $this->input('service_code') === 'confirmation';

        return [
            'schedule_request_id' => $confirmation ? ['nullable', 'integer', 'exists:bookings,id'] : ['prohibited'],
            'service_code' => ['required', Rule::in(['confirmation'])],
            'booking_slot_id' => $confirmation ? ['required', 'integer', 'exists:booking_slots,id'] : ['prohibited'],
            'service_package_id' => $confirmation ? ['required', 'integer', 'exists:service_packages,id'] : ['prohibited'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'candidate' => ['required', 'array'],
            'candidate.first_name' => ['required', 'string', 'max:100'],
            'candidate.middle_initial' => ['nullable', 'string', 'max:1'],
            'candidate.last_name' => ['required', 'string', 'max:100'],
            'candidate.suffix' => ['nullable', 'string', 'max:20'],
            'candidate.parish_origin' => ['required', 'string', 'max:255'],
            'candidate.baptism_date' => [
                'required', 'date', 'after_or_equal:candidate.birth_date', 'before_or_equal:today',
            ],
            'candidate.baptism_church' => ['required', 'string', 'max:255'],
            'candidate.birth_date' => ['required', 'date', 'before_or_equal:today'],
            'candidate.birth_place' => ['required', 'string', 'max:255'],
            'candidate.gender' => ['required', Rule::in(['Male', 'Female'])],
            'candidate.address' => ['required', 'string', 'max:1000'],
            'candidate.contact_number' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'parents' => ['required', 'array', 'size:2'],
            'parents.*.relationship' => ['required', 'distinct', Rule::in(['father', 'mother'])],
            'parents.*.first_name' => ['required', 'string', 'max:100'],
            'parents.*.middle_initial' => ['nullable', 'string', 'max:1'],
            'parents.*.last_name' => ['required', 'string', 'max:100'],
            'parents.*.suffix' => ['nullable', 'string', 'max:20'],
            'parents.*.birth_place' => ['required', 'string', 'max:255'],
            'sponsors' => $confirmation
                ? ['required', 'array', 'min:1', 'max:20']
                : ['prohibited'],
            'sponsors.*.role' => ['required', Rule::in(['godfather', 'godmother'])],
            'sponsors.*.first_name' => ['required', 'string', 'max:100'],
            'sponsors.*.middle_initial' => ['nullable', 'string', 'max:1'],
            'sponsors.*.last_name' => ['required', 'string', 'max:100'],
            'sponsors.*.suffix' => ['nullable', 'string', 'max:20'],
            'sponsors.*.address' => ['required', 'string', 'max:1000'],
            'sponsors.*.requirement_type' => [
                'required', Rule::in(['marriage_contract', 'confirmation_certificate']),
            ],
            'sponsors.*.requirement_file' => [
                'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120',
            ],
            'documents' => $confirmation ? ['nullable', 'array', 'max:1'] : ['prohibited'],
            'documents.*.document_type' => ['required', 'distinct', Rule::in(['baptismal_certificate'])],
            'documents.*.file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
