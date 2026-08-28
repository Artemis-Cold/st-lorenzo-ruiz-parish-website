<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'staff';
    }

    public function rules(): array
    {
        $amountRules = ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:999999.99'];

        return [
            'packages' => ['required', 'array'],
            'packages.*.id' => ['required', 'integer', 'distinct', 'exists:service_packages,id'],
            'packages.*.basePrice' => $amountRules,
            'inclusions' => ['required', 'array'],
            'inclusions.*.id' => ['required', 'integer', 'distinct', 'exists:package_inclusions,id'],
            'inclusions.*.price' => $amountRules,
            'addons' => ['required', 'array'],
            'addons.*.id' => ['required', 'integer', 'distinct', 'exists:package_addons,id'],
            'addons.*.price' => $amountRules,
            'fees' => ['required', 'array'],
            'fees.*.id' => ['required', 'integer', 'distinct', 'exists:service_fees,id'],
            'fees.*.amount' => $amountRules,
        ];
    }

    public function attributes(): array
    {
        return [
            'packages.*.basePrice' => 'package price',
            'inclusions.*.price' => 'inclusion price',
            'addons.*.price' => 'add-on price',
            'fees.*.amount' => 'service fee',
        ];
    }
}
