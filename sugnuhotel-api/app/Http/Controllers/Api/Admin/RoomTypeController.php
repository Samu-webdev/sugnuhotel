<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomTypeResource;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    public function index()
    {
        return RoomTypeResource::collection(RoomType::withCount('rooms')->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('room_types', 'public');
        }

        $roomType = RoomType::create($data);

        return (new RoomTypeResource($roomType))->response()->setStatusCode(201);
    }

    public function update(Request $request, RoomType $roomType)
    {
        $data = $this->validated($request);

        if ($request->hasFile('image')) {
            if ($roomType->image) {
                Storage::disk('public')->delete($roomType->image);
            }
            $data['image'] = $request->file('image')->store('room_types', 'public');
        }

        $roomType->update($data);

        return new RoomTypeResource($roomType);
    }

    public function destroy(RoomType $roomType)
    {
        if ($roomType->rooms()->exists()) {
            return response()->json(['message' => "Impossible de supprimer : des chambres utilisent encore ce type."], 422);
        }

        $roomType->delete();
        return response()->json(['message' => 'Type de chambre supprimé.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'max_occupancy' => ['required', 'integer', 'min:1'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);
    }
}
