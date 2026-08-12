import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StaffService, CalendarEvent } from '../../../core/services/staff.service';

interface DayCell {
  date: Date;
  inMonth: boolean;
  events: CalendarEvent[];
}

/**
 * Calendrier "maison" en grille CSS, sans dépendance externe (FullCalendar.js n'est
 * pas installé pour garder le frontend simple/basique). Le principe reste identique :
 * on regroupe les réservations actives par jour du mois affiché.
 */
@Component({
  selector: 'app-staff-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Calendrier des réservations</h4>
      <div>
        <button class="btn btn-sm btn-outline-dark me-2" (click)="prevMonth()">&larr;</button>
        <strong>{{ monthLabel }}</strong>
        <button class="btn btn-sm btn-outline-dark ms-2" (click)="nextMonth()">&rarr;</button>
      </div>
    </div>

    <div class="row row-cols-7 g-1 bg-white shadow-sm p-2">
      <div class="col text-center fw-bold small" *ngFor="let d of weekdays">{{ d }}</div>
      <div class="col border p-1" style="min-height:100px" *ngFor="let cell of cells" [class.bg-light]="!cell.inMonth">
        <div class="small text-muted">{{ cell.date.getDate() }}</div>
        <a *ngFor="let ev of cell.events" [routerLink]="['/staff/reservations', ev.id]"
           class="d-block badge mb-1 text-decoration-none" [style.background]="ev.color" style="white-space:normal;">
          {{ ev.title }}
        </a>
      </div>
    </div>
  `,
})
export class StaffCalendarComponent implements OnInit {
  events: CalendarEvent[] = [];
  cells: DayCell[] = [];
  currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  get monthLabel(): string {
    return this.currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  constructor(private staffService: StaffService) {}

  ngOnInit(): void {
    this.staffService.calendar().subscribe((events) => {
      this.events = events;
      this.buildGrid();
    });
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.buildGrid();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.buildGrid();
  }

  private buildGrid(): void {
    const firstOfMonth = this.currentMonth;
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // lundi = 0
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - startWeekday);

    this.cells = Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      return {
        date,
        inMonth: date.getMonth() === firstOfMonth.getMonth(),
        events: this.events.filter((ev) => dateStr >= ev.start && dateStr < ev.end),
      };
    });
  }
}
