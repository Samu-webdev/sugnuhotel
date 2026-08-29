<?php

use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\RoomController;
use App\Http\Controllers\Api\Admin\RoomTypeController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Api\Staff\ReferenceDataController;
use App\Http\Controllers\Api\Staff\ReservationController as StaffReservationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques (aucune authentification requise)
|--------------------------------------------------------------------------
| Consommées par le frontend Angular pour la page d'accueil et la recherche.
*/
Route::get('/room-types', [HomeController::class, 'roomTypes']);
Route::get('/search', [HomeController::class, 'search']);
Route::get('/rooms/{room}/booking-data', [ReservationController::class, 'bookingData']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Routes authentifiées (Sanctum) : tout utilisateur connecté (client, staff, admin)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [AuthController::class, 'updateProfile']);

    /*
    |----------------------------------------------------------------------
    | Espace CLIENT (role:client)
    |----------------------------------------------------------------------
    */
    Route::middleware('role:client')->group(function () {
        Route::post('/reservations', [ReservationController::class, 'store']);
        Route::get('/my-reservations', [ReservationController::class, 'index']);
        Route::get('/my-reservations/{reservation}', [ReservationController::class, 'show']);
        Route::patch('/my-reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
    });

    /*
    |----------------------------------------------------------------------
    | Espace PERSONNEL : réception + admin (role:admin,receptionist)
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin,receptionist')->prefix('staff')->group(function () {
        Route::get('/dashboard', [StaffDashboardController::class, 'index']);
        Route::get('/reference-data', [ReferenceDataController::class, 'forReservationForm']);

        Route::get('/reservations', [StaffReservationController::class, 'index']);
        Route::get('/reservations/calendar', [StaffReservationController::class, 'calendar']);
        Route::post('/reservations', [StaffReservationController::class, 'store']);
        Route::get('/reservations/{reservation}', [StaffReservationController::class, 'show']);
        Route::put('/reservations/{reservation}', [StaffReservationController::class, 'update']);
        Route::delete('/reservations/{reservation}', [StaffReservationController::class, 'destroy']);
        // Suppression définitive, réservée aux réservations déjà annulées (bouton "Supprimer" dans l'UI staff)
        Route::delete('/reservations/{reservation}/force', [StaffReservationController::class, 'forceDelete']);
        Route::patch('/reservations/{reservation}/check-in', [StaffReservationController::class, 'checkIn']);
        Route::patch('/reservations/{reservation}/check-out', [StaffReservationController::class, 'checkOut']);
    });

    /*
    |----------------------------------------------------------------------
    | Espace ADMIN uniquement (role:admin)
    |----------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::apiResource('room-types', RoomTypeController::class)->except(['show']);
        Route::apiResource('rooms', RoomController::class)->except(['show']);
        Route::apiResource('services', ServiceController::class)->except(['show']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});
