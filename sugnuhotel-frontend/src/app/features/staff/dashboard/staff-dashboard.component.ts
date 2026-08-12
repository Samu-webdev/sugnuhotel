import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StaffService, StaffDashboardData } from '../../../core/services/staff.service';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h4 class="mb-4">Tableau de bord — Réception</h4>

    <div class="row g-3 mb-4" *ngIf="data as d">
      <div class="col-md-4"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ d.arrivals.data.length }}</div><small>Arrivées aujourd'hui</small></div></div>
      <div class="col-md-4"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ d.departures.data.length }}</div><small>Départs aujourd'hui</small></div></div>
      <div class="col-md-4"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ d.occupancy_rate }}%</div><small>Taux d'occupation</small></div></div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-4"><a class="btn btn-outline-dark w-100" routerLink="/staff/reservations">Rechercher réservations</a></div>
      <div class="col-md-4"><a class="btn btn-outline-dark w-100" routerLink="/staff/reservations/calendar">Vue calendrier</a></div>
      <div class="col-md-4"><a class="btn btn-outline-dark w-100" routerLink="/staff/reservations/new">Nouvelle réservation</a></div>
    </div>

    <div class="row" *ngIf="data as d">
      <div class="col-md-6">
        <h6>Arrivées du jour</h6>
        <table class="table bg-white shadow-sm">
          <thead><tr><th>Client</th><th>Chambre</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let r of d.arrivals.data">
              <td>{{ r.user?.name }}</td>
              <td>{{ r.room.room_number }}</td>
              <td><span class="badge badge-status-{{ r.status }}">{{ r.status }}</span></td>
              <td><button class="btn btn-sm btn-success" (click)="checkIn(r.id)">Check-in</button></td>
            </tr>
            <tr *ngIf="d.arrivals.data.length === 0"><td colspan="4" class="text-muted">Aucune arrivée aujourd'hui.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="col-md-6">
        <h6>Départs du jour</h6>
        <table class="table bg-white shadow-sm">
          <thead><tr><th>Client</th><th>Chambre</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let r of d.departures.data">
              <td>{{ r.user?.name }}</td>
              <td>{{ r.room.room_number }}</td>
              <td><button class="btn btn-sm btn-secondary" (click)="checkOut(r.id)">Check-out</button></td>
            </tr>
            <tr *ngIf="d.departures.data.length === 0"><td colspan="3" class="text-muted">Aucun départ aujourd'hui.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StaffDashboardComponent implements OnInit {
  data?: StaffDashboardData;

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.staffService.dashboard().subscribe((res) => (this.data = res));
  }

  checkIn(id: number): void {
    this.staffService.checkIn(id).subscribe(() => this.load());
  }

  checkOut(id: number): void {
    this.staffService.checkOut(id).subscribe(() => this.load());
  }
}
