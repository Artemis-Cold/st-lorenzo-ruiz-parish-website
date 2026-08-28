<?php

namespace App\Http\Requests\DocumentRequest;

use Illuminate\Foundation\Http\FormRequest;
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
            'reference_number' => [
                'required',
                'digits:13',
                'unique:bookings,payment_reference',
                'unique:mass_intentions,payment_reference',
                'unique:document_request_bookings,payment_reference',
            ],
            'receipt' => [
                'required',
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
                    $rules["$prefix.baptism_date"] = [
                        'required',
                        'date',
                        'before_or_equal:today',
                    ];
                    break;
                case 'Confirmation Certificate':
                    $rules["$prefix.name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    $rules["$prefix.confirmation_date"] = [
                        'required',
                        'date',
                        'before_or_equal:today',
                    ];
                    break;
                case 'Death Certificate':
                    $rules["$prefix.name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    break;
                case 'Marriage Certificate':
                    $rules["$prefix.bride_name"] = $common;
                    $rules["$prefix.groom_name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
                    $rules["$prefix.marriage_date"] = [
                        'required',
                        'date',
                        'before_or_equal:today',
                    ];
                    break;
                case 'Request of Permission':
                    $rules["$prefix.full_name"] = $common;
                    $rules["$prefix.address"] = ['required', 'string'];
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

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $counts = collect($this->input('requests', []))
                ->countBy('document_type');

            foreach ($counts as $type => $count) {
                if ($count > 10) {
                    $validator->errors()->add(
                        'requests',
                        "You may request up to 10 copies of {$type} at a time."
                    );
                }
            }
        }];
    }
}
