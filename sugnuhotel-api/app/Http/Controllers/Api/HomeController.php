<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchAvailabilityRequest;
use App\Http\Resources\RoomResource;
use App\Http\Resources\RoomTypeResource;
use App\Models\Room;
use App\Models\RoomType;
use Carbon\Carbon;

class HomeController extends Controller
{
    // GET /api/room-types : alimente la page d'accueil Angular ("nos types de chambres")
    public function roomTypes()
    {
        return RoomTypeResource::collection(RoomType::withCount('rooms')->get());
    }

    // GET /api/search?check_in_date=...&check_out_date=...&adults=...&children=...
    public function search(SearchAvailabilityRequest $request)
    {
        $checkIn = Carbon::parse($request->check_in_date);
        $checkOut = Carbon::parse($request->check_out_date);
        $guests = (int) $request->adults + (int) ($request->children ?? 0);

        $rooms = Room::with(['roomType', 'images'])
            ->availableBetween($checkIn, $checkOut)
            ->where('max_occupancy', '>=', $guests)
            ->get()
            ->map(function (Room $room) use ($checkIn, $checkOut) {
                $nights = $checkIn->diffInDays($checkOut);
                $room->nights = $nights;
                $room->estimated_total = $nights * (float) $room->price_per_night;
                return $room;
            });

        return RoomResource::collection($rooms);
    }
}
