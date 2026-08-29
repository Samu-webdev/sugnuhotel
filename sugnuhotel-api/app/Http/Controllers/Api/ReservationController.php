<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Http\Resources\RoomResource;
use App\Http\Resources\ServiceResource;
use App\Mail\ReservationCancelledMail;
use App\Mail\ReservationConfirmationMail;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\Service;
use App\Services\ReservationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

/**
 * API "espace client" : consultée par le module Angular /my-reservations.
 * Chaque méthode vérifie que la réservation manipulée appartient bien
 * à l'utilisateur authentifié (via son token Sanctum).
 */
class ReservationController extends Controller
{
    public function __construct(private ReservationService $reservationService)
    {
    }

    // GET /api/rooms/{room}/services : données nécessaires pour construire le formulaire de réservation côté Angular
    public function bookingData(Room $room)
    {
        return response()->json([
            'room' => new RoomResource($room->load('roomType')),
            // IMPORTANT : on enveloppe explicitement dans une clé "data", exactement comme le fait
            // Laravel automatiquement quand un ResourceCollection est renvoyé directement par une route.
            // Ici, comme la collection est imbriquée dans un tableau manuel (response()->json([...])),
            // cet enveloppement automatique ne se produit PAS — sans ce ['data' => ...] explicite,
            // le frontend Angular reçoit un tableau brut au lieu de { data: [...] }, ce qui casse
            // le rendu de la page de réservation (et donc fait "disparaître" le bouton Réserver).
            'services' => ['data' => ServiceResource::collection(Service::where('is_active', true)->get())],
        ]);
    }

    public function store(StoreReservationRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        $reservation = $this->reservationService->createReservation(
            $data,
            $request->input('services', []),
            $request->input('quantities', [])
        );

        Mail::to($reservation->user->email)->send(new ReservationConfirmationMail($reservation));

        return new ReservationResource($reservation->load(['room.roomType', 'services', 'user']));
    }

    public function index()
    {
        $reservations = Auth::user()->reservations()
            ->with(['room.roomType'])
            ->latest()
            ->get();

        return ReservationResource::collection($reservations);
    }

    public function show(Reservation $reservation)
    {
        $this->authorizeOwnership($reservation);
        return new ReservationResource($reservation->load(['room.roomType', 'services']));
    }

    public function cancel(Reservation $reservation)
    {
        $this->authorizeOwnership($reservation);

        if (! in_array($reservation->status, ['pending', 'confirmed'])) {
            return response()->json(['message' => "Cette réservation ne peut plus être annulée."], 422);
        }

        $reservation->update(['status' => 'cancelled']);
        Mail::to($reservation->user->email)->send(new ReservationCancelledMail($reservation));

        return new ReservationResource($reservation->fresh(['room.roomType', 'services']));
    }

    private function authorizeOwnership(Reservation $reservation): void
    {
        if ($reservation->user_id !== Auth::id()) {
            abort(403, "Cette réservation ne vous appartient pas.");
        }
    }
}
