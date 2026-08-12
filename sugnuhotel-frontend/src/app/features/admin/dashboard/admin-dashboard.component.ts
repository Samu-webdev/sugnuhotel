import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h4 class="mb-4">Tableau de bord administrateur</h4>

    <div class="row g-3 mb-4" *ngIf="stats">
      <div class="col"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ stats.total_rooms }}</div><small class="text-muted">Chambres</small></div></div>
      <div class="col"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ stats.total_users }}</div><small class="text-muted">Clients</small></div></div>
      <div class="col"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ stats.arrivals_today }}</div><small class="text-muted">Arrivées aujourd'hui</small></div></div>
      <div class="col"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ stats.departures_today }}</div><small class="text-muted">Départs aujourd'hui</small></div></div>
      <div class="col"><div class="card shadow-sm text-center p-3"><div class="fs-3">{{ stats.occupancy_rate }}%</div><small class="text-muted">Taux d'occupation</small></div></div>
    </div>

    <div class="row g-3">
      <div class="col-md-3"><a class="btn btn-outline-dark w-100" routerLink="/admin/room-types">Types de chambres</a></div>
      <div class="col-md-3"><a class="btn btn-outline-dark w-100" routerLink="/admin/rooms">Chambres</a></div>
      <div class="col-md-3"><a class="btn btn-outline-dark w-100" routerLink="/admin/services">Services</a></div>
      <div class="col-md-3"><a class="btn btn-outline-dark w-100" routerLink="/admin/users">Utilisateurs</a></div>
      <div class="col-md-3"><a class="btn btn-outline-dark w-100" routerLink="/staff/dashboard">Espace personnel</a></div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  stats: any;
  constructor(private adminService: AdminService) {}
  ngOnInit(): void {
    this.adminService.dashboard().subscribe((res) => (this.stats = res));
  }
}
