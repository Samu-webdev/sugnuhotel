<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'base_price' => (float) $this->base_price,
            'max_occupancy' => $this->max_occupancy,
            'image_url' => $this->image ? asset('storage/'.$this->image) : null,
            'rooms_count' => $this->whenCounted('rooms'),
        ];
    }
}
