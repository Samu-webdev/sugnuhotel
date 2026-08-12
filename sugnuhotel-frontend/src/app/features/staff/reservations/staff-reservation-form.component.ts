import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService, ReferenceData } from '../../../core/services/staff.service';

// Un seul composant sert à la fois la création (staff/reservations/new) et
// l'édition (staff/reservations/:id/edit) : on détecte le mode via la présence d'un :id dans l'URL.
@Component({
  selector: 'app-staff-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h4 class="mb-3">{{ isEdit ? 'Modifier la réservation' : 'Créer une réservation (à la réception)' }}</h4>

    <div class="alert alert-danger" *ngIf="errorMessage">{{ errorMessage }}</div>

    <form [formGroup]="form" (ngSubmit)="submit()" class="card shadow-sm p-4" *ngIf="ref">
      <div class="row g-3">
        <div class="col-md-6" *ngIf="!isEdit">
          <label class="form-label">Client</label>
          <select formControlName="user_id" class="form-select" required>
            <option *ngFor="let c of ref.clients.data" [value]="c.id">{{ c.name }} ({{ c.email }})</option>
          </select>
        </div>
        <div class="col-md-6" *ngIf="!isEdit">
          <label class="form-label">Chambre</label>
          <select formControlName="room_id" class="form-select" required>
            <option *ngFor="let r of ref.rooms.data" [value]="r.id">
              {{ r.room_type.name }} — n°{{ r.room_number }} ({{ r.price_per_night | number:'1.0-0' }} FCFA/nuit)
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Arrivée</label>
          <input type="date" formControlName="check_in_date" class="form-control" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">Départ</label>
          <input type="date" formControlName="check_out_date" class="form-control" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">Adultes</label>
          <input type="number" formControlName="number_of_adults" class="form-control" min="1" required>
        </div>
        <div class="col-md-3">
          <label class="form-label">Enfants</label>
          <input type="number" formControlName="number_of_children" class="form-control" min="0">
        </div>
        <div class="col-md-6" *ngIf="isEdit">
          <label class="form-label">Statut</label>
          <select formControlName="status" class="form-select" required>
            <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
          </select>
        </div>
        <div class="col-12" *ngIf="!isEdit">
          <label class="form-label">Services</label>
          <div class="form-check form-check-inline" *ngFor="let s of ref.services.data">
            <input class="form-check-input" type="checkbox" [checked]="isSelected(s.id)" (change)="toggleService(s.id, $event)">
            <label class="form-check-label">{{ s.name }}</label>
          </div>
        </div>
        <div class="col-12">
          <label class="form-label">Demandes particulières</label>
          <textarea formControlName="special_requests" class="form-control" rows="2"></textarea>
        </div>
      </div>
      <button class="btn btn-dark mt-3" [disabled]="form.invalid || submitting">
        {{ isEdit ? 'Enregistrer' : 'Créer la réservation' }}
      </button>
    </form>
  `,
})
export class StaffReservationFormComponent implements OnInit {
  ref?: ReferenceData;
  isEdit = false;
  reservationId?: number;
  submitting = false;
  errorMessage = '';
  selectedServices = new Set<number>();
  statuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  form = this.fb.group({
    user_id: [null as number | null],
    room_id: [null as number | null],
    check_in_date: ['', Validators.required],
    check_out_date: ['', Validators.required],
    number_of_adults: [1, [Validators.required, Validators.min(1)]],
    number_of_children: [0],
    status: ['pending'],
    special_requests: [''],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private staffService: StaffService,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    this.reservationId = idParam ? Number(idParam) : undefined;

    this.staffService.referenceData().subscribe((res) => (this.ref = res));

    if (this.isEdit && this.reservationId) {
      this.staffService.show(this.reservationId).subscribe((res) => {
        const r = res.data;
        this.form.patchValue({
          check_in_date: r.check_in_date,
          check_out_date: r.check_out_date,
          number_of_adults: r.number_of_adults,
          number_of_children: r.number_of_children,
          status: r.status,
          special_requests: r.special_requests,
        });
      });
    } else {
      this.form.get('user_id')?.setValidators(Validators.required);
      this.form.get('room_id')?.setValidators(Validators.required);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedServices.has(id);
  }

  toggleService(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    checked ? this.selectedServices.add(id) : this.selectedServices.delete(id);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.errorMessage = '';

    const payload: any = { ...this.form.getRawValue(), services: Array.from(this.selectedServices) };

    const request$ = this.isEdit && this.reservationId
      ? this.staffService.update(this.reservationId, payload)
      : this.staffService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.submitting = false;
        this.router.navigate(['/staff/reservations', res.data.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message ?? 'Une erreur est survenue.';
      },
    });
  }
}
