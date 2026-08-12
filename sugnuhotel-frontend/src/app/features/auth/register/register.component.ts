import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Validateur custom : vérifie que password === password_confirmation
function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  return password === confirmation ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h4 class="mb-3">Créer un compte client</h4>

            <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="mb-3">
                <label class="form-label">Nom complet</label>
                <input type="text" formControlName="name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" formControlName="email" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Téléphone</label>
                <input type="text" formControlName="phone" class="form-control">
              </div>
              <div class="mb-3">
                <label class="form-label">Mot de passe</label>
                <input type="password" formControlName="password" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Confirmer le mot de passe</label>
                <input type="password" formControlName="password_confirmation" class="form-control" required>
                <div class="text-danger small" *ngIf="form.errors?.['mismatch'] && form.get('password_confirmation')?.touched">
                  Les mots de passe ne correspondent pas.
                </div>
              </div>
              <button class="btn btn-dark w-100" [disabled]="form.invalid || loading">
                {{ loading ? 'Inscription...' : "S'inscrire" }}
              </button>
            </form>

            <p class="mt-3 mb-0">Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  loading = false;
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  }, { validators: passwordsMatch });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? "Une erreur est survenue lors de l'inscription.";
      },
    });
  }
}
