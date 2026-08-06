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
                'id' => 1,
                'code' => 'baptism',
                'name' => 'Baptism',
            ],

            [
                'id' => 2,
                'code' => 'wedding',
                'name' => 'Wedding',
            ],

            [
                'id' => 3,
                'code' => 'funeral',
                'name' => 'Funeral',
            ],

            [
                'id' => 4,
                'code' => 'mass-intention',
                'name' => 'Mass Intention',
            ],

            [
                'id' => 5,
                'code' => 'document-request',
                'name' => 'Document Request',
            ],

        ]);
    }
}