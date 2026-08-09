<?php

namespace Database\Seeders;

use App\Models\BookingSlot;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FuneralBookingSlotSeeder extends Seeder
{
    public function run(): void
    {
        $service = Service::firstWhere('code', 'funeral');

        if (! $service) {
            $this->command?->warn(
                'Funeral service was not found. Run ServiceSeeder first.'
            );

            return;
        }

        $timeSlots = [
            ['08:00', '10:00'],
            ['10:00', '12:00'],
            ['13:00', '15:00'],
            ['15:00', '17:00'],
        ];

        $date = Carbon::today();
        $endDate = Carbon::today()->addYear();

        while ($date->lte($endDate)) {
            if (! $date->isSunday()) {
                foreach ($timeSlots as [$startTime, $endTime]) {
                    BookingSlot::updateOrCreate(
                        [
                            'service_id' => $service->id,
                            'booking_date' => $date->toDateString(),
                            'start_time' => $startTime,
                        ],
                        [
                            'end_time' => $endTime,
                            'capacity' => 1,
                            'is_active' => true,
                        ]
                    );
                }
            }

            $date->addDay();
        }
    }
}
