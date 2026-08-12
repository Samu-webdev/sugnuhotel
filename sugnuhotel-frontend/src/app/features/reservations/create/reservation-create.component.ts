import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { Room } from '../../../core/models/room.model';
import { HotelService } from '../../../core/models/service.model';

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div *ngIf="room">
      <h4 class="mb-3">Réserver — {{ room.room_type.name }} n°{{ room.room_number }}</h4>

      <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

      <div class="row">
        <div class="col-md-8">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="card shadow-sm mb-3">
              <div class="card-body">
                <h6 class="card-title">Dates du séjour</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Arrivée</label>
                    <input type="date" formControlName="check_in_date" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Départ</label>
                    <input type="date" formControlName="check_out_date" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Adultes</label>
                    <input type="number" formControlName="number_of_adults" class="form-control" min="1" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Enfants</label>
                    <input type="number" formControlName="number_of_children" class="form-control" min="0">
                  </div>
                </div>
                <small class="text-muted">Capacité maximum de la chambre : {{ room.max_occupancy }} personnes.</small>
              </div>
            </div>

            <div class="card shadow-sm mb-3" *ngIf="services.length">
              <div class="card-body">
                <h6 class="card-title">Services additionnels</h6>
                <div class="row g-2 align-items-center mb-2" *ngFor="let service of services">
                  <div class="col-auto">
                    <input type="checkbox" class="form-check-input" [checked]="isSelected(service.id)" (change)="toggleService(service.id, $event)">
                  </div>
                  <div class="col">
                    {{ service.name }} <span class="text-muted small">({{ service.price | number:'1.0-0' }} FCFA)</span>
                  </div>
                  <div class="col-auto">
                    <input type="number" class="form-control form-control-sm" style="width:80px" min="1"
                           [value]="quantities[service.id] || 1" (input)="setQuantity(service.id, $event)">
                  </div>
                </div>
              </div>
            </div>

            <div class="card shadow-sm mb-3">
              <div class="card-body">
                <label class="form-label">Demandes particulières (optionnel)</label>
                <textarea formControlName="special_requests" class="form-control" rows="3"></textarea>
              </div>
            </div>

            <button class="btn btn-dark btn-lg" [disabled]="form.invalid || submitting">
              {{ submitting ? 'Envoi...' : 'Confirmer la réservation' }}
            </button>
          </form>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h6>Résumé</h6>
              <p class="mb-1">{{ room.room_type.name }} — Chambre {{ room.room_number }}</p>
              <p class="mb-1">Prix : {{ room.price_per_night | number:'1.0-0' }} FCFA / nuit</p>
              <p class="text-muted small">Le prix total (nuits × prix + services) est calculé automatiquement par le serveur à la confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReservationCreateComponent implements OnInit {
  room!: Room;
  services: HotelService[] = [];
  selectedServices = new Set<number>();
  quantities: Record<number, number> = {};
  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    check_in_date: ['', Validators.required],
    check_out_date: ['', Validators.required],
    number_of_adults: [1, [Validators.required, Validators.min(1)]],
    number_of_children: [0],
    special_requests: [''],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private roomService: RoomService,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    const roomId = Number(this.route.snapshot.paramMap.get('roomId'));
    const qp = this.route.snapshot.queryParamMap;

    this.form.patchValue({
      check_in_date: qp.get('check_in_date') ?? '',
      check_out_date: qp.get('check_out_date') ?? '',
      number_of_adults: Number(qp.get('adults') ?? 1),
      number_of_children: Number(qp.get('children') ?? 0),
    });

    this.roomService.getBookingData(roomId).subscribe((res) => {
      this.room = res.room;
      this.services = res.services.data;
    });
  }

  isSelected(id: number): boolean {
    return this.selectedServices.has(id);
  }

  toggleService(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    checked ? this.selectedServices.add(id) : this.selectedServices.delete(id);
  }

  setQuantity(id: number, event: Event): void {
    this.quantities[id] = Number((event.target as HTMLInputElement).value) || 1;
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.errorMessage = '';

    this.reservationService.create({
      room_id: this.room.id,
      ...(this.form.getRawValue() as any),
      services: Array.from(this.selectedServices),
      quantities: this.quantities,
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.router.navigate(['/my-reservations', res.data.id]);
      },
      error: (err) => {
        this.submitting = false;
        // Le message renvoyé par ReservationService::createReservation() en cas de conflit de dates
        this.errorMessage = err.error?.errors?.room_id?.[0] ?? err.error?.message ?? 'Une erreur est survenue.';
      },
    });
  }
}
