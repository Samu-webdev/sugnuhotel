<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_number' => $this->room_number,
            'floor' => $this->floor,
            'price_per_night' => (float) $this->price_per_night,
            'max_occupancy' => $this->max_occupancy,
            'status' => $this->status,
            'room_type' => new RoomTypeResource($this->whenLoaded('roomType')),
            'amenities' => $this->whenLoaded('amenities', fn () => $this->amenities->pluck('amenity_name')),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => asset('storage/'.$img->path))),
            // Champs calculés uniquement présents pour les résultats de recherche (voir HomeController::search)
            'nights' => $this->when(isset($this->nights), fn () => $this->nights),
            'estimated_total' => $this->when(isset($this->estimated_total), fn () => $this->estimated_total),
        ];
    }
}
