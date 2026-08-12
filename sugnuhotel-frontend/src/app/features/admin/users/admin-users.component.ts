import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { User, Role } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Utilisateurs</h4>
      <button class="btn btn-dark" (click)="showForm = !showForm">+ Nouveau compte personnel</button>
    </div>

    <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

    <div class="card shadow-sm p-4 mb-4" *ngIf="showForm">
      <h6>Nouveau compte personnel</h6>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-3"><label class="form-label">Nom</label><input class="form-control" formControlName="name" required></div>
        <div class="mb-3"><label class="form-label">Email</label><input type="email" class="form-control" formControlName="email" required></div>
        <div class="mb-3"><label class="form-label">Téléphone</label><input class="form-control" formControlName="phone"></div>
        <div class="mb-3">
          <label class="form-label">Rôle</label>
          <select class="form-select" formControlName="role" required>
            <option value="receptionist">Réceptionniste</option>
            <option value="admin">Administrateur</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div class="mb-3"><label class="form-label">Mot de passe</label><input type="password" class="form-control" formControlName="password" required></div>
        <div class="mb-3"><label class="form-label">Confirmer</label><input type="password" class="form-control" formControlName="password_confirmation" required></div>
        <button class="btn btn-dark" [disabled]="form.invalid">Créer</button>
      </form>
    </div>

    <table class="table bg-white shadow-sm">
      <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            <select class="form-select form-select-sm" [value]="user.role" (change)="changeRole(user, $event)">
              <option value="client">client</option>
              <option value="receptionist">receptionist</option>
              <option value="admin">admin</option>
            </select>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger" *ngIf="user.id !== currentUserId" (click)="remove(user)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  showForm = false;
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['receptionist' as Role, Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required],
  });

  get currentUserId(): number | undefined {
    return this.auth.currentUser()?.id;
  }

  constructor(private fb: FormBuilder, private adminService: AdminService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.users().subscribe((res) => (this.users = res.data));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    this.adminService.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.showForm = false;
        this.form.reset({ role: 'receptionist' });
        this.load();
      },
      error: (err) => (this.errorMessage = err.error?.message ?? 'Erreur lors de la création.'),
    });
  }

  changeRole(user: User, event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    this.adminService.updateUserRole(user.id, role).subscribe(() => this.load());
  }

  remove(user: User): void {
    if (!confirm('Supprimer ce compte ?')) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => this.load(),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Suppression impossible.'),
    });
  }
}
