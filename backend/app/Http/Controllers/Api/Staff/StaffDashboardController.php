<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class StaffDashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $serviceBookings = Booking::query()->whereHas(
            'service',
            fn ($query) => $query->whereIn('code', ['wedding', 'funeral', 'baptism'])
        );

        $pendingDocuments = Booking::query()
            ->where('status', 'pending')
            ->whereHas('service', fn ($query) => $query->where('code', 'document-request'))
            ->count();

        $massIntentions = Booking::query()
            ->whereHas('service', fn ($query) => $query->where('code', 'mass-intention'))
            ->count();

        $announcements = Announcement::query()
            ->where('posted_at', '<=', now())
            ->latest('posted_at')
            ->limit(5)
            ->get(['id', 'title', 'details'])
            ->map(fn (Announcement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'details' => $announcement->details,
            ]);

        $activity = Booking::query()
            ->with(['service', 'user'])
            ->latest()
            ->limit(7)
            ->get()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'type' => match ($booking->service->code) {
                    'mass-intention' => 'mass_intention',
                    'document-request' => 'document_request',
                    default => 'service',
                },
                'title' => $booking->service->name,
                'details' => "{$booking->user->full_name} · {$booking->booking_reference}",
                'relativeTime' => $booking->created_at->diffForHumans(),
            ]);

        return response()->json(['data' => [
            'stats' => [
                'bookingsToday' => (clone $serviceBookings)->whereDate('created_at', today())->count(),
                'pendingBookings' => (clone $serviceBookings)->where('status', 'pending')->count(),
                'pendingDocumentRequests' => $pendingDocuments,
                'massIntentions' => $massIntentions,
            ],
            'announcements' => $announcements,
            'recentActivity' => $activity,
        ]]);
    }
}
