import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { Reservation, ReservationStatus } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-staff-reservation-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h4 class="mb-3">Toutes les réservations</h4>

    <div class="alert alert-danger py-2" *ngIf="errorMessage">{{ errorMessage }}</div>

    <form [formGroup]="filterForm" (ngSubmit)="search()" class="row g-2 mb-3">
      <div class="col-md-4">
        <input type="text" formControlName="q" class="form-control" placeholder="Nom, numéro, chambre...">
      </div>
      <div class="col-md-3">
        <input type="date" formControlName="date" class="form-control">
      </div>
      <div class="col-md-3">
        <select formControlName="status" class="form-select">
          <option value="">Tous statuts</option>
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>
      </div>
      <div class="col-md-2"><button class="btn btn-dark w-100">Filtrer</button></div>
    </form>

    <table class="table bg-white shadow-sm align-middle">
      <thead><tr><th>N°</th><th>Client</th><th>Chambre</th><th>Arrivée</th><th>Départ</th><th>Statut</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let r of reservations">
          <td>{{ r.reservation_number }}</td>
          <td>{{ r.user?.name }}</td>
          <td>{{ r.room.room_number }}</td>
          <td>{{ r.check_in_date | date:'dd/MM/yyyy' }}</td>
          <td>{{ r.check_out_date | date:'dd/MM/yyyy' }}</td>
          <td><span class="badge badge-status-{{ r.status }}">{{ r.status }}</span></td>
          <td class="text-end">
            <a [routerLink]="['/staff/reservations', r.id]" class="btn btn-sm btn-outline-dark me-1">Voir</a>
            <!-- Suppression définitive : uniquement visible pour une réservation déjà annulée -->
            <button *ngIf="r.status === 'cancelled'" class="btn btn-sm btn-outline-danger" (click)="deletePermanently(r)">
              <i class="fa-solid fa-trash"></i> Supprimer
            </button>
          </td>
        </tr>
        <tr *ngIf="reservations.length === 0">
          <td colspan="7" class="text-muted text-center py-4">Aucune réservation ne correspond à ces critères.</td>
        </tr>
      </tbody>
    </table>
  `,
})
export class StaffReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  statuses: ReservationStatus[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];
  errorMessage = '';

  filterForm = this.fb.group({ q: [''], date: [''], status: [''] });

  constructor(private fb: FormBuilder, private staffService: StaffService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.staffService.search(this.filterForm.getRawValue() as any).subscribe((res) => (this.reservations = res.data));
  }

  deletePermanently(reservation: Reservation): void {
    if (!confirm(`Supprimer définitivement la réservation ${reservation.reservation_number} ? Cette action est irréversible.`)) {
      return;
    }
    this.errorMessage = '';
    this.staffService.deletePermanently(reservation.id).subscribe({
      next: () => this.search(),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Suppression impossible.'),
    });
  }
}
