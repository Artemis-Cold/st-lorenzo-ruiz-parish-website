<?php

namespace App\Http\Requests\MassIntention;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreMassIntentionBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'intention_date' => ['required', 'date', 'after:today'],
            'mass_event_id' => [
                'required',
                'integer',
                Rule::exists('events', 'id')->where('category', 'mass'),
            ],
            'groups' => ['required', 'array', 'min:1'],
            'groups.*.type' => [
                'required',
                'distinct',
                'in:Thanksgiving,Birthday,Anniversary,Petition,Soul',
            ],
            'groups.*.entries' => ['required', 'array', 'min:1'],
            'groups.*.entries.*.names' => ['required', 'array', 'min:1', 'max:3'],
            'groups.*.entries.*.names.*' => ['required', 'string', 'max:150'],
            'payment_method' => ['sometimes', 'in:gcash'],
            'reference_number' => [
                'required',
                'digits:13',
                'unique:payments,reference_number',
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
            if ($validator->errors()->hasAny(['intention_date', 'mass_event_id'])) {
                return;
            }

            $event = Event::query()->find($this->integer('mass_event_id'));

            if (! $event || $event->starts_at->toDateString() !== $this->input('intention_date')) {
                $validator->errors()->add(
                    'mass_event_id',
                    'Select a Mass schedule that belongs to the chosen intention date.'
                );
            }
        }];
    }
}
