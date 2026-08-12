import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: var(--sh-terracotta-dark, #a8431f);">
      <div class="container">
        <a class="navbar-brand" routerLink="/"><i class="fa-solid fa-hotel"></i> SugnuHotel</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Accueil</a></li>

            <ng-container *ngIf="auth.currentUser() as user">
              <li class="nav-item" *ngIf="user.role === 'client'">
                <a class="nav-link" routerLink="/my-reservations" routerLinkActive="active">Mes réservations</a>
              </li>
              <li class="nav-item" *ngIf="user.role === 'admin' || user.role === 'receptionist'">
                <a class="nav-link" routerLink="/staff/dashboard" routerLinkActive="active">Espace personnel</a>
              </li>
              <li class="nav-item" *ngIf="user.role === 'admin'">
                <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">Administration</a>
              </li>
            </ng-container>
          </ul>

          <ul class="navbar-nav">
            <ng-container *ngIf="!auth.currentUser(); else loggedIn">
              <li class="nav-item"><a class="nav-link" routerLink="/login">Connexion</a></li>
              <li class="nav-item"><a class="btn btn-outline-light btn-sm mt-1" routerLink="/register">Créer un compte</a></li>
            </ng-container>
            <ng-template #loggedIn>
              <li class="nav-item"><a class="nav-link" routerLink="/profile"><i class="fa-solid fa-user"></i> {{ auth.currentUser()?.name }}</a></li>
              <li class="nav-item">
                <button class="btn btn-outline-light btn-sm mt-1" (click)="logout()">Déconnexion</button>
              </li>
            </ng-template>
          </ul>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: () => this.router.navigate(['/']), // même si l'appel réseau échoue, on nettoie la session locale
    });
  }
}
