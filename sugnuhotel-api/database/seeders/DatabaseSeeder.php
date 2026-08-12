<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomType;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- Comptes de démonstration : un par rôle ---
        User::create([
            'name' => 'Admin SugnuHotel',
            'email' => 'admin@sugnuhotel.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Fatou Réception',
            'email' => 'reception@sugnuhotel.test',
            'password' => Hash::make('password'),
            'role' => 'receptionist',
        ]);

        User::create([
            'name' => 'Moussa Client',
            'email' => 'client@sugnuhotel.test',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);

        // --- Types de chambres ---
        $standard = RoomType::create([
            'name' => 'Standard',
            'description' => 'Chambre confortable avec les équipements essentiels.',
            'base_price' => 25000,
            'max_occupancy' => 2,
        ]);

        $deluxe = RoomType::create([
            'name' => 'Deluxe',
            'description' => 'Chambre spacieuse avec vue et literie premium.',
            'base_price' => 45000,
            'max_occupancy' => 3,
        ]);

        $suite = RoomType::create([
            'name' => 'Suite',
            'description' => 'Suite avec salon séparé, idéale pour un séjour prolongé.',
            'base_price' => 80000,
            'max_occupancy' => 4,
        ]);

        // --- Chambres physiques (quelques-unes par type) ---
        foreach (range(101, 105) as $i => $num) {
            Room::create([
                'room_number' => (string) $num,
                'room_type_id' => $standard->id,
                'floor' => 1,
                'price_per_night' => 25000,
                'max_occupancy' => 2,
                'status' => 'available',
            ]);
        }

        foreach (range(201, 204) as $num) {
            Room::create([
                'room_number' => (string) $num,
                'room_type_id' => $deluxe->id,
                'floor' => 2,
                'price_per_night' => 45000,
                'max_occupancy' => 3,
                'status' => 'available',
            ]);
        }

        foreach (range(301, 302) as $num) {
            Room::create([
                'room_number' => (string) $num,
                'room_type_id' => $suite->id,
                'floor' => 3,
                'price_per_night' => 80000,
                'max_occupancy' => 4,
                'status' => 'available',
            ]);
        }

        // --- Services additionnels ---
        Service::insert([
            ['name' => 'Petit-déjeuner', 'description' => 'Buffet continental servi de 7h à 10h.', 'price' => 5000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Parking', 'description' => 'Place de parking sécurisée pour la durée du séjour.', 'price' => 2000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Spa', 'description' => 'Accès à l\'espace bien-être (1h).', 'price' => 15000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Navette aéroport', 'description' => 'Transfert aller-retour depuis l\'aéroport.', 'price' => 10000, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
