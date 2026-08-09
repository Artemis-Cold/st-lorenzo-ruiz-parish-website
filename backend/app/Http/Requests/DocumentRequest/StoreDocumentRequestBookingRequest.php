<?php

namespace App\Http\Requests\DocumentRequest;

use Illuminate\Foundation\Http\FormRequest;

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
            'requests' => ['required', 'array', 'min:1'],
            'requests.*.document_type' => [
                'required',
                'distinct',
                'in:'.implode(',', self::TYPES),
            ],
            'requests.*.details' => ['required', 'array'],
            'reference_number' => [
                'required',
                'string',
                'max:100',
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
}
