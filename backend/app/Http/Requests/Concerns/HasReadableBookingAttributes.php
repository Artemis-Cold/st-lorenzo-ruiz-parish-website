<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Support\Str;

trait HasReadableBookingAttributes
{
    public function attributes(): array
    {
        $labels = [
            'booking_slot_id' => 'Schedule',
            'schedule_request_id' => 'Schedule Request',
            'service_package_id' => 'Service Package',
            'middle_initial' => 'Middle Initial',
            'parish_origin' => 'Parish Origin',
            'requirement_type' => 'Certificate Type',
            'requirement_file' => 'Certificate File',
            'reference_number' => 'GCash Reference Number',
            'baptized_in' => 'Baptism Parish',
            'confirmed_in' => 'Confirmation Parish',
        ];

        return collect(array_keys($this->rules()))->mapWithKeys(function ($key) use ($labels) {
            $parts = array_values(array_filter(explode('.', $key), fn ($part) => $part !== '*' && ! ctype_digit($part)));
            $field = end($parts);

            return [$key => $labels[$field] ?? Str::title(str_replace('_', ' ', $field))];
        })->all();
    }
}
