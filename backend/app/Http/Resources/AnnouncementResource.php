<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnouncementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'details' => $this->details,
            'postedAt' => $this->posted_at->toIso8601String(),
            'expiresAt' => $this->expires_at?->toIso8601String(),
            'status' => match (true) {
                $this->posted_at->isFuture() => 'scheduled',
                $this->expires_at?->isPast() => 'expired',
                default => 'published',
            },
            'createdBy' => $this->whenLoaded('creator', fn () => [
                'id' => $this->creator->id,
                'name' => $this->creator->full_name,
            ]),
            'createdAt' => $this->created_at->toIso8601String(),
            'updatedAt' => $this->updated_at->toIso8601String(),
        ];
    }
}
