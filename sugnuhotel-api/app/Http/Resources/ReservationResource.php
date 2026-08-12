<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_number' => $this->reservation_number,
            'check_in_date' => $this->check_in_date->toDateString(),
            'check_out_date' => $this->check_out_date->toDateString(),
            'nights' => $this->nights(),
            'number_of_adults' => $this->number_of_adults,
            'number_of_children' => $this->number_of_children,
            'total_price' => (float) $this->total_price,
            'status' => $this->status,
            'time_status' => $this->timeStatus(), // upcoming / current / past / cancelled
            'special_requests' => $this->special_requests,
            'user' => new UserResource($this->whenLoaded('user')),
            'room' => new RoomResource($this->whenLoaded('room')),
            'services' => $this->whenLoaded('services', fn () => $this->services->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'quantity' => $s->pivot->quantity,
                'price' => (float) $s->pivot->price,
            ])),
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
