<?php

namespace Tests\Feature;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnnouncementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_create_update_list_and_delete_announcements(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff, ['staff']);

        $created = $this->postJson('/api/staff/announcements', [
            'title' => 'Parish Office Closed',
            'details' => 'The parish office will be closed tomorrow.',
            'postedAt' => now()->subMinute()->toIso8601String(),
        ])->assertCreated()->assertJsonPath('data.title', 'Parish Office Closed');

        $id = $created->json('data.id');

        $this->getJson('/api/staff/announcements')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->putJson("/api/staff/announcements/{$id}", [
            'title' => 'Updated Office Hours',
            'details' => 'The parish office opens at 9:00 AM.',
            'postedAt' => now()->addDay()->toIso8601String(),
        ])->assertOk()
            ->assertJsonPath('data.title', 'Updated Office Hours')
            ->assertJsonPath('data.status', 'scheduled');

        $this->deleteJson("/api/staff/announcements/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('announcements', ['id' => $id]);
    }

    public function test_public_feed_only_returns_published_announcements(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        Announcement::create([
            'created_by' => $staff->id,
            'title' => 'Published',
            'details' => 'Visible now.',
            'posted_at' => now()->subMinute(),
        ]);

        Announcement::create([
            'created_by' => $staff->id,
            'title' => 'Scheduled',
            'details' => 'Visible later.',
            'posted_at' => now()->addDay(),
        ]);

        $this->getJson('/api/announcements')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Published');
    }

    public function test_staff_announcements_are_searchable_grouped_and_paginated(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        Sanctum::actingAs($staff, ['staff']);

        foreach (range(1, 7) as $day) {
            Announcement::create([
                'created_by' => $staff->id,
                'title' => $day === 3 ? 'Choir Ministry Update' : "Published Notice {$day}",
                'details' => 'Previously published parish information.',
                'posted_at' => now()->subDays($day),
            ]);
        }

        Announcement::create([
            'created_by' => $staff->id,
            'title' => 'Scheduled Parish Notice',
            'details' => 'This announcement will be published later.',
            'posted_at' => now()->addDay(),
        ]);

        $this->getJson('/api/staff/announcements?group=all&perPage=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.total', 8)
            ->assertJsonPath('meta.last_page', 2);

        $this->getJson('/api/staff/announcements?group=scheduled&perPage=5')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'scheduled')
            ->assertJsonPath('data.0.title', 'Scheduled Parish Notice');

        $this->getJson('/api/staff/announcements?group=past&perPage=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.total', 7)
            ->assertJsonPath('data.0.status', 'published');

        $this->getJson('/api/staff/announcements?group=all&search=choir&perPage=5')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Choir Ministry Update');
    }

    public function test_parishioners_cannot_manage_announcements(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'parishioner']));

        $this->postJson('/api/staff/announcements', [
            'title' => 'Not allowed',
            'details' => 'A parishioner must not publish this.',
            'postedAt' => now()->toIso8601String(),
        ])->assertForbidden();
    }

    public function test_guests_cannot_manage_announcements(): void
    {
        $this->getJson('/api/staff/announcements')->assertUnauthorized();
    }

    public function test_announcement_fields_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));

        $this->postJson('/api/staff/announcements', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'details', 'postedAt']);
    }
}
