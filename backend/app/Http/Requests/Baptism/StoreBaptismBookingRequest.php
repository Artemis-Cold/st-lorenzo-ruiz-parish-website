<?php

namespace App\Http\Requests\Baptism;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBaptismBookingRequest extends FormRequest
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

            'booking_slot_id' => [
                'required',
                'exists:booking_slots,id',
            ],

            'service_package_id' => [
                'required',
                'exists:service_packages,id',
            ],

            'remarks' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Baptizand
            |--------------------------------------------------------------------------
            */

            'baptizand' => [
                'required',
                'array',
            ],

            'baptizand.first_name' => [
                'required',
                'string',
                'max:100',
            ],

            'baptizand.middle_initial' => [
                'nullable',
                'string',
                'max:1',
            ],

            'baptizand.last_name' => [
                'required',
                'string',
                'max:100',
            ],

            'baptizand.birth_date' => [
                'required',
                'date',
                'before_or_equal:today',
            ],

            'baptizand.birth_place' => [
                'required',
                'string',
            ],

            'baptizand.gender' => [
                'required',
                'in:Male,Female',
            ],

            'baptizand.address' => [
                'required',
                'string',
            ],

            'baptizand.contact_number' => [
                'required',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Parents
            |--------------------------------------------------------------------------
            */

            'parents' => [
                'required',
                'array',
                'size:2',
            ],

            'parents.*.relationship' => [
                'required',
                'in:father,mother',
            ],

            'parents.*.first_name' => [
                'required',
                'string',
            ],

            'parents.*.middle_initial' => [
                'nullable',
                'string',
                'max:1',
            ],

            'parents.*.last_name' => [
                'required',
                'string',
            ],

            'parents.*.birth_place' => [
                'required',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Godparents
            |--------------------------------------------------------------------------
            */

            'god_parents' => [
                'required',
                'array',
                'min:2',
                'max:40',
            ],

            'god_parents.*.role' => ['required', 'in:godfather,godmother'],
            'god_parents.*.first_name' => ['required', 'string', 'max:100'],
            'god_parents.*.middle_initial' => ['nullable', 'string', 'max:1'],
            'god_parents.*.last_name' => ['required', 'string', 'max:100'],
            'god_parents.*.residence' => ['required', 'string'],
            'god_parents.*.requirement_type' => [
                'required',
                'in:marriage_contract,confirmation_certificate',
            ],
            'god_parents.*.requirement_file' => [
                'nullable',
                'file',
                'mimes:pdf',
                'max:5120',
            ],

            /*
            |--------------------------------------------------------------------------
            | Documents
            |--------------------------------------------------------------------------
            */

            'documents' => [
                'nullable',
                'array',
            ],

            'documents.*.document_type' => [
                'required_with:documents',
                'string',
                'in:birth_certificate,baptism_permit,no_record_certificate',
            ],

            'documents.*.file' => [
                'required_with:documents',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],

        ];
    }
}
