<?php

namespace Tests\Feature;

use App\Models\DocumentRequestItem;
use App\Models\Service;
use App\Models\ServiceFee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentRequestMultipleCopiesTest extends TestCase
{
    use RefreshDatabase;

    public function test_parishioner_can_request_multiple_documents_of_the_same_type(): void
    {
        Storage::fake('public');
        Sanctum::actingAs(User::factory()->create());
        $service = Service::create([
            'code' => 'document-request',
            'name' => 'Document Request',
            'description' => 'Parish documents',
        ]);
        ServiceFee::create([
            'service_id' => $service->id,
            'code' => 'baptismal_certificate',
            'name' => 'Baptismal Certificate',
            'amount' => 120,
        ]);
        ServiceFee::create([
            'service_id' => $service->id,
            'code' => 'death_certificate',
            'name' => 'Death Certificate',
            'amount' => 80,
        ]);

        $response = $this->post('/api/bookings/document-request', [
            'requests' => [
                [
                    'document_type' => 'Baptismal Certificate',
                    'details' => [
                        'name' => 'Juan Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                        'baptism_date' => today()->subYears(10)->toDateString(),
                        'relationship_to_owner' => 'Parent',
                    ],
                ],
                [
                    'document_type' => 'Baptismal Certificate',
                    'details' => [
                        'name' => 'Juan Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                        'baptism_date' => today()->subYears(10)->toDateString(),
                        'relationship_to_owner' => 'Parent',
                    ],
                ],
                [
                    'document_type' => 'Death Certificate',
                    'details' => [
                        'name' => 'Pedro Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                        'relationship_to_owner' => 'Child',
                    ],
                ],
            ],
            'reference_number' => '3000000000001',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json']);

        $response->assertCreated();

        $this->assertDatabaseCount('document_request_items', 3);
        $this->assertDatabaseHas('document_request_bookings', [
            'total_amount' => 320,
        ]);
        $this->assertSame(
            2,
            DocumentRequestItem::query()
                ->where('document_type', 'Baptismal Certificate')
                ->count(),
        );
    }

    public function test_a_single_document_type_is_limited_to_ten_requests_per_submission(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $requests = collect(range(1, 11))->map(fn (int $number) => [
            'document_type' => 'Death Certificate',
            'details' => [
                'name' => "Parishioner {$number}",
                'address' => 'Dagatan, Taysan, Batangas',
                'relationship_to_owner' => 'Child',
            ],
        ])->all();

        $this->post('/api/bookings/document-request', [
            'requests' => $requests,
            'reference_number' => '3000000000002',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('requests');
    }

    public function test_multiple_copies_of_one_type_must_use_the_same_record_details(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $service = Service::create([
            'code' => 'document-request',
            'name' => 'Document Request',
            'description' => 'Parish documents',
        ]);
        ServiceFee::create([
            'service_id' => $service->id,
            'code' => 'baptismal_certificate',
            'name' => 'Baptismal Certificate',
            'amount' => 120,
        ]);

        $this->post('/api/bookings/document-request', [
            'requests' => [
                [
                    'document_type' => 'Baptismal Certificate',
                    'details' => [
                        'name' => 'Juan Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                        'baptism_date' => today()->subYears(10)->toDateString(),
                        'relationship_to_owner' => 'Parent',
                    ],
                ],
                [
                    'document_type' => 'Baptismal Certificate',
                    'details' => [
                        'name' => 'Maria Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                        'baptism_date' => today()->subYears(8)->toDateString(),
                        'relationship_to_owner' => 'Parent',
                    ],
                ],
            ],
            'reference_number' => '3000000000003',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('requests');
    }

    public function test_account_owned_document_fields_are_taken_from_the_authenticated_user(): void
    {
        Storage::fake('public');
        $parishioner = User::factory()->create([
            'first_name' => 'Juan',
            'middle_initial' => 'Q',
            'last_name' => 'Dela Cruz',
            'house_no' => '12',
            'street' => 'Mabini Street',
            'barangay' => 'Dagatan',
            'municipality' => 'Taysan',
            'province' => 'Batangas',
            'zip_code' => '4228',
        ]);
        Sanctum::actingAs($parishioner);
        $service = Service::create([
            'code' => 'document-request',
            'name' => 'Document Request',
            'description' => 'Parish documents',
        ]);
        foreach ([
            ['permission', 'Request of Permission', 100],
            ['marriage_certificate', 'Marriage Certificate', 150],
        ] as [$code, $name, $amount]) {
            ServiceFee::create([
                'service_id' => $service->id,
                'code' => $code,
                'name' => $name,
                'amount' => $amount,
            ]);
        }

        $this->post('/api/bookings/document-request', [
            'requests' => [
                [
                    'document_type' => 'Request of Permission',
                    'details' => [
                        'full_name' => 'Another Person',
                        'address' => 'Another Address',
                    ],
                ],
                [
                    'document_type' => 'Marriage Certificate',
                    'details' => [
                        'requester_role' => 'Groom',
                        'bride_name' => 'Maria Santos',
                        'groom_name' => 'Another Person',
                        'address' => 'Another Address',
                        'marriage_date' => today()->subYear()->toDateString(),
                    ],
                ],
            ],
            'reference_number' => '3000000000004',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $items = DocumentRequestItem::query()->get()->keyBy('document_type');
        $expectedAddress = '12, Mabini Street, Dagatan, Taysan, Batangas, 4228';

        $this->assertSame(
            'Juan Q. Dela Cruz',
            $items['Request of Permission']->details['full_name'],
        );
        $this->assertSame(
            $expectedAddress,
            $items['Request of Permission']->details['address'],
        );
        $this->assertSame(
            'Juan Q. Dela Cruz',
            $items['Marriage Certificate']->details['groom_name'],
        );
        $this->assertSame(
            'Maria Santos',
            $items['Marriage Certificate']->details['bride_name'],
        );
        $this->assertSame(
            $expectedAddress,
            $items['Marriage Certificate']->details['address'],
        );
    }
}
