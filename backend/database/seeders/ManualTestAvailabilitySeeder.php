<?php

namespace Database\Seeders;

use App\Models\BookingSlot;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ManualTestAvailabilitySeeder extends Seeder
{
    public function run(): void
    {
        $configurations = [
            'baptism' => ['09:00', '10:30', 3],
            'wedding' => ['11:00', '13:00', 1],
            'funeral' => ['14:00', '15:30', 2],
        ];

        foreach ($configurations as $code => [$start, $end, $capacity]) {
            $service = Service::firstWhere('code', $code);
            if (! $service) {
                $this->command?->warn("Service [{$code}] was not found; its test availability was skipped.");
                continue;
            }

            foreach (range(1, 21) as $offset) {
                $date = today()->addDays($offset);
                if ($date->isSunday()) continue;

                BookingSlot::updateOrCreate([
                    'service_id' => $service->id,
                    'booking_date' => $date->toDateString(),
                    'start_time' => $start,
                ], [
                    'end_time' => $end,
                    'capacity' => $capacity,
                    'is_active' => true,
                ]);
            }
        }
    }
}
