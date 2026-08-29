import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Même photo que la page d'accueil (licence Unsplash, réutilisation libre) pour une identité visuelle cohérente
const HERO_IMAGE = 'https://images.unsplash.com/photo-1498121957837-60d97c66df4d?w=1200&q=80&auto=format&fit=crop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center g-0 shadow-sm rounded-4 overflow-hidden" style="max-width: 900px; margin: 0 auto;">
      <!-- Panneau visuel : présent uniquement à partir des écrans moyens (masqué sur mobile) -->
      <div class="col-md-5 d-none d-md-flex flex-column justify-content-end text-white p-4"
           style="min-height: 480px; background-size: cover; background-position: center;"
           [style.background-image]="'linear-gradient(180deg, rgba(44,30,20,.15), rgba(44,30,20,.85)), url(' + heroImage + ')'">
        <span class="sh-badge-pill mb-3 align-self-start"><i class="fa-solid fa-sun"></i> La Teranga vous accueille</span>
        <h3 class="fw-bold">Bon retour parmi nous</h3>
        <p class="small mb-0 opacity-75">Connectez-vous pour gérer vos réservations à SugnuHotel.</p>
      </div>

      <!-- Formulaire -->
      <div class="col-md-7 bg-white p-4 p-md-5">
        <h4 class="mb-1 fw-bold">Connexion</h4>
        <p class="text-muted small mb-4">Heureux de vous revoir.</p>

        <div class="alert alert-danger py-2" *ngIf="errorMessage">{{ errorMessage }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="fa-solid fa-envelope text-muted"></i></span>
              <input type="email" formControlName="email" class="form-control" placeholder="vous@exemple.com" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Mot de passe</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="fa-solid fa-lock text-muted"></i></span>
              <input type="password" formControlName="password" class="form-control" placeholder="••••••••" required>
            </div>
          </div>
          <button class="btn btn-dark w-100 py-2" [disabled]="form.invalid || loading">
            <i class="fa-solid fa-arrow-right-to-bracket me-1" *ngIf="!loading"></i>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <p class="mt-4 mb-0 text-center">Pas encore de compte ? <a [routerLink]="['/register']" [queryParams]="registerQueryParams" class="fw-bold">S'inscrire</a></p>

        <div class="border-top mt-4 pt-3">
          <small class="text-muted d-block">Comptes de démonstration (mot de passe : <code>password</code>) :</small>
          <small class="text-muted d-block">admin&#64;sugnuhotel.test · reception&#64;sugnuhotel.test · client&#64;sugnuhotel.test</small>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loading = false;
  errorMessage = '';
  heroImage = HERO_IMAGE;
  returnUrl: string | null = null;
  registerQueryParams: Record<string, string> = {};

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // On préserve un éventuel "retour à" (ex: arrivé ici depuis une tentative de réservation),
    // et on transmet les mêmes paramètres au lien "S'inscrire" pour ne pas perdre le contexte.
    this.route.snapshot.queryParamMap.keys.forEach((key) => {
      this.registerQueryParams[key] = this.route.snapshot.queryParamMap.get(key) ?? '';
    });
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: (res) => {
        this.loading = false;

        if (this.returnUrl) {
          this.router.navigateByUrl(this.buildReturnUrl());
          return;
        }
        // Redirection intelligente selon le rôle si aucun retour spécifique n'était attendu
        if (res.user.role === 'admin') this.router.navigate(['/admin/dashboard']);
        else if (res.user.role === 'receptionist') this.router.navigate(['/staff/dashboard']);
        else this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? 'Identifiants incorrects.';
      },
    });
  }

  private buildReturnUrl(): string {
    const params = { ...this.registerQueryParams };
    delete params['returnUrl'];
    const query = new URLSearchParams(params).toString();
    return query ? `${this.returnUrl}?${query}` : (this.returnUrl as string);
  }
}
