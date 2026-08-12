<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Toute la logique métier de création de réservation est centralisée ici,
 * pour ne pas la dupliquer entre le contrôleur "client" et le contrôleur "staff"
 * (qui peut créer une réservation manuellement à la réception).
 */
class ReservationService
{
    /**
     * Crée une réservation en garantissant qu'il n'y a jamais de double-booking,
     * même si deux requêtes arrivent EXACTEMENT en même temps.
     *
     * La stratégie à 2 niveaux :
     *  1) DB::transaction() + lockForUpdate() : verrouille la ligne de la chambre
     *     le temps de la transaction, donc une deuxième requête concurrente sur la
     *     MÊME chambre doit attendre que la première soit terminée (ou ait échoué).
     *  2) Une fois le verrou obtenu, on RE-vérifie s'il existe un chevauchement de
     *     dates avec une réservation active. Si oui -> exception, rollback automatique.
     *
     * C'est la façon standard de traiter une "race condition" en base de données
     * relationnelle, bien plus fiable qu'une simple vérification "avant" l'insertion.
     */
    public function createReservation(array $data, array $serviceIds = [], array $serviceQuantities = []): Reservation
    {
        return DB::transaction(function () use ($data, $serviceIds, $serviceQuantities) {

            // lockForUpdate() pose un verrou pessimiste sur la ligne "room"
            $room = Room::where('id', $data['room_id'])->lockForUpdate()->firstOrFail();

            $checkIn = Carbon::parse($data['check_in_date']);
            $checkOut = Carbon::parse($data['check_out_date']);

            $conflict = Reservation::where('room_id', $room->id)
                ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
                ->where('check_in_date', '<', $checkOut)
                ->where('check_out_date', '>', $checkIn)
                ->exists();

            if ($conflict) {
                throw ValidationException::withMessages([
                    'room_id' => "Cette chambre vient d'être réservée pour ces dates par quelqu'un d'autre. Merci de choisir une autre chambre ou d'autres dates.",
                ]);
            }

            $nights = $checkIn->diffInDays($checkOut);
            $roomTotal = $nights * (float) $room->price_per_night;

            $servicesTotal = 0;
            $servicesData = [];
            foreach ($serviceIds as $serviceId) {
                $service = Service::findOrFail($serviceId);
                $qty = max(1, (int) ($serviceQuantities[$serviceId] ?? 1));
                $lineTotal = $qty * (float) $service->price;
                $servicesTotal += $lineTotal;
                $servicesData[$serviceId] = ['quantity' => $qty, 'price' => $service->price];
            }

            $reservation = Reservation::create([
                'reservation_number' => $this->generateReservationNumber(),
                'user_id' => $data['user_id'],
                'room_id' => $room->id,
                'check_in_date' => $checkIn,
                'check_out_date' => $checkOut,
                'number_of_adults' => $data['number_of_adults'],
                'number_of_children' => $data['number_of_children'] ?? 0,
                'total_price' => $roomTotal + $servicesTotal,
                'status' => $data['status'] ?? 'pending',
                'special_requests' => $data['special_requests'] ?? null,
            ]);

            if (! empty($servicesData)) {
                $reservation->services()->sync($servicesData);
            }

            return $reservation->fresh(['room.roomType', 'services', 'user']);
        });
    }

    // Numéro unique lisible : SGH-2026-000123
    private function generateReservationNumber(): string
    {
        $year = now()->year;
        $sequence = Reservation::whereYear('created_at', $year)->count() + 1 + random_int(1, 999);
        return sprintf('SGH-%d-%06d', $year, $sequence);
    }
}
