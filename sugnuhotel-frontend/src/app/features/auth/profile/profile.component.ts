import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h4 class="mb-3">Mon profil</h4>
        <div class="alert alert-success" *ngIf="status">{{ status }}</div>
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <form [formGroup]="form" (ngSubmit)="submit()">
              <div class="mb-3"><label class="form-label">Nom</label><input class="form-control" formControlName="name"></div>
              <div class="mb-3"><label class="form-label">Email</label><input class="form-control" formControlName="email"></div>
              <div class="mb-3"><label class="form-label">Téléphone</label><input class="form-control" formControlName="phone"></div>
              <div class="mb-3"><label class="form-label">Adresse</label><input class="form-control" formControlName="address"></div>
              <p><span class="badge bg-secondary">Rôle : {{ auth.currentUser()?.role }}</span></p>
              <button class="btn btn-dark">Enregistrer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  status = '';
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    phone: [''],
    address: [''],
  });

  constructor(private fb: FormBuilder, public auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.form.patchValue({ name: user.name, email: user.email, phone: user.phone, address: user.address });
    }
  }

  submit(): void {
    this.http.patch(`${environment.apiUrl}/profile`, this.form.getRawValue()).subscribe((user: any) => {
      this.auth.currentUser.set(user.data ?? user);
      this.status = 'Profil mis à jour avec succès.';
    });
  }
}
