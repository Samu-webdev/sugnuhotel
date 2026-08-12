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

    <table class="table bg-white shadow-sm">
      <thead><tr><th>N°</th><th>Client</th><th>Chambre</th><th>Arrivée</th><th>Départ</th><th>Statut</th><th></th></tr></thead>
      <tbody>
        <tr *ngFor="let r of reservations">
          <td>{{ r.reservation_number }}</td>
          <td>{{ r.user?.name }}</td>
          <td>{{ r.room.room_number }}</td>
          <td>{{ r.check_in_date | date:'dd/MM/yyyy' }}</td>
          <td>{{ r.check_out_date | date:'dd/MM/yyyy' }}</td>
          <td><span class="badge badge-status-{{ r.status }}">{{ r.status }}</span></td>
          <td><a [routerLink]="['/staff/reservations', r.id]" class="btn btn-sm btn-outline-dark">Voir</a></td>
        </tr>
      </tbody>
    </table>
  `,
})
export class StaffReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  statuses: ReservationStatus[] = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  filterForm = this.fb.group({ q: [''], date: [''], status: [''] });

  constructor(private fb: FormBuilder, private staffService: StaffService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.staffService.search(this.filterForm.getRawValue() as any).subscribe((res) => (this.reservations = res.data));
  }
}
