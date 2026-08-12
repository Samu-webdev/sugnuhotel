import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Room, RoomType, RoomStatus } from '../../../core/models/room.model';

@Component({
  selector: 'app-admin-rooms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Chambres</h4>
      <button class="btn btn-dark" (click)="startCreate()">+ Nouvelle chambre</button>
    </div>

    <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

    <div class="card shadow-sm p-4 mb-4" *ngIf="showForm">
      <h6>{{ editingId ? 'Modifier' : 'Nouvelle' }} chambre</h6>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Numéro de chambre</label>
            <input class="form-control" formControlName="room_number" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Type de chambre</label>
            <select class="form-select" formControlName="room_type_id" required>
              <option *ngFor="let t of roomTypes" [value]="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Étage</label>
            <input type="number" class="form-control" formControlName="floor" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Prix / nuit (FCFA)</label>
            <input type="number" class="form-control" formControlName="price_per_night" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Capacité max.</label>
            <input type="number" class="form-control" formControlName="max_occupancy" required>
          </div>
          <div class="col-md-4">
            <label class="form-label">Statut</label>
            <select class="form-select" formControlName="status" required>
              <option value="available">Disponible</option>
              <option value="occupied">Occupée</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Hors service</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Équipements (séparés par des virgules)</label>
            <input class="form-control" formControlName="amenities" placeholder="Wifi, Climatisation, TV">
          </div>
          <div class="col-md-6">
            <label class="form-label">Photos (plusieurs possibles)</label>
            <input type="file" class="form-control" multiple accept="image/*" (change)="onFiles($event)">
          </div>
        </div>
        <button class="btn btn-dark mt-3 me-2" [disabled]="form.invalid">Enregistrer</button>
        <button class="btn btn-outline-secondary mt-3" type="button" (click)="showForm = false">Annuler</button>
      </form>
    </div>

    <table class="table bg-white shadow-sm">
      <thead><tr><th>N°</th><th>Type</th><th>Étage</th><th>Prix/nuit</th><th>Capacité</th><th>Statut</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let room of rooms">
          <td>{{ room.room_number }}</td>
          <td>{{ room.room_type.name }}</td>
          <td>{{ room.floor }}</td>
          <td>{{ room.price_per_night | number:'1.0-0' }} FCFA</td>
          <td>{{ room.max_occupancy }}</td>
          <td><span class="badge bg-secondary">{{ room.status }}</span></td>
          <td>
            <button class="btn btn-sm btn-outline-secondary me-1" (click)="startEdit(room)">Modifier</button>
            <button class="btn btn-sm btn-outline-danger" (click)="remove(room)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
})
export class AdminRoomsComponent implements OnInit {
  rooms: Room[] = [];
  roomTypes: RoomType[] = [];
  showForm = false;
  editingId: number | null = null;
  selectedFiles: FileList | null = null;
  errorMessage = '';

  form = this.fb.group({
    room_number: ['', Validators.required],
    room_type_id: [null as number | null, Validators.required],
    floor: [0, Validators.required],
    price_per_night: [0, [Validators.required, Validators.min(0)]],
    max_occupancy: [1, [Validators.required, Validators.min(1)]],
    status: ['available' as RoomStatus, Validators.required],
    amenities: [''],
  });

  constructor(private fb: FormBuilder, private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
    this.adminService.roomTypes().subscribe((res) => (this.roomTypes = res.data));
  }

  load(): void {
    this.adminService.rooms().subscribe((res) => (this.rooms = res.data));
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({ floor: 0, price_per_night: 0, max_occupancy: 1, status: 'available', amenities: '' });
    this.selectedFiles = null;
    this.showForm = true;
  }

  startEdit(room: Room): void {
    this.editingId = room.id;
    this.form.patchValue({
      room_number: room.room_number,
      room_type_id: room.room_type.id,
      floor: room.floor,
      price_per_night: room.price_per_night,
      max_occupancy: room.max_occupancy,
      status: room.status,
      amenities: (room.amenities ?? []).join(', '),
    });
    this.selectedFiles = null;
    this.showForm = true;
  }

  onFiles(event: Event): void {
    this.selectedFiles = (event.target as HTMLInputElement).files;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.errorMessage = '';

    const formData = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([key, value]) => formData.append(key, String(value ?? '')));
    if (this.selectedFiles) {
      Array.from(this.selectedFiles).forEach((file) => formData.append('images[]', file));
    }

    const request$ = this.editingId
      ? this.adminService.updateRoom(this.editingId, formData)
      : this.adminService.createRoom(formData);

    request$.subscribe({
      next: () => {
        this.showForm = false;
        this.load();
      },
      error: (err) => (this.errorMessage = err.error?.message ?? 'Erreur lors de l’enregistrement.'),
    });
  }

  remove(room: Room): void {
    if (!confirm('Supprimer cette chambre ?')) return;
    this.adminService.deleteRoom(room.id).subscribe({
      next: () => this.load(),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Suppression impossible.'),
    });
  }
}
