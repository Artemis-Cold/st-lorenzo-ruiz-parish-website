<?php

namespace Database\Seeders;

use App\Models\BookingSlot;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BookingSlotSeeder extends Seeder
{
    public function run(): void
    {
        $this->generateWeddingSlots();

        // Future
        $this->generateBaptismSlots();
        // $this->generateFuneralSlots();
        // $this->generateMassSlots();
        // $this->generateDocumentSlots();
    }

    private function generateWeddingSlots(): void
    {
        $service = Service::firstWhere('code', 'wedding');

        if (! $service) {
            return;
        }

        $timeSlots = [

            ['07:00', '09:00'],
            ['09:00', '11:00'],
            ['11:00', '13:00'],
            ['13:00', '15:00'],
            ['15:00', '17:00'],

        ];

        $start = Carbon::today();

        $end = Carbon::today()->addYear();

        while ($start->lte($end)) {

            /*
            |--------------------------------------------------------------------------
            | Monday - Saturday only
            |--------------------------------------------------------------------------
            */

            if (! $start->isSunday()) {

                foreach ($timeSlots as [$from, $to]) {

                    BookingSlot::create([

                        'service_id' => $service->id,

                        'booking_date' => $start->toDateString(),

                        'start_time' => $from,

                        'end_time' => $to,

                        'capacity' => 1,

                        'is_active' => true,

                    ]);

                }
            }

            $start->addDay();
        }
    }

    private function generateBaptismSlots(): void
    {
        $service = Service::firstWhere('code', 'baptism');

        if (! $service) {
            return;
        }

        $timeSlots = [

            ['09:00', '11:00'],

            ['14:00', '16:00'],

        ];

        $start = Carbon::today();

        $end = Carbon::today()->addYear();

        while ($start->lte($end)) {


            if ($start->isSaturday()) {

                foreach ($timeSlots as [$from, $to]) {

                    BookingSlot::create([

                        'service_id' => $service->id,

                        'booking_date' => $start->toDateString(),

                        'start_time' => $from,

                        'end_time' => $to,

                        'capacity' => 1,

                        'is_active' => true,

                    ]);

                }

            }

            $start->addDay();
        }
    }
}
