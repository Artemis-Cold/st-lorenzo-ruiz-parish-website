<?php

namespace App\Http\Requests\Wedding;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreWeddingBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'booking_slot_id' => ['required', 'integer', 'exists:booking_slots,id'],
            'service_package_id' => ['required', 'integer', 'exists:service_packages,id'],
            'selected_addon_ids' => ['nullable', 'array'],
            'selected_addon_ids.*' => ['integer', 'distinct', 'exists:package_addons,id'],
            'remarks' => ['nullable', 'string'],
            'applicant' => ['required', 'array:groom,bride'],
            'applicant.groom' => ['required', 'array'],
            'applicant.bride' => ['required', 'array'],
            'documents' => ['required', 'array'],
            'documents.*.document_type' => [
                'required',
                'distinct',
                'in:marriage_license,cenomar,baptismal_certificate,confirmation_certificate,couple_photo,sponsor_marriage_contract,sponsor_confirmation_certificate',
            ],
            'documents.*.file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048',
            ],
        ];

        foreach (['groom', 'bride'] as $role) {
            $prefix = "applicant.$role";
            $rules["$prefix.first_name"] = ['required', 'string', 'max:100'];
            $rules["$prefix.middle_initial"] = ['nullable', 'string', 'max:1'];
            $rules["$prefix.last_name"] = ['required', 'string', 'max:100'];
            $rules["$prefix.address"] = ['required', 'string'];
            $rules["$prefix.age"] = ['required', 'integer', 'min:0', 'max:150'];
            $rules["$prefix.contact_number"] = ['required', 'string', 'regex:/^09\d{9}$/'];
            $rules["$prefix.church"] = ['required', 'array'];
            $rules["$prefix.church.baptized_in"] = ['required', 'string', 'max:255'];
            $rules["$prefix.church.confirmed_in"] = ['required', 'string', 'max:255'];

            foreach (['father', 'mother'] as $parent) {
                $rules["$prefix.$parent"] = ['required', 'array'];
                $rules["$prefix.$parent.first_name"] = ['required', 'string', 'max:100'];
                $rules["$prefix.$parent.middle_initial"] = ['nullable', 'string', 'max:1'];
                $rules["$prefix.$parent.last_name"] = ['required', 'string', 'max:100'];
            }

            $rules["$prefix.previous_church_marriage"] = ['required', 'array'];
            $rules["$prefix.previous_church_marriage.church_name"] = ['required', 'string', 'max:255'];
            $rules["$prefix.previous_church_marriage.priest"] = ['required', 'string', 'max:255'];
            $rules["$prefix.previous_church_marriage.church_address"] = ['required', 'string'];
        }

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $types = collect($this->input('documents', []))
                ->pluck('document_type');

            $required = [
                'marriage_license' => 'Marriage License',
                'cenomar' => 'Certificate of No Marriage (CENOMAR)',
                'baptismal_certificate' => 'Baptismal Certificate',
                'confirmation_certificate' => 'Confirmation Certificate',
                'couple_photo' => 'Couple Photo',
            ];

            foreach ($required as $type => $label) {
                if (! $types->contains($type)) {
                    $validator->errors()->add(
                        "documents.$type",
                        "$label is required."
                    );
                }
            }

            if (
                ! $types->contains('sponsor_marriage_contract')
                && ! $types->contains('sponsor_confirmation_certificate')
            ) {
                $validator->errors()->add(
                    'documents.sponsor',
                    'Upload either the sponsors\' Marriage Contract or Confirmation Certificate.'
                );
            }
        });
    }
}
