<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EventController extends Controller
{
    public function publicIndex(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $events = Event::query()
            ->with('creator')
            ->when(isset($data['month']), function ($query) use ($data) {
                $month = Carbon::createFromFormat('Y-m', $data['month']);
                $start = $month->copy()->startOfMonth();
                $end = $month->copy()->endOfMonth();

                $query->where('starts_at', '<=', $end)
                    ->where(function ($query) use ($start) {
                        $query->whereNull('ends_at')
                            ->where('starts_at', '>=', $start)
                            ->orWhere('ends_at', '>=', $start);
                    });
            }, fn ($query) => $query->where(function ($query) {
                $query->where('starts_at', '>=', today())
                    ->orWhere('ends_at', '>=', now());
            }))
            ->orderBy('starts_at')
            ->get();

        return EventResource::collection($events);
    }

    public function index(): AnonymousResourceCollection
    {
        return EventResource::collection(
            Event::query()->with('creator')->latest('starts_at')->get()
        );
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create([
            'created_by' => $request->user()->id,
            ...$this->attributes($request->validated()),
        ]);

        return (new EventResource($event->load('creator')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Event $event): EventResource
    {
        return new EventResource($event->load('creator'));
    }

    public function update(
        UpdateEventRequest $request,
        Event $event
    ): EventResource {
        $event->update($this->attributes($request->validated()));

        return new EventResource($event->load('creator'));
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(['message' => 'Event deleted successfully.']);
    }

    private function attributes(array $data): array
    {
        return [
            'title' => $data['title'],
            'details' => $data['details'],
            'location' => $data['location'] ?? null,
            'starts_at' => $data['startsAt'],
            'ends_at' => $data['endsAt'] ?? null,
        ];
    }
}
