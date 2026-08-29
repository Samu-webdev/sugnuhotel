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
        // Même correction que dans ReservationController::bookingData() : enveloppement
        // explicite en ['data' => ...] pour matcher ce que le frontend Angular attend.
        return response()->json([
            'clients' => ['data' => UserResource::collection(User::where('role', 'client')->orderBy('name')->get())],
            'rooms' => ['data' => RoomResource::collection(Room::with('roomType')->where('status', '!=', 'out_of_service')->get())],
            'services' => ['data' => ServiceResource::collection(Service::where('is_active', true)->get())],
        ]);
    }
}
