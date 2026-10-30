<?php

namespace App\Http\Requests\Wedding;

use App\Http\Requests\Baptism\StoreBaptismBookingRequest;
use App\Http\Requests\Concerns\HasReadableBookingAttributes;
use App\Http\Requests\FormationSacrament\StoreFormationSacramentBookingRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreWeddingBookingRequest extends FormRequest
{
    use HasReadableBookingAttributes;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'schedule_request_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'booking_slot_id' => ['required', 'integer', 'exists:booking_slots,id'],
            'service_package_id' => ['required', 'integer', 'exists:service_packages,id'],
            'selected_addon_ids' => ['nullable', 'array'],
            'selected_addon_ids.*' => ['integer', 'distinct', 'exists:package_addons,id'],
            'remarks' => ['nullable', 'string'],
            'applicant' => ['required', 'array:groom,bride'],
            'applicant.groom' => ['required', 'array'],
            'applicant.bride' => ['required', 'array'],
            'documents' => ['nullable', 'array'],
            'documents.*.document_type' => [
                'required_with:documents',
                'distinct',
                'in:marriage_license,cenomar,baptismal_certificate,confirmation_certificate,bride_baptismal_certificate,groom_baptismal_certificate,bride_confirmation_certificate,groom_confirmation_certificate,couple_photo_1,couple_photo_2,couple_photo_3',
            ],
            'sponsors' => ['required', 'array', 'min:2', 'max:40'],
            'sponsors.*.role' => ['required', 'in:godfather,godmother'],
            'sponsors.*.first_name' => ['required', 'string', 'max:100'],
            'sponsors.*.middle_initial' => ['nullable', 'string', 'max:1'],
            'sponsors.*.last_name' => ['required', 'string', 'max:100'],
            'sponsors.*.suffix' => ['nullable', 'string', 'max:20'],
            'sponsors.*.residence' => ['required', 'string'],
            'sponsors.*.requirement_type' => [
                'required',
                'in:marriage_contract,confirmation_certificate',
            ],
            'sponsors.*.requirement_file' => [
                'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120',
            ],
        ];

        foreach ((array) $this->input('documents', []) as $index => $document) {
            $isPhoto = in_array($document['document_type'] ?? null, [
                'couple_photo_1', 'couple_photo_2', 'couple_photo_3',
            ], true);

            $rules["documents.{$index}.file"] = [
                'required',
                'file',
                $isPhoto ? 'mimes:jpg,jpeg,png' : 'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ];
        }

        foreach (['groom', 'bride'] as $role) {
            $prefix = "applicant.$role";
            $rules["$prefix.first_name"] = ['required', 'string', 'max:100'];
            $rules["$prefix.middle_initial"] = ['nullable', 'string', 'max:1'];
            $rules["$prefix.last_name"] = ['required', 'string', 'max:100'];
            $rules["$prefix.suffix"] = ['nullable', 'string', 'max:20'];
            $rules["$prefix.address"] = ['required', 'string'];
            $rules["$prefix.age"] = ['required', 'integer', 'min:18', 'max:150'];
            $rules["$prefix.contact_number"] = ['required', 'string', 'regex:/^09\d{9}$/'];
            $rules["$prefix.church"] = ['required', 'array'];
            foreach (['baptism' => 'baptized_in', 'confirmation' => 'confirmed_in'] as $sacrament => $parishField) {
                $statusField = "$prefix.church.{$sacrament}_status";
                // Legacy clients/bookings have neither status; never infer a person's answer.
                $hasStatuses = $this->hasAny([
                    'applicant.bride.church.baptism_status', 'applicant.bride.church.confirmation_status',
                    'applicant.groom.church.baptism_status', 'applicant.groom.church.confirmation_status',
                ]);
                $rules[$statusField] = [$hasStatuses ? 'required' : 'sometimes', 'in:yes,no'];
                $rules["$prefix.church.$parishField"] = [
                    $this->input($statusField) === 'no' ? 'nullable' : 'required', 'string', 'max:255',
                ];
            }

            foreach (['father', 'mother'] as $parent) {
                $rules["$prefix.$parent"] = ['required', 'array'];
                $rules["$prefix.$parent.first_name"] = ['required', 'string', 'max:100'];
                $rules["$prefix.$parent.middle_initial"] = ['nullable', 'string', 'max:1'];
                $rules["$prefix.$parent.last_name"] = ['required', 'string', 'max:100'];
                $rules["$prefix.$parent.suffix"] = ['nullable', 'string', 'max:20'];
            }

            $rules["$prefix.previous_church_marriage"] = ['required', 'array'];
            $rules["$prefix.previous_church_marriage.church_name"] = ['required', 'string', 'max:255'];
            $rules["$prefix.previous_church_marriage.priest"] = ['required', 'string', 'max:255'];
            $rules["$prefix.previous_church_marriage.church_address"] = ['required', 'string'];

            foreach (['baptism', 'confirmation'] as $code) {
                $base = "$prefix.preparations.$code";
                if ($this->input("$prefix.church.{$code}_status") !== 'no') {
                    $rules[$base] = ['exclude'];

                    continue;
                }
                $rules[$base] = ['required', 'array'];
                // Reuse the standalone sacrament's field and upload validation.
                if ($code === 'baptism') {
                    $source = (new StoreBaptismBookingRequest)->rules();
                } else {
                    $request = new StoreFormationSacramentBookingRequest;
                    $request->merge(['service_code' => 'confirmation']);
                    $source = $request->rules();
                }
                foreach ($source as $key => $constraints) {
                    if (in_array($key, ['schedule_request_id', 'service_code', 'booking_slot_id', 'service_package_id', 'remarks'], true)) {
                        continue;
                    }
                    $key = str_replace(['baptizand', 'god_parents', 'sponsors.*.address'], ['candidate', 'sponsors', 'sponsors.*.residence'], $key);
                    $rules["$base.$key"] = array_map(fn ($rule) => is_string($rule) ? str_replace('after_or_equal:candidate.birth_date', "after_or_equal:$base.candidate.birth_date", $rule) : $rule, $constraints);
                }
                // Both sacraments may be requested together: baptism evidence follows after baptism.
                if ($code === 'confirmation' && $this->input("$prefix.church.baptism_status") === 'no') {
                    $rules["$base.candidate.baptism_date"] = ['nullable', 'date', 'before_or_equal:today'];
                    $rules["$base.candidate.baptism_church"] = ['nullable', 'string', 'max:255'];
                    $rules["$base.documents"] = ['nullable', 'array', 'max:1'];
                    $rules["$base.documents.*.document_type"] = ['required_with:'.$base.'.documents', 'in:baptismal_certificate'];
                }
                $rules["$base.documents"] = ['prohibited'];
                $rules["$base.sponsors.*.requirement_file"] = ['prohibited'];
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'applicant.groom.age.min' => 'The groom must be at least 18 years old to marry.',
            'applicant.bride.age.min' => 'The bride must be at least 18 years old to marry.',
        ];
    }
}
