<?php

namespace Tests\Feature;

use App\Http\Requests\MassIntention\StoreMassIntentionBookingRequest;
use App\Models\Event;
use App\Models\Service;
use App\Models\ServiceFee;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MassIntentionTypeValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_special_intention_is_rejected_and_petition_is_supported(): void
    {
        $event = Event::create([
            'created_by' => User::factory()->create(['role' => 'staff'])->id,
            'category' => 'mass',
            'title' => 'Daily Mass',
            'details' => 'Regular daily Mass.',
            'location' => 'Parish Church',
            'starts_at' => today()->addDay()->setTime(6, 0),
        ]);
        $request = new StoreMassIntentionBookingRequest;
        $payload = [
            'intention_date' => today()->addDay()->toDateString(),
            'mass_event_id' => $event->id,
            'groups' => [[
                'type' => 'Special Intention',
                'entries' => [['names' => ['Juan Dela Cruz']]],
            ]],
            'reference_number' => '2000000000001',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ];

        $validator = Validator::make($payload, $request->rules());

        $this->assertTrue($validator->errors()->has('groups.0.type'));

        $payload['groups'][0]['type'] = 'Petition';

        $this->assertTrue(Validator::make($payload, $request->rules())->passes());
    }

    public function test_new_mass_intention_is_pending_while_its_receipt_awaits_verification(): void
    {
        config()->set('services.sms.driver', 'database');
        Http::fake();
        Queue::fake();
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        $service = Service::create([
            'code' => 'mass-intention',
            'name' => 'Mass Intention',
            'description' => 'Mass Intention',
        ]);
        ServiceFee::create([
            'service_id' => $service->id,
            'code' => 'intention_line',
            'name' => 'Mass Intention Line',
            'amount' => 100,
        ]);
        $sunday = today()->next(CarbonInterface::SUNDAY);
        $massEvent = Event::create([
            'created_by' => User::factory()->create(['role' => 'staff'])->id,
            'category' => 'mass',
            'title' => 'Sunday Mass',
            'details' => 'Regular Sunday Mass.',
            'location' => 'Parish Church',
            'starts_at' => $sunday->copy()->setTime(16, 30),
        ]);

        $response = $this->post('/api/bookings/mass-intention', [
            'intention_date' => $sunday->toDateString(),
            'mass_event_id' => $massEvent->id,
            'groups' => [[
                'type' => 'Thanksgiving',
                'entries' => [['names' => ['Juan Dela Cruz']]],
            ]],
            'reference_number' => '2000000000002',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json']);

        $response->assertCreated()->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('bookings', ['status' => 'pending']);
        $this->assertDatabaseHas('mass_intentions', [
            'mass_event_id' => $massEvent->id,
            'mass_schedule_title' => 'Sunday Mass',
            'mass_starts_at' => $sunday->copy()->setTime(16, 30),
            'mass_location' => 'Parish Church',
        ]);
        $this->assertDatabaseHas('booking_documents', [
            'document_type' => 'payment_receipt',
            'status' => 'pending',
        ]);
        $this->assertDatabaseCount('sms_messages', 0);
        Http::assertNothingSent();
        Queue::assertNothingPushed();
    }

    public function test_mass_intention_rejects_same_day_and_a_schedule_from_another_date(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $staff = User::factory()->create(['role' => 'staff']);
        $event = Event::create([
            'created_by' => $staff->id,
            'category' => 'mass',
            'title' => 'Daily Mass',
            'details' => 'Regular daily Mass.',
            'starts_at' => today()->addDays(2)->setTime(6, 0),
        ]);

        $payload = [
            'intention_date' => today()->toDateString(),
            'mass_event_id' => $event->id,
            'groups' => [[
                'type' => 'Thanksgiving',
                'entries' => [['names' => ['Juan Dela Cruz']]],
            ]],
            'reference_number' => '2000000000003',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ];

        $this->post('/api/bookings/mass-intention', $payload, ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['intention_date']);

        $payload['intention_date'] = today()->addDay()->toDateString();

        $this->post('/api/bookings/mass-intention', $payload, ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['mass_event_id']);
    }
}
