<?php

namespace Tests\Feature;

use App\Http\Requests\MassIntention\StoreMassIntentionBookingRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MassIntentionTypeValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_special_intention_is_rejected_and_petition_is_supported(): void
    {
        $request = new StoreMassIntentionBookingRequest;
        $payload = [
            'intention_date' => today()->toDateString(),
            'groups' => [[
                'type' => 'Special Intention',
                'entries' => [['names' => ['Juan Dela Cruz']]],
            ]],
            'reference_number' => 'GCASH-TEST-001',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ];

        $validator = Validator::make($payload, $request->rules());

        $this->assertTrue($validator->errors()->has('groups.0.type'));

        $payload['groups'][0]['type'] = 'Petition';

        $this->assertTrue(Validator::make($payload, $request->rules())->passes());
    }

    public function test_new_mass_intention_is_paid_while_its_receipt_awaits_verification(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        Service::create([
            'code' => 'mass-intention',
            'name' => 'Mass Intention',
            'description' => 'Mass Intention',
        ]);

        $response = $this->post('/api/bookings/mass-intention', [
            'intention_date' => today()->addDay()->toDateString(),
            'groups' => [[
                'type' => 'Thanksgiving',
                'entries' => [['names' => ['Juan Dela Cruz']]],
            ]],
            'reference_number' => 'GCASH-PAID-001',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json']);

        $response->assertCreated()->assertJsonPath('data.status', 'paid');

        $this->assertDatabaseHas('bookings', ['status' => 'paid']);
        $this->assertDatabaseHas('booking_documents', [
            'document_type' => 'payment_receipt',
            'status' => 'pending',
        ]);
    }
}
