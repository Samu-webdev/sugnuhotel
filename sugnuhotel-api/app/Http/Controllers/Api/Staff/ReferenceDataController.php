<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\UserResource;
use App\Models\Room;
use App\Models\Service;
use App\Models\User;

// Fournit à Angular les listes déroulantes (clients, chambres, services)
// nécessaires pour le formulaire "Créer une réservation" côté réception.
class ReferenceDataController extends Controller
{
    public function forReservationForm()
    {
        return response()->json([
            'clients' => UserResource::collection(User::where('role', 'client')->orderBy('name')->get()),
            'rooms' => RoomResource::collection(Room::with('roomType')->where('status', '!=', 'out_of_service')->get()),
            'services' => ServiceResource::collection(Service::where('is_active', true)->get()),
        ]);
    }
}
