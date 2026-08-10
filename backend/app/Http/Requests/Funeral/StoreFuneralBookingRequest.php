<?php

namespace App\Http\Requests\Funeral;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use Illuminate\Validation\Rule;

class StoreFuneralBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $name = [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_initial' => ['nullable', 'string', 'max:1'],
            'last_name' => ['required', 'string', 'max:100'],
        ];
        $rules = [
            'booking_slot_id' => ['required', 'integer', 'exists:booking_slots,id'],
            'service_package_id' => ['required', 'integer', 'exists:service_packages,id'],
            'selected_addon_ids' => ['nullable', 'array'],
            'selected_addon_ids.*' => ['integer', 'distinct', 'exists:package_addons,id'],
            'remarks' => ['nullable', 'string'],
            'deceased' => ['required', 'array'],
            'deceased.address' => ['required', 'string'],
            'deceased.death_cause' => ['required', 'string', 'max:255'],
            'deceased.age' => ['required', 'integer', 'min:0', 'max:150'],
            'deceased.birth_date' => ['required', 'date', 'before_or_equal:today'],
            'deceased.has_spouse' => ['required', 'boolean'],
            'deceased.children' => ['nullable', 'array'],
            'deceased.sacraments' => ['required', 'array'],
            'deceased.sacraments.*' => ['required', 'boolean'],
            'deceased.church_life.attends_mass' => ['required', 'in:regular,sometimes,never'],
            'deceased.church_life.confesses' => ['required', 'in:regular,sometimes,never'],
            'deceased.characteristics' => ['required', 'string'],
            'deceased.informant.relationship' => ['required', 'string', 'max:100'],
            'deceased.informant.contact_number' => ['required', 'regex:/^09\d{9}$/'],
            'deceased.informant.date_provided' => ['required', 'date'],
            'documents' => ['required', 'array'],
            'documents.*.document_type' => [
                'required',
                'distinct',
                'in:death_certificate,biography',
            ],
            'documents.*.file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:2048',
            ],
        ];

        foreach ($name as $field => $fieldRules) {
            $rules["deceased.$field"] = $fieldRules;
            $rules["deceased.informant.$field"] = $fieldRules;
            foreach (['father', 'mother'] as $relative) {
                $rules["deceased.$relative.$field"] = $fieldRules;
            }
            $rules["deceased.children.*.$field"] = $fieldRules;
        }

        $rules['deceased.spouse.first_name'] = ['nullable', Rule::requiredIf(fn () => $this->boolean('deceased.has_spouse')), 'string', 'max:100'];
        $rules['deceased.spouse.middle_initial'] = ['nullable', 'string', 'max:1'];
        $rules['deceased.spouse.last_name'] = ['nullable', Rule::requiredIf(fn () => $this->boolean('deceased.has_spouse')), 'string', 'max:100'];

        return $rules;
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $types = collect($this->input('documents', []))
                ->pluck('document_type');
            $hasDeathCertificate = $types->contains('death_certificate');

            if (! $hasDeathCertificate) {
                $validator->errors()->add(
                    'documents.death_certificate',
                    'Death Certificate is required.'
                );
            }

            if (! $types->contains('biography')) {
                $validator->errors()->add(
                    'documents.biography',
                    'Biography of the Deceased is required.'
                );
            }
        });
    }
}
