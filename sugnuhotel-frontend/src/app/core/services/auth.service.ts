import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Service central d'authentification.
 * - Stocke le token Sanctum reçu du backend dans localStorage.
 * - Expose l'utilisateur courant via un signal Angular (réactif dans tous les composants).
 * - C'est LUI qui décide si l'utilisateur est "connecté" (présence d'un token).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'sugnuhotel_token';
  private readonly userKey = 'sugnuhotel_user';

  // signal() = état réactif natif Angular (depuis Angular 16+), plus léger qu'un BehaviorSubject
  currentUser = signal<User | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  register(payload: { name: string; email: string; phone?: string; password: string; password_confirmation: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/register`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/login`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/logout`, {})
      .pipe(tap(() => this.clearSession()));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(...roles: string[]): boolean {
    const user = this.currentUser();
    return !!user && roles.includes(user.role);
  }

  private persistSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }
}
