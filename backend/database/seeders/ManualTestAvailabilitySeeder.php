<?php

namespace Database\Seeders;

use App\Models\BookingSlot;
use App\Models\Service;
use App\Services\BookingSlotScheduleService;
use Illuminate\Database\Seeder;

class ManualTestAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        $schedule = app(BookingSlotScheduleService::class);

        foreach (config('booking-slots.services', []) as $code) {
            $service = Service::firstWhere('code', $code);
            if (! $service) {
                $this->command?->warn("Service [{$code}] was not found; its test availability was skipped.");

                continue;
            }

            foreach (range(1, 21) as $offset) {
                $date = today()->addDays($offset);

                foreach ($schedule->startTimesFor($date) as $startTime) {
                    BookingSlot::updateOrCreate([
                        'service_id' => $service->id,
                        'booking_date' => $date->toDateString(),
                        'start_time' => $startTime,
                    ], [
                        'end_time' => $schedule->endTimeFor($startTime),
                        'capacity' => $schedule->capacityFor($code),
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
