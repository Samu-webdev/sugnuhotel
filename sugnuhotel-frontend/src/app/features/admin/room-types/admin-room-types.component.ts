import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { RoomType } from '../../../core/models/room.model';

/**
 * CRUD "types de chambres" dans une seule page : tableau + formulaire (créer/modifier)
 * affiché/masqué selon le contexte. C'est le pattern qu'on réutilise à l'identique
 * pour les Chambres et les Services (mêmes 4 opérations : index/store/update/destroy).
 */
@Component({
  selector: 'app-admin-room-types',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Types de chambres</h4>
      <button class="btn btn-dark" (click)="startCreate()">+ Nouveau type</button>
    </div>

    <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

    <div class="card shadow-sm p-4 mb-4" *ngIf="showForm">
      <h6>{{ editingId ? 'Modifier' : 'Nouveau' }} type de chambre</h6>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="mb-3"><label class="form-label">Nom</label><input class="form-control" formControlName="name" required></div>
        <div class="mb-3"><label class="form-label">Description</label><textarea class="form-control" formControlName="description" rows="2"></textarea></div>
        <div class="mb-3"><label class="form-label">Prix de base (FCFA)</label><input type="number" class="form-control" formControlName="base_price" required></div>
        <div class="mb-3"><label class="form-label">Capacité max.</label><input type="number" class="form-control" formControlName="max_occupancy" required></div>
        <div class="mb-3"><label class="form-label">Photo</label><input type="file" class="form-control" (change)="onFile($event)" accept="image/*"></div>
        <button class="btn btn-dark me-2" [disabled]="form.invalid">Enregistrer</button>
        <button class="btn btn-outline-secondary" type="button" (click)="showForm = false">Annuler</button>
      </form>
    </div>

    <table class="table bg-white shadow-sm">
      <thead><tr><th>Nom</th><th>Prix de base</th><th>Capacité</th><th>Nb chambres</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let type of roomTypes">
          <td>{{ type.name }}</td>
          <td>{{ type.base_price | number:'1.0-0' }} FCFA</td>
          <td>{{ type.max_occupancy }}</td>
          <td>{{ type.rooms_count }}</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" (click)="startEdit(type)">Modifier</button>
            <button class="btn btn-sm btn-outline-danger" (click)="remove(type)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class AdminRoomTypesComponent implements OnInit {
  roomTypes: RoomType[] = [];
  showForm = false;
  editingId: number | null = null;
  selectedFile: File | null = null;
  errorMessage = '';

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    base_price: [0, [Validators.required, Validators.min(0)]],
    max_occupancy: [1, [Validators.required, Validators.min(1)]],
  });

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.adminService.roomTypes().subscribe((res) => (this.roomTypes = res.data));
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({ base_price: 0, max_occupancy: 1 });
    this.selectedFile = null;
    this.showForm = true;
  }

  startEdit(type: RoomType): void {
    this.editingId = type.id;
    this.form.patchValue({
      name: type.name,
      description: type.description,
      base_price: type.base_price,
      max_occupancy: type.max_occupancy,
    });
    this.selectedFile = null;
    this.showForm = true;
  }

  onFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    // On envoie du multipart/form-data (nécessaire pour l'upload de fichier)
    const formData = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([key, value]) => formData.append(key, String(value ?? '')));
    if (this.selectedFile) formData.append('image', this.selectedFile);

    const request$ = this.editingId
      ? this.adminService.updateRoomType(this.editingId, formData)
      : this.adminService.createRoomType(formData);

    request$.subscribe({
      next: () => {
        this.showForm = false;
        this.load();
      },
      error: (err) => (this.errorMessage = err.error?.message ?? 'Erreur lors de l’enregistrement.'),
    });
  }

  remove(type: RoomType): void {
    if (!confirm('Supprimer ce type ?')) return;
    this.adminService.deleteRoomType(type.id).subscribe({
      next: () => this.load(),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Suppression impossible.'),
    });
  }
}
