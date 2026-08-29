<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomType;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * IMPORTANT : ce seeder est appelé à CHAQUE déploiement (voir Dockerfile,
 * "php artisan db:seed --force"), pas seulement à la première installation.
 * On utilise donc systématiquement firstOrCreate() plutôt que create() :
 * - si l'enregistrement existe déjà (même email / même numéro de chambre / même
 *   nom de service), il n'est pas recréé, aucune erreur de contrainte unique.
 * - s'il n'existe pas encore, il est créé normalement.
 * C'est ce qui manquait dans la version précédente et cassait la connexion
 * aux comptes de démonstration sur le déploiement en ligne.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Comptes de démonstration : un par rôle ---
        User::firstOrCreate(
            ['email' => 'admin@sugnuhotel.test'],
            ['name' => 'Admin SugnuHotel', 'password' => Hash::make('password'), 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'reception@sugnuhotel.test'],
            ['name' => 'Fatou Réception', 'password' => Hash::make('password'), 'role' => 'receptionist']
        );

        User::firstOrCreate(
            ['email' => 'client@sugnuhotel.test'],
            ['name' => 'Moussa Client', 'password' => Hash::make('password'), 'role' => 'client']
        );

        // --- Types de chambres ---
        $standard = RoomType::firstOrCreate(
            ['name' => 'Standard'],
            ['description' => 'Chambre confortable avec les équipements essentiels.', 'base_price' => 25000, 'max_occupancy' => 2]
        );

        $deluxe = RoomType::firstOrCreate(
            ['name' => 'Deluxe'],
            ['description' => 'Chambre spacieuse avec vue et literie premium.', 'base_price' => 45000, 'max_occupancy' => 3]
        );

        $suite = RoomType::firstOrCreate(
            ['name' => 'Suite'],
            ['description' => 'Suite avec salon séparé, idéale pour un séjour prolongé.', 'base_price' => 80000, 'max_occupancy' => 4]
        );

        // --- Chambres physiques (quelques-unes par type) ---
        foreach (range(101, 105) as $num) {
            Room::firstOrCreate(
                ['room_number' => (string) $num],
                ['room_type_id' => $standard->id, 'floor' => 1, 'price_per_night' => 25000, 'max_occupancy' => 2, 'status' => 'available']
            );
        }

        foreach (range(201, 204) as $num) {
            Room::firstOrCreate(
                ['room_number' => (string) $num],
                ['room_type_id' => $deluxe->id, 'floor' => 2, 'price_per_night' => 45000, 'max_occupancy' => 3, 'status' => 'available']
            );
        }

        foreach (range(301, 302) as $num) {
            Room::firstOrCreate(
                ['room_number' => (string) $num],
                ['room_type_id' => $suite->id, 'floor' => 3, 'price_per_night' => 80000, 'max_occupancy' => 4, 'status' => 'available']
            );
        }

        // --- Services additionnels ---
        $services = [
            ['name' => 'Petit-déjeuner', 'description' => 'Buffet continental servi de 7h à 10h.', 'price' => 5000],
            ['name' => 'Parking', 'description' => 'Place de parking sécurisée pour la durée du séjour.', 'price' => 2000],
            ['name' => 'Spa', 'description' => "Accès à l'espace bien-être (1h).", 'price' => 15000],
            ['name' => 'Navette aéroport', 'description' => "Transfert aller-retour depuis l'aéroport.", 'price' => 10000],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['name' => $service['name']],
                ['description' => $service['description'], 'price' => $service['price'], 'is_active' => true]
            );
        }
    }
}
