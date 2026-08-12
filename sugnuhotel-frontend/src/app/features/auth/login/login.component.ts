import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h4 class="mb-3">Connexion</h4>

            <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mot de passe</label>
                <input type="password" formControlName="password" class="form-control" required>
              </div>
              <button class="btn btn-dark w-100" [disabled]="form.invalid || loading">
                {{ loading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </form>

            <p class="mt-3 mb-0">Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
            <hr>
            <small class="text-muted">
              Comptes de démo (mot de passe : <code>password</code>) :<br>
              admin&#64;sugnuhotel.test · reception&#64;sugnuhotel.test · client&#64;sugnuhotel.test
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loading = false;
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: (res) => {
        this.loading = false;
        // Redirection intelligente selon le rôle, comme dans la version Blade
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
}
