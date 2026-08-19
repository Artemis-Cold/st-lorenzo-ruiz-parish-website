<?php

namespace Database\Seeders;

use App\Models\BookingSlot;
use App\Models\Service;
use App\Services\BookingSlotScheduleService;
use Illuminate\Database\Seeder;

class FuneralBookingSlotSeeder extends Seeder
{
    public function run(): void
    {
        $service = Service::firstWhere('code', 'funeral');

        if (! $service) {
            $this->command?->warn('Funeral service was not found. Run ServiceSeeder first.');

            return;
        }

        $schedule = app(BookingSlotScheduleService::class);
        $date = today();
        $endDate = today()->addYear();

        while ($date->lte($endDate)) {
            foreach ($schedule->startTimesFor($date) as $startTime) {
                BookingSlot::updateOrCreate([
                    'service_id' => $service->id,
                    'booking_date' => $date->toDateString(),
                    'start_time' => $startTime,
                ], [
                    'end_time' => $schedule->endTimeFor($startTime),
                    'capacity' => 1,
                    'is_active' => true,
                ]);
            }

            $date->addDay();
        }
    }
}
