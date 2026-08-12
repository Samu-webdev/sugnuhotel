<?php

use App\Http\Middleware\EnsureRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        // Laravel 11 n'active pas routes/api.php par défaut : il faut le déclarer
        // explicitement ici. Toutes les routes de ce fichier seront préfixées "/api".
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Alias utilisé dans routes/api.php : ->middleware('role:admin')
        $middleware->alias([
            'role' => EnsureRole::class,
        ]);

        // Laravel 11 gère automatiquement le middleware "api" (throttle + bindings)
        // pour le groupe api: défini ci-dessus. On y ajoute rien de spécial ici :
        // l'authentification par token Sanctum passe par le guard "sanctum" (voir config/auth.php),
        // pas par le middleware de cookie SPA (EnsureFrontendRequestsAreStateful),
        // ce qui simplifie beaucoup le CORS car Angular envoie un simple header
        // "Authorization: Bearer <token>", sans avoir besoin de cookies cross-domain.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // On force TOUTES les erreurs sur les routes /api/* à être renvoyées en JSON
        // (par défaut Laravel renverrait parfois une page HTML d'erreur).
        $exceptions->shouldRenderJsonWhen(function ($request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
