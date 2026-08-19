<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class BookingSlotScheduleService
{
    /** @return array<int, string> */
    public function startTimesFor(string|CarbonInterface $date): array
    {
        $day = $date instanceof CarbonInterface
            ? CarbonImmutable::instance($date)
            : CarbonImmutable::parse($date);

        return config(
            $day->isSunday()
                ? 'booking-slots.start_times.sunday'
                : 'booking-slots.start_times.monday_to_saturday',
            [],
        );
    }

    public function endTimeFor(string $startTime): string
    {
        return CarbonImmutable::createFromFormat('H:i', $startTime)
            ->addMinutes((int) config('booking-slots.duration_minutes', 60))
            ->format('H:i');
    }

    public function capacityFor(string $serviceCode): ?int
    {
        return $serviceCode === 'baptism' ? null : 1;
    }
}
