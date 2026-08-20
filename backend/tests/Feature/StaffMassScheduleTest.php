<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffMassScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_generate_the_fixed_monthly_mass_schedule_without_duplicates(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
        $month = CarbonImmutable::instance(today()->addMonth()->startOfMonth());
        $sundays = collect(range(1, $month->daysInMonth))
            ->filter(fn (int $day) => $month->setDay($day)->isSunday())
            ->count();
        $expected = $month->daysInMonth + ($sundays * 2);

        $this->postJson('/api/staff/events/mass-schedule', [
            'month' => $month->format('Y-m'),
            'location' => 'Main Parish Church',
        ])->assertCreated()
            ->assertJsonPath('created', $expected)
            ->assertJsonPath('skipped', 0);

        $this->assertSame($expected, Event::count());

        $sunday = CarbonImmutable::instance($month)->next(CarbonImmutable::SUNDAY);
        $this->assertSame(
            ['06:00', '09:00', '16:30'],
            Event::query()->orderBy('starts_at')->get()
                ->filter(fn (Event $event) => $event->starts_at->toDateString() === $sunday->toDateString())
                ->map(fn (Event $event) => $event->starts_at->format('H:i'))
                ->values()
                ->all(),
        );

        $weekday = CarbonImmutable::instance($month)->next(CarbonImmutable::MONDAY);
        $this->assertSame(
            ['06:00'],
            Event::all()
                ->filter(fn (Event $event) => $event->starts_at->toDateString() === $weekday->toDateString())
                ->map(fn (Event $event) => $event->starts_at->format('H:i'))
                ->values()
                ->all(),
        );

        $this->postJson('/api/staff/events/mass-schedule', [
            'month' => $month->format('Y-m'),
            'location' => 'Main Parish Church',
        ])->assertOk()
            ->assertJsonPath('created', 0)
            ->assertJsonPath('skipped', $expected);

        $this->assertSame($expected, Event::count());
    }

    public function test_parishioners_cannot_generate_mass_schedules(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'parishioner']));

        $this->postJson('/api/staff/events/mass-schedule', [
            'month' => today()->format('Y-m'),
        ])->assertForbidden();
    }
}
