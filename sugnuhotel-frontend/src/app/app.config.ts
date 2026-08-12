import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // withInterceptors branche notre intercepteur (ajout du token Bearer) sur TOUTES les requêtes HttpClient
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
