<?php

use Illuminate\Support\Facades\Route;

// Ce backend est une API pure consommée par Angular : il n'y a pas de vues web.
// On garde une route "/" minimale pour vérifier que le serveur tourne.
Route::get('/', fn () => response()->json(['app' => 'SugnuHotel API', 'status' => 'ok']));
