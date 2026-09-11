<?php

namespace App\Http\Requests\DocumentRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator;

class StoreDocumentRequestBookingRequest extends FormRequest
{
    private const TYPES = [
        'Baptismal Certificate',
        'Confirmation Certificate',
        'Death Certificate',
        'Marriage Certificate',
        'Request of Permission',
    ];

    private const OWNER_RELATIONSHIPS = [
        'Self',
        'Parent',
        'Child',
        'Spouse',
        'Sibling',
        'Legal Guardian',
        'Other Relative',
    ];

    private const DEATH_RECORD_RELATIONSHIPS = [
        'Parent',
        'Child',
        'Spouse',
        'Sibling',
        'Legal Guardian',
        'Other Relative',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'requests' => ['required', 'array', 'min:1', 'max:50'],
            'requests.*.document_type' => [
                'required',
                'in:'.implode(',', self::TYPES),
            ],
            'requests.*.details' => ['required', 'array'],
            'payment_method' => ['sometimes', 'in:gcash,cash'],
            'reference_number' => [
                'required_if:payment_method,gcash',
                'nullable',
                'digits:13',
                'unique:payments,reference_number',
                'unique:bookings,payment_reference',
                'unique:mass_intentions,payment_reference',
                'unique:document_request_bookings,payment_reference',
            ],
            'receipt' => [
                'required_if:payment_method,gcash',
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
            'remarks' => ['nullable', 'string'],
        ];

        foreach ($this->input('requests', []) as $index => $request) {
            $prefix = "requests.$index.details";
            $common = ['required', 'string', 'max:255'];

            switch ($request['document_type'] ?? null) {
                case 'Baptismal Certificate':
                    $rules["$prefix.name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    $rules["$prefix.relationship_to_owner"] = [
                        'required',
                        'in:'.implode(',', self::OWNER_RELATIONSHIPS),
                    ];
                    $rules["$prefix.baptism_date"] = [
                        'required',
                        'date',
                        'before_or_equal:today',
                    ];
                    break;
                case 'Confirmation Certificate':
                    $rules["$prefix.name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    $rules["$prefix.relationship_to_owner"] = [
                        'required',
                        'in:'.implode(',', self::OWNER_RELATIONSHIPS),
                    ];
                    $rules["$prefix.confirmation_date"] = [
                        'required',
                        'date',
                        'before_or_equal:today',
                    ];
                    break;
                case 'Death Certificate':
                    $rules["$prefix.name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    $rules["$prefix.relationship_to_owner"] = [
                        'required',
                        'in:'.implode(',', self::DEATH_RECORD_RELATIONSHIPS),
                    ];
                    break;
                case 'Marriage Certificate':
                    $rules["$prefix.bride_name"] = $common;
                    $rules["$prefix.groom_name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    $rules["$prefix.requester_role"] = [
                        'required',
                        'in:Bride,Groom',
                    ];
                    $rules["$prefix.marriage_date"] = [
                        'required',
                        'date',
                        'before_or_equal:today',
                    ];
                    break;
                case 'Request of Permission':
                    $rules["$prefix.full_name"] = ['nullable', 'string', 'max:255'];
                    $rules["$prefix.address"] = ['nullable', 'string'];
                    break;
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'reference_number.digits' => 'Enter the 13-digit GCash transaction reference number.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'payment_method' => $this->input('payment_method', 'gcash'),
        ]);
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $requests = collect($this->input('requests', []));
            $counts = $requests->countBy('document_type');

            foreach ($counts as $type => $count) {
                if ($count > 10) {
                    $validator->errors()->add(
                        'requests',
                        "You may request up to 10 copies of {$type} at a time."
                    );
                }
            }

            foreach ($requests->groupBy('document_type') as $type => $copies) {
                $distinctDetails = $copies
                    ->map(fn (array $copy) => json_encode(
                        Arr::sortRecursive($copy['details'] ?? [])
                    ))
                    ->unique();

                if ($distinctDetails->count() > 1) {
                    $validator->errors()->add(
                        'requests',
                        "All copies of {$type} must use the same record details."
                    );
                }
            }
        }];
    }
}
