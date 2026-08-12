<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware générique de contrôle de rôle.
 * Utilisation dans les routes : ->middleware('role:admin')
 * ou plusieurs rôles autorisés :  ->middleware('role:admin,receptionist')
 *
 * On l'enregistre sous l'alias "role" dans bootstrap/app.php (voir README).
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles, true)) {
            abort(403, "Accès non autorisé pour votre rôle.");
        }

        return $next($request);
    }
}
