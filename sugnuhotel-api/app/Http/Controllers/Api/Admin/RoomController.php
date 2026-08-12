<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    public function index()
    {
        return RoomResource::collection(Room::with(['roomType', 'images', 'amenities'])->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $room = Room::create($data);

        $this->handleImages($request, $room);
        $this->handleAmenities($request, $room);

        return (new RoomResource($room->load('roomType', 'images', 'amenities')))->response()->setStatusCode(201);
    }

    public function update(Request $request, Room $room)
    {
        $data = $this->validated($request, $room->id);
        $room->update($data);

        $this->handleImages($request, $room);
        $this->handleAmenities($request, $room);

        return new RoomResource($room->fresh(['roomType', 'images', 'amenities']));
    }

    public function destroy(Room $room)
    {
        if ($room->reservations()->whereIn('status', ['pending', 'confirmed', 'checked_in'])->exists()) {
            return response()->json(['message' => "Impossible de supprimer : des réservations actives existent sur cette chambre."], 422);
        }

        foreach ($room->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $room->delete();
        return response()->json(['message' => 'Chambre supprimée.']);
    }

    private function validated(Request $request, ?int $roomId = null): array
    {
        return $request->validate([
            'room_number' => ['required', 'string', 'max:50', 'unique:rooms,room_number,'.$roomId],
            'room_type_id' => ['required', 'exists:room_types,id'],
            'floor' => ['required', 'integer', 'min:0'],
            'price_per_night' => ['required', 'numeric', 'min:0'],
            'max_occupancy' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:available,occupied,maintenance,out_of_service'],
        ]);
    }

    private function handleImages(Request $request, Room $room): void
    {
        if (! $request->hasFile('images')) {
            return;
        }
        foreach ($request->file('images') as $index => $file) {
            $path = $file->store('rooms', 'public');
            $room->images()->create(['path' => $path, 'is_cover' => $index === 0 && $room->images()->count() === 0]);
        }
    }

    private function handleAmenities(Request $request, Room $room): void
    {
        if ($request->filled('amenities')) {
            $room->amenities()->delete();
            // "amenities" arrive en JSON (tableau de chaînes) depuis Angular
            $list = is_array($request->amenities) ? $request->amenities : explode(',', $request->amenities);
            foreach ($list as $amenity) {
                $amenity = trim($amenity);
                if ($amenity !== '') {
                    $room->amenities()->create(['amenity_name' => $amenity]);
                }
            }
        }
    }
}
