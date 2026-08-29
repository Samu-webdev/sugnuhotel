import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1498121957837-60d97c66df4d?w=1200&q=80&auto=format&fit=crop';

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
    <div class="row justify-content-center g-0 shadow-sm rounded-4 overflow-hidden" style="max-width: 960px; margin: 0 auto;">
      <div class="col-md-5 d-none d-md-flex flex-column justify-content-end text-white p-4"
           style="min-height: 560px; background-size: cover; background-position: center;"
           [style.background-image]="'linear-gradient(180deg, rgba(44,30,20,.15), rgba(44,30,20,.85)), url(' + heroImage + ')'">
        <span class="sh-badge-pill mb-3 align-self-start"><i class="fa-solid fa-sun"></i> La Teranga vous accueille</span>
        <h3 class="fw-bold">Rejoignez SugnuHotel</h3>
        <p class="small mb-0 opacity-75">
          {{ returnUrl ? 'Créez votre compte pour finaliser votre réservation.' : 'Créez votre compte pour réserver en quelques clics.' }}
        </p>
      </div>

      <div class="col-md-7 bg-white p-4 p-md-5">
        <h4 class="mb-1 fw-bold">Créer un compte</h4>
        <p class="text-muted small mb-4" *ngIf="returnUrl">Encore une étape avant de confirmer votre chambre.</p>
        <p class="text-muted small mb-4" *ngIf="!returnUrl">Rapide et gratuit.</p>

        <div class="alert alert-danger py-2" *ngIf="errorMessage">{{ errorMessage }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Nom complet</label>
              <input type="text" formControlName="name" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Téléphone</label>
              <input type="text" formControlName="phone" class="form-control">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" formControlName="email" class="form-control" required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Mot de passe</label>
              <input type="password" formControlName="password" class="form-control" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Confirmer</label>
              <input type="password" formControlName="password_confirmation" class="form-control" required>
            </div>
          </div>
          <div class="text-danger small mb-3" *ngIf="form.errors?.['mismatch'] && form.get('password_confirmation')?.touched">
            Les mots de passe ne correspondent pas.
          </div>
          <button class="btn btn-dark w-100 py-2" [disabled]="form.invalid || loading">
            {{ loading ? 'Inscription...' : (returnUrl ? "Créer mon compte et continuer" : "S'inscrire") }}
          </button>
        </form>

        <p class="mt-4 mb-0 text-center">Déjà un compte ? <a [routerLink]="['/login']" [queryParams]="loginQueryParams" class="fw-bold">Se connecter</a></p>
      </div>
    </div>
  `,
})
export class RegisterComponent implements OnInit {
  loading = false;
  errorMessage = '';
  heroImage = HERO_IMAGE;
  returnUrl: string | null = null;
  loginQueryParams: Record<string, string> = {};

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  }, { validators: passwordsMatch });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.snapshot.queryParamMap.keys.forEach((key) => {
      this.loginQueryParams[key] = this.route.snapshot.queryParamMap.get(key) ?? '';
    });
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.register(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading = false;
        // L'inscription connecte automatiquement l'utilisateur (voir AuthController::register côté API) :
        // s'il venait d'un parcours de réservation, on le renvoie directement dessus, dates et chambre conservées.
        if (this.returnUrl) {
          const params = { ...this.loginQueryParams };
          delete params['returnUrl'];
          const query = new URLSearchParams(params).toString();
          this.router.navigateByUrl(query ? `${this.returnUrl}?${query}` : this.returnUrl);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message ?? "Une erreur est survenue lors de l'inscription.";
      },
    });
  }
}
