<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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

    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'group' => ['nullable', Rule::in(['events', 'masses', 'past'])],
            'search' => ['nullable', 'string', 'max:100'],
            'perPage' => ['nullable', 'integer', 'min:5', 'max:25'],
        ]);
        $group = $data['group'] ?? 'events';

        $events = Event::query()
            ->with('creator')
            ->when($group === 'events', fn ($query) => $query
                ->where('category', 'event')
                ->where(fn ($query) => $this->upcoming($query)))
            ->when($group === 'masses', fn ($query) => $query
                ->where('category', 'mass')
                ->where(fn ($query) => $this->upcoming($query)))
            ->when($group === 'past', fn ($query) => $query
                ->where(fn ($query) => $this->past($query)))
            ->when(isset($data['search']), function ($query) use ($data) {
                $search = '%'.$data['search'].'%';
                $query->where(fn ($query) => $query
                    ->where('title', 'like', $search)
                    ->orWhere('details', 'like', $search)
                    ->orWhere('location', 'like', $search));
            })
            ->orderBy('starts_at', $group === 'past' ? 'desc' : 'asc')
            ->paginate($data['perPage'] ?? 10)
            ->withQueryString();

        return EventResource::collection($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::create([
            'created_by' => $request->user()->id,
            'category' => 'event',
            ...$this->attributes($request->validated()),
        ]);

        return (new EventResource($event->load('creator')))
            ->response()
            ->setStatusCode(201);
    }

    public function storeMassSchedule(Request $request): JsonResponse
    {
        $data = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $month = CarbonImmutable::createFromFormat('Y-m', $data['month']);

        if ($month->endOfMonth()->isBefore(today())) {
            throw ValidationException::withMessages([
                'month' => 'Select the current month or a future month.',
            ]);
        }

        $result = DB::transaction(function () use ($data, $month, $request) {
            $created = 0;
            $skipped = 0;
            $date = $month->startOfMonth();

            while ($date->month === $month->month) {
                $times = $date->isSunday() ? ['06:00', '09:00', '16:30'] : ['06:00'];

                foreach ($times as $time) {
                    $startsAt = CarbonImmutable::parse($date->toDateString().' '.$time);
                    $title = $date->isSunday() ? 'Sunday Mass' : 'Daily Mass';
                    $event = Event::firstOrCreate([
                        'title' => $title,
                        'starts_at' => $startsAt,
                    ], [
                        'created_by' => $request->user()->id,
                        'category' => 'mass',
                        'details' => $date->isSunday()
                            ? 'Regular Sunday Mass at St. Lorenzo Ruiz Parish.'
                            : 'Regular daily Mass at St. Lorenzo Ruiz Parish.',
                        'location' => $data['location'] ?? 'Parish Church',
                        'ends_at' => null,
                    ]);

                    $event->wasRecentlyCreated ? $created++ : $skipped++;
                }

                $date = $date->addDay();
            }

            return compact('created', 'skipped');
        });

        return response()->json([
            'message' => $result['created'] > 0
                ? "Added {$result['created']} Mass schedules."
                : 'The Mass schedule for this month already exists.',
            ...$result,
        ], $result['created'] > 0 ? 201 : 200);
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

    private function upcoming($query): void
    {
        $query->where(function ($query) {
            $query->whereNull('ends_at')->where('starts_at', '>=', now())
                ->orWhere('ends_at', '>=', now());
        });
    }

    private function past($query): void
    {
        $query->where(function ($query) {
            $query->whereNull('ends_at')->where('starts_at', '<', now())
                ->orWhere('ends_at', '<', now());
        });
    }
}
