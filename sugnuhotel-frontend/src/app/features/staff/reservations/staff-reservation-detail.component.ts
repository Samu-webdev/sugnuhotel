import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StaffService } from '../../../core/services/staff.service';
import { Reservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-staff-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="reservation as r">
      <h4 class="mb-3">
        Réservation {{ r.reservation_number }}
        <span class="badge badge-status-{{ r.status }}">{{ r.status }}</span>
      </h4>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <p><strong>Client :</strong> {{ r.user?.name }} ({{ r.user?.email }})</p>
          <p><strong>Chambre :</strong> {{ r.room.room_type.name }} n°{{ r.room.room_number }}</p>
          <p><strong>Séjour :</strong> {{ r.check_in_date | date:'dd/MM/yyyy' }} au {{ r.check_out_date | date:'dd/MM/yyyy' }} ({{ r.nights }} nuit(s))</p>
          <p><strong>Voyageurs :</strong> {{ r.number_of_adults }} adulte(s), {{ r.number_of_children }} enfant(s)</p>
          <div *ngIf="r.services?.length">
            <strong>Services :</strong>
            <ul><li *ngFor="let s of r.services">{{ s.name }} × {{ s.quantity }}</li></ul>
          </div>
          <p class="fs-5"><strong>Total : {{ r.total_price | number:'1.0-0' }} FCFA</strong></p>
        </div>
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <a [routerLink]="['/staff/reservations', r.id, 'edit']" class="btn btn-outline-dark">Modifier</a>

        <button class="btn btn-success" *ngIf="r.status === 'confirmed'" (click)="checkIn()">Check-in</button>
        <button class="btn btn-secondary" *ngIf="r.status === 'checked_in'" (click)="checkOut()">Check-out</button>
        <button class="btn btn-outline-danger" *ngIf="r.status !== 'cancelled' && r.status !== 'checked_out'" (click)="cancel()">Annuler</button>
      </div>
    </div>
  `,
})
export class StaffReservationDetailComponent implements OnInit {
  reservation?: Reservation;

  constructor(private route: ActivatedRoute, private staffService: StaffService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.staffService.show(id).subscribe((res) => (this.reservation = res.data));
  }

  checkIn(): void {
    if (this.reservation) this.staffService.checkIn(this.reservation.id).subscribe(() => this.load());
  }

  checkOut(): void {
    if (this.reservation) this.staffService.checkOut(this.reservation.id).subscribe(() => this.load());
  }

  cancel(): void {
    if (this.reservation && confirm('Annuler cette réservation ?')) {
      this.staffService.cancel(this.reservation.id).subscribe(() => this.load());
    }
  }
}
