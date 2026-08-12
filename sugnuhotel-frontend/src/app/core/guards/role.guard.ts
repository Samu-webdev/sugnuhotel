import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de rôle, paramétrable dans les routes via `data: { roles: ['admin'] }`.
 * Équivalent côté frontend du middleware EnsureRole côté backend :
 * il ne remplace PAS la sécurité serveur (l'API revérifie toujours le rôle),
 * il évite juste d'afficher une page que l'utilisateur ne pourra pas utiliser.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[];

  if (auth.hasRole(...allowedRoles)) {
    return true;
  }
  router.navigate(['/']);
  return false;
};
