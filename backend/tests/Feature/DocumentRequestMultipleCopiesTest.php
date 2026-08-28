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
                    ],
                ],
                [
                    'document_type' => 'Baptismal Certificate',
                    'details' => [
                        'name' => 'Maria Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                        'baptism_date' => today()->subYears(8)->toDateString(),
                    ],
                ],
                [
                    'document_type' => 'Death Certificate',
                    'details' => [
                        'name' => 'Pedro Dela Cruz',
                        'address' => 'Dagatan, Taysan, Batangas',
                    ],
                ],
            ],
            'reference_number' => 'GCASH-MULTIPLE-DOCUMENTS',
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
            ],
        ])->all();

        $this->post('/api/bookings/document-request', [
            'requests' => $requests,
            'reference_number' => 'GCASH-TOO-MANY-DOCUMENTS',
            'receipt' => UploadedFile::fake()->image('receipt.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('requests');
    }
}
