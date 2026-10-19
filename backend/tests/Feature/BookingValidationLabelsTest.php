<?php

namespace Tests\Feature;

use App\Http\Requests\Baptism\StoreBaptismBookingRequest;
use App\Http\Requests\DocumentRequest\StoreDocumentRequestBookingRequest;
use App\Http\Requests\FormationSacrament\StoreFormationSacramentBookingRequest;
use App\Http\Requests\Funeral\StoreFuneralBookingRequest;
use App\Http\Requests\MassIntention\StoreMassIntentionBookingRequest;
use App\Http\Requests\Wedding\StoreWeddingBookingRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class BookingValidationLabelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_requests_use_readable_capitalized_field_names(): void
    {
        foreach ([new StoreBaptismBookingRequest, new StoreWeddingBookingRequest, new StoreFuneralBookingRequest, new StoreFormationSacramentBookingRequest, new StoreDocumentRequestBookingRequest, new StoreMassIntentionBookingRequest] as $request) {
            $attributes = $request->attributes();
            $this->assertNotEmpty($attributes);
            foreach ($attributes as $label) {
                $this->assertMatchesRegularExpression('/^[A-Z]/', $label);
                $this->assertStringNotContainsString('_', $label);
                $this->assertStringNotContainsString('*', $label);
            }
        }
    }

    public function test_nested_wedding_preparation_errors_display_parish_origin(): void
    {
        $request = new StoreWeddingBookingRequest;
        $request->merge(['applicant' => ['bride' => ['church' => ['confirmation_status' => 'no']]]]);
        $key = 'applicant.bride.preparations.confirmation.candidate.parish_origin';
        $attributes = $request->attributes();
        $this->assertSame('Parish Origin', $attributes[$key]);
        $validator = Validator::make([], [$key => ['required']], [], $attributes);
        $this->assertSame('The Parish Origin field is required.', $validator->errors()->first($key));
    }
}
