<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_create_update_list_and_delete_events(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));

        $created = $this->postJson('/api/staff/events', [
            'title' => 'Parish Feast Day',
            'details' => 'Community Mass and fellowship.',
            'location' => 'Parish Grounds',
            'startsAt' => '2026-09-10T08:00:00+08:00',
            'endsAt' => '2026-09-10T12:00:00+08:00',
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Parish Feast Day');

        $id = $created->json('data.id');

        $this->getJson('/api/staff/events')
            ->assertOk()
            ->assertJsonPath('data.0.location', 'Parish Grounds');

        $this->putJson("/api/staff/events/{$id}", [
            'title' => 'Updated Parish Feast Day',
            'details' => 'Updated community celebration.',
            'location' => 'Parish Church',
            'startsAt' => '2026-09-10T09:00:00+08:00',
            'endsAt' => '2026-09-10T13:00:00+08:00',
        ])->assertOk()
            ->assertJsonPath('data.title', 'Updated Parish Feast Day');

        $this->deleteJson("/api/staff/events/{$id}")->assertOk();
        $this->assertDatabaseMissing('events', ['id' => $id]);
    }

    public function test_public_event_feed_can_be_filtered_by_month(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Event::create([
            'created_by' => $staff->id,
            'title' => 'September Event',
            'details' => 'September details',
            'starts_at' => '2026-09-15 09:00:00',
            'ends_at' => '2026-09-15 11:00:00',
        ]);
        Event::create([
            'created_by' => $staff->id,
            'title' => 'October Event',
            'details' => 'October details',
            'starts_at' => '2026-10-15 09:00:00',
            'ends_at' => '2026-10-15 11:00:00',
        ]);

        $this->getJson('/api/events?month=2026-09')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'September Event');
    }

    public function test_staff_event_schedule_is_grouped_searchable_and_paginated(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff);

        foreach (range(1, 7) as $day) {
            Event::create([
                'created_by' => $staff->id,
                'category' => 'event',
                'title' => $day === 4 ? 'Parish Choir Practice' : "Community Activity {$day}",
                'details' => 'An upcoming parish event.',
                'location' => 'Parish Hall',
                'starts_at' => now()->addDays($day),
            ]);
        }

        Event::create([
            'created_by' => $staff->id,
            'category' => 'mass',
            'title' => 'Daily Mass',
            'details' => 'Regular daily Mass.',
            'location' => 'Parish Church',
            'starts_at' => now()->addHour(),
        ]);

        foreach (['event', 'mass'] as $category) {
            Event::create([
                'created_by' => $staff->id,
                'category' => $category,
                'title' => "Past {$category}",
                'details' => 'A completed parish schedule.',
                'starts_at' => now()->subDays(2),
            ]);
        }

        $this->getJson('/api/staff/events?group=events&perPage=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.total', 7)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('data.0.category', 'event');

        $this->getJson('/api/staff/events?group=masses&perPage=5')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'mass')
            ->assertJsonPath('data.0.title', 'Daily Mass');

        $this->getJson('/api/staff/events?group=past&perPage=5')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2);

        $this->getJson('/api/staff/events?group=events&search=choir&perPage=5')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Parish Choir Practice');
    }

    public function test_parishioners_cannot_manage_events(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'parishioner']));

        $this->postJson('/api/staff/events', [
            'title' => 'Unauthorized Event',
            'details' => 'Should not be created.',
            'startsAt' => now()->addDay()->toIso8601String(),
        ])->assertForbidden();
    }

    public function test_event_end_must_not_be_before_start(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));

        $this->postJson('/api/staff/events', [
            'title' => 'Invalid Event',
            'details' => 'Invalid schedule.',
            'startsAt' => '2026-09-10T12:00:00+08:00',
            'endsAt' => '2026-09-10T08:00:00+08:00',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('endsAt');
    }
}
