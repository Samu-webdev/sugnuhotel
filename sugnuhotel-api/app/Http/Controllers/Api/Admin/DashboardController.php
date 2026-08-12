<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        return response()->json([
            'total_rooms' => Room::count(),
            'total_users' => User::where('role', 'client')->count(),
            'arrivals_today' => Reservation::whereDate('check_in_date', $today)->whereIn('status', ['pending', 'confirmed'])->count(),
            'departures_today' => Reservation::whereDate('check_out_date', $today)->where('status', 'checked_in')->count(),
            'occupancy_rate' => Room::count() > 0
                ? round(Room::where('status', 'occupied')->count() / Room::count() * 100)
                : 0,
        ]);
    }
}
