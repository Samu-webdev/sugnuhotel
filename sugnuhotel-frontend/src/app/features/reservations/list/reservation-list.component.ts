import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, TimeStatus } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h4 class="mb-4">Mes réservations</h4>

    <ng-container *ngFor="let group of groups">
      <ng-container *ngIf="grouped[group.key]?.length">
        <h6 class="text-muted mt-4">{{ group.label }}</h6>
        <div class="table-responsive">
          <table class="table bg-white shadow-sm">
            <thead><tr><th>N°</th><th>Chambre</th><th>Arrivée</th><th>Départ</th><th>Total</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              <tr *ngFor="let r of grouped[group.key]">
                <td>{{ r.reservation_number }}</td>
                <td>{{ r.room.room_type.name }} n°{{ r.room.room_number }}</td>
                <td>{{ r.check_in_date | date:'dd/MM/yyyy' }}</td>
                <td>{{ r.check_out_date | date:'dd/MM/yyyy' }}</td>
                <td>{{ r.total_price | number:'1.0-0' }} FCFA</td>
                <td><span class="badge badge-status-{{ r.status }}">{{ r.status }}</span></td>
                <td><a [routerLink]="['/my-reservations', r.id]" class="btn btn-sm btn-outline-dark">Détails</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </ng-container>

    <div class="alert alert-info" *ngIf="loaded && reservations.length === 0">
      Vous n'avez pas encore de réservation. <a routerLink="/">Réserver maintenant</a>.
    </div>
  `,
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  grouped: Record<string, Reservation[]> = {};
  loaded = false;

  groups: { key: TimeStatus; label: string }[] = [
    { key: 'current', label: 'En cours' },
    { key: 'upcoming', label: 'À venir' },
    { key: 'past', label: 'Passées' },
    { key: 'cancelled', label: 'Annulées' },
  ];

  constructor(private reservationService: ReservationService) {}

  ngOnInit(): void {
    this.reservationService.myReservations().subscribe((res) => {
      this.reservations = res.data;
      this.grouped = {};
      for (const r of this.reservations) {
        (this.grouped[r.time_status] ??= []).push(r);
      }
      this.loaded = true;
    });
  }
}
