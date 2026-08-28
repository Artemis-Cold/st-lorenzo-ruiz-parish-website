<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceFee;
use Illuminate\Database\Seeder;

class ServiceFeeSeeder extends Seeder
{
    public function run(): void
    {
        $services = Service::query()->pluck('id', 'code');
        $fees = [
            ['service' => 'document-request', 'code' => 'baptismal_certificate', 'name' => 'Baptismal Certificate', 'amount' => 100, 'sort_order' => 1],
            ['service' => 'document-request', 'code' => 'confirmation_certificate', 'name' => 'Confirmation Certificate', 'amount' => 100, 'sort_order' => 2],
            ['service' => 'document-request', 'code' => 'death_certificate', 'name' => 'Death Certificate', 'amount' => 100, 'sort_order' => 3],
            ['service' => 'document-request', 'code' => 'marriage_certificate', 'name' => 'Marriage Certificate', 'amount' => 100, 'sort_order' => 4],
            ['service' => 'document-request', 'code' => 'request_of_permission', 'name' => 'Request of Permission', 'amount' => 100, 'sort_order' => 5],
            ['service' => 'mass-intention', 'code' => 'intention_line', 'name' => 'Mass Intention Line', 'amount' => 100, 'sort_order' => 1],
            ['service' => 'baptism', 'code' => 'additional_sponsor', 'name' => 'Additional Sponsor per Person', 'amount' => 100, 'sort_order' => 1],
        ];

        foreach ($fees as $fee) {
            ServiceFee::firstOrCreate([
                'service_id' => $services[$fee['service']],
                'code' => $fee['code'],
            ], [
                'name' => $fee['name'],
                'amount' => $fee['amount'],
                'is_active' => true,
                'sort_order' => $fee['sort_order'],
            ]);
        }
    }
}
