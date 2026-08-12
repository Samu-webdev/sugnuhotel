import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur fonctionnel (style Angular 15+) : s'exécute sur CHAQUE requête HTTP sortante.
 * 1) Il ajoute automatiquement "Authorization: Bearer <token>" si l'utilisateur est connecté,
 *    pour qu'on n'ait jamais à le faire manuellement dans un service.
 * 2) Il intercepte les réponses 401 (token expiré/invalide) et redirige vers /login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
