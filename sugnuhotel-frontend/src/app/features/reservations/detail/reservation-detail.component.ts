import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-detail',
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
          <p><strong>Chambre :</strong> {{ r.room.room_type.name }} n°{{ r.room.room_number }}</p>
          <p><strong>Séjour :</strong> {{ r.check_in_date | date:'dd/MM/yyyy' }} au {{ r.check_out_date | date:'dd/MM/yyyy' }} ({{ r.nights }} nuit(s))</p>
          <p><strong>Voyageurs :</strong> {{ r.number_of_adults }} adulte(s), {{ r.number_of_children }} enfant(s)</p>

          <div *ngIf="r.services?.length">
            <strong>Services :</strong>
            <ul>
              <li *ngFor="let s of r.services">{{ s.name }} × {{ s.quantity }} — {{ s.price * s.quantity | number:'1.0-0' }} FCFA</li>
            </ul>
          </div>

          <p *ngIf="r.special_requests"><strong>Demandes particulières :</strong> {{ r.special_requests }}</p>
          <p class="fs-5"><strong>Total : {{ r.total_price | number:'1.0-0' }} FCFA</strong></p>
        </div>
      </div>

      <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

      <button class="btn btn-outline-danger" *ngIf="r.status === 'pending' || r.status === 'confirmed'" (click)="cancel()">
        Annuler la réservation
      </button>

      <a routerLink="/my-reservations" class="btn btn-link">&larr; Retour à mes réservations</a>
    </div>
  `,
})
export class ReservationDetailComponent implements OnInit {
  reservation?: Reservation;
  errorMessage = '';

  constructor(private route: ActivatedRoute, private reservationService: ReservationService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reservationService.show(id).subscribe((res) => (this.reservation = res.data));
  }

  cancel(): void {
    if (!this.reservation || !confirm("Confirmer l'annulation ?")) return;

    this.reservationService.cancel(this.reservation.id).subscribe({
      next: (res) => (this.reservation = res.data),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Impossible d’annuler cette réservation.'),
    });
  }
}
