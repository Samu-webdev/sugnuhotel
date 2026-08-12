<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReservationResource;
use App\Mail\ReservationCancelledMail;
use App\Mail\ReservationUpdatedMail;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * API "espace personnel" consommée par les modules Angular /staff/*.
 * Recherche, calendrier, création manuelle, modification, annulation,
 * check-in / check-out — réservé aux rôles admin + receptionist (route api.php).
 */
class ReservationController extends Controller
{
    public function __construct(private ReservationService $reservationService)
    {
    }

    // GET /api/staff/reservations?q=...&date=...&status=...
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'room.roomType']);

        if ($request->filled('q')) {
            $term = $request->q;
            $query->where(function ($q) use ($term) {
                $q->where('reservation_number', 'like', "%{$term}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%"))
                  ->orWhereHas('room', fn ($r) => $r->where('room_number', 'like', "%{$term}%"));
            });
        }
        if ($request->filled('date')) {
            $query->whereDate('check_in_date', $request->date);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return ReservationResource::collection($query->latest()->paginate(20)->withQueryString());
    }

    // GET /api/staff/reservations/calendar : format attendu par FullCalendar côté Angular
    public function calendar()
    {
        $reservations = Reservation::with(['user', 'room'])
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->get()
            ->map(fn (Reservation $r) => [
                'id' => $r->id,
                'title' => "Ch. {$r->room->room_number} - {$r->user->name}",
                'start' => $r->check_in_date->toDateString(),
                'end' => $r->check_out_date->toDateString(),
                'status' => $r->status,
                'color' => match ($r->status) {
                    'pending' => '#f0ad4e',
                    'confirmed' => '#5bc0de',
                    'checked_in' => '#5cb85c',
                    default => '#999',
                },
            ]);

        return response()->json($reservations);
    }

    // POST /api/staff/reservations : création manuelle (ex. réservation prise par téléphone)
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'room_id' => ['required', 'exists:rooms,id'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'number_of_adults' => ['required', 'integer', 'min:1'],
            'number_of_children' => ['nullable', 'integer', 'min:0'],
            'special_requests' => ['nullable', 'string'],
        ]);
        $data['status'] = 'confirmed';

        $reservation = $this->reservationService->createReservation(
            $data,
            $request->input('services', []),
            $request->input('quantities', [])
        );

        return (new ReservationResource($reservation))->response()->setStatusCode(201);
    }

    public function show(Reservation $reservation)
    {
        return new ReservationResource($reservation->load(['user', 'room.roomType', 'services']));
    }

    public function update(Request $request, Reservation $reservation)
    {
        $data = $request->validate([
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'number_of_adults' => ['required', 'integer', 'min:1'],
            'number_of_children' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
            'special_requests' => ['nullable', 'string'],
        ]);

        // Même logique anti double-booking que côté client, revérifiée si les dates changent
        $conflict = Reservation::where('room_id', $reservation->room_id)
            ->where('id', '!=', $reservation->id)
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->where('check_in_date', '<', $data['check_out_date'])
            ->where('check_out_date', '>', $data['check_in_date'])
            ->exists();

        if ($conflict) {
            return response()->json(['message' => "Conflit : la chambre est déjà réservée sur cette période."], 422);
        }

        $reservation->update($data);
        Mail::to($reservation->user->email)->send(new ReservationUpdatedMail($reservation));

        return new ReservationResource($reservation->fresh(['user', 'room.roomType', 'services']));
    }

    public function destroy(Reservation $reservation)
    {
        $reservation->update(['status' => 'cancelled']);
        Mail::to($reservation->user->email)->send(new ReservationCancelledMail($reservation));

        return new ReservationResource($reservation->fresh());
    }

    public function checkIn(Reservation $reservation)
    {
        $reservation->update(['status' => 'checked_in']);
        $reservation->room->update(['status' => 'occupied']);

        return new ReservationResource($reservation->fresh(['user', 'room.roomType']));
    }

    public function checkOut(Reservation $reservation)
    {
        $reservation->update(['status' => 'checked_out']);
        $reservation->room->update(['status' => 'available']);

        return new ReservationResource($reservation->fresh(['user', 'room.roomType']));
    }
}
