import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { HotelService } from '../../../core/models/service.model';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Services additionnels</h4>
      <button class="btn btn-dark" (click)="startCreate()">+ Nouveau service</button>
    </div>

    <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

    <div class="card shadow-sm p-4 mb-4" *ngIf="showForm">
      <h6>{{ editingId ? 'Modifier' : 'Nouveau' }} service</h6>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-3"><label class="form-label">Nom</label><input class="form-control" formControlName="name" required></div>
        <div class="mb-3"><label class="form-label">Description</label><textarea class="form-control" formControlName="description" rows="2"></textarea></div>
        <div class="mb-3"><label class="form-label">Prix (FCFA)</label><input type="number" class="form-control" formControlName="price" required></div>
        <div class="form-check mb-3">
          <input type="checkbox" class="form-check-input" formControlName="is_active" id="isActive">
          <label class="form-check-label" for="isActive">Actif</label>
        </div>
        <button class="btn btn-dark me-2" [disabled]="form.invalid">Enregistrer</button>
        <button class="btn btn-outline-secondary" type="button" (click)="showForm = false">Annuler</button>
      </form>
    </div>

    <table class="table bg-white shadow-sm">
      <thead><tr><th>Nom</th><th>Prix</th><th>Actif</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let service of services">
          <td>{{ service.name }}</td>
          <td>{{ service.price | number:'1.0-0' }} FCFA</td>
          <td>{{ service.is_active ? 'Oui' : 'Non' }}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" (click)="startEdit(service)">Modifier</button>
            <button class="btn btn-sm btn-outline-danger" (click)="remove(service)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class AdminServicesComponent implements OnInit {
  services: HotelService[] = [];
  showForm = false;
  editingId: number | null = null;
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    is_active: [true],
  });

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.services().subscribe((res) => (this.services = res.data));
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({ price: 0, is_active: true });
    this.showForm = true;
  }

  startEdit(service: HotelService): void {
    this.editingId = service.id;
    this.form.patchValue(service);
    this.showForm = true;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    const request$ = this.editingId
      ? this.adminService.updateService(this.editingId, this.form.getRawValue())
      : this.adminService.createService(this.form.getRawValue());

    request$.subscribe({
      next: () => {
        this.showForm = false;
        this.load();
      },
      error: (err) => (this.errorMessage = err.error?.message ?? 'Erreur lors de l’enregistrement.'),
    });
  }

  remove(service: HotelService): void {
    if (!confirm('Supprimer ce service ?')) return;
    this.adminService.deleteService(service.id).subscribe(() => this.load());
  }
}
