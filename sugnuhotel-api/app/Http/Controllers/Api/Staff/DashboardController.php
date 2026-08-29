<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        $arrivals = Reservation::with(['user', 'room'])
            ->whereDate('check_in_date', $today)
            ->whereIn('status', ['pending', 'confirmed'])
            ->get();

        $departures = Reservation::with(['user', 'room'])
            ->whereDate('check_out_date', $today)
            ->where('status', 'checked_in')
            ->get();

        $occupancyRate = Room::count() > 0
            ? round(Room::where('status', 'occupied')->count() / Room::count() * 100)
            : 0;

        // Voir le commentaire équivalent dans ReservationController::bookingData() :
        // on enveloppe explicitement dans ['data' => ...] car ces collections sont
        // imbriquées dans un tableau manuel, donc l'enveloppement automatique de Laravel
        // ne s'applique pas ici.
        return response()->json([
            'arrivals' => ['data' => ReservationResource::collection($arrivals)],
            'departures' => ['data' => ReservationResource::collection($departures)],
            'occupancy_rate' => $occupancyRate,
        ]);
    }
}
