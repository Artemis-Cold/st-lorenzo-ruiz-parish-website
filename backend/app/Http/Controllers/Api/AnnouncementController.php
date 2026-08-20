<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    public function publicIndex(): AnonymousResourceCollection
    {
        $announcements = Announcement::query()
            ->with('creator')
            ->where('posted_at', '<=', now())
            ->latest('posted_at')
            ->get();

        return AnnouncementResource::collection($announcements);
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'group' => ['nullable', Rule::in(['all', 'scheduled', 'past'])],
            'search' => ['nullable', 'string', 'max:100'],
            'perPage' => ['nullable', 'integer', 'min:5', 'max:25'],
        ]);
        $group = $data['group'] ?? 'all';

        $announcements = Announcement::query()
            ->with('creator')
            ->when($group === 'scheduled', fn ($query) => $query->where('posted_at', '>', now()))
            ->when($group === 'past', fn ($query) => $query->where('posted_at', '<=', now()))
            ->when(isset($data['search']), function ($query) use ($data) {
                $search = '%'.$data['search'].'%';
                $query->where(fn ($query) => $query
                    ->where('title', 'like', $search)
                    ->orWhere('details', 'like', $search));
            })
            ->latest('posted_at')
            ->paginate($data['perPage'] ?? 10)
            ->withQueryString();

        return AnnouncementResource::collection($announcements);
    }

    public function store(StoreAnnouncementRequest $request): JsonResponse
    {
        $announcement = Announcement::create([
            'created_by' => $request->user()->id,
            'title' => $request->validated('title'),
            'details' => $request->validated('details'),
            'posted_at' => $request->validated('postedAt'),
        ]);

        return (new AnnouncementResource($announcement->load('creator')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Announcement $announcement): AnnouncementResource
    {
        return new AnnouncementResource($announcement->load('creator'));
    }

    public function update(
        UpdateAnnouncementRequest $request,
        Announcement $announcement
    ): AnnouncementResource {
        $announcement->update([
            'title' => $request->validated('title'),
            'details' => $request->validated('details'),
            'posted_at' => $request->validated('postedAt'),
        ]);

        return new AnnouncementResource($announcement->load('creator'));
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully.',
        ]);
    }
}
