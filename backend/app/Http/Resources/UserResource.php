<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'parishioner_id' => $this->parishioner_id,

            'username' => $this->username,

            'full_name' => $this->full_name,

            'first_name' => $this->first_name,
            'middle_initial' => $this->middle_initial,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,

            'phone' => $this->phone,

            'address' => [
                'house_no' => $this->house_no,
                'street' => $this->street,
                'barangay' => $this->barangay,
                'municipality' => $this->municipality,
                'province' => $this->province,
                'zip_code' => $this->zip_code,
            ],

            'birth_date' => $this->birth_date,

            'gender' => $this->gender,

            'profile_photo' => $this->profile_photo,
            'profile_photo_url' => $this->profile_photo
                ? Storage::disk('public')->url($this->profile_photo)
                : null,

            'role' => $this->role,

            'phone_verified' => ! is_null($this->phone_verified_at),

            'created_at' => $this->created_at,
            'profile_completed' => $this->profile_completed,
        ];
    }
}
