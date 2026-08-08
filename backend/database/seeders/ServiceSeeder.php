<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        Service::insert([

            [
                'code' => 'baptism',
                'name' => 'Baptism',
                'description' => 'Sacrament of Baptism',
            ],

            [
                'code' => 'wedding',
                'name' => 'Wedding',
                'description' => 'Holy Matrimony',
            ],

            [
                'code' => 'funeral',
                'name' => 'Funeral',
                'description' => 'Funeral Mass',
            ],

            [
                'code' => 'mass-intention',
                'name' => 'Mass Intention',
                'description' => 'Mass Offering',
            ],

            [
                'code' => 'document-request',
                'name' => 'Document Request',
                'description' => 'Certificates and Parish Documents',
            ],

        ]);
    }
}
