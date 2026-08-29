import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation } from '../models/reservation.model';
import { PaginatedResponse } from '../models/pagination.model';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';
import { HotelService } from '../models/service.model';

export interface StaffDashboardData {
  arrivals: { data: Reservation[] };
  departures: { data: Reservation[] };
  occupancy_rate: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  status: string;
  color: string;
}

export interface ReferenceData {
  clients: { data: User[] };
  rooms: { data: Room[] };
  services: { data: HotelService[] };
}

// Requêtes API "espace personnel" (rôle admin ou receptionist)
@Injectable({ providedIn: 'root' })
export class StaffService {
  private base = `${environment.apiUrl}/staff`;

  constructor(private http: HttpClient) {}

  dashboard(): Observable<StaffDashboardData> {
    return this.http.get<StaffDashboardData>(`${this.base}/dashboard`);
  }

  referenceData(): Observable<ReferenceData> {
    return this.http.get<ReferenceData>(`${this.base}/reference-data`);
  }

  search(filters: { q?: string; date?: string; status?: string }): Observable<PaginatedResponse<Reservation>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params = params.set(key, value);
    });
    return this.http.get<PaginatedResponse<Reservation>>(`${this.base}/reservations`, { params });
  }

  calendar(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.base}/reservations/calendar`);
  }

  create(payload: any): Observable<{ data: Reservation }> {
    return this.http.post<{ data: Reservation }>(`${this.base}/reservations`, payload);
  }

  show(id: number): Observable<{ data: Reservation }> {
    return this.http.get<{ data: Reservation }>(`${this.base}/reservations/${id}`);
  }

  update(id: number, payload: any): Observable<{ data: Reservation }> {
    return this.http.put<{ data: Reservation }>(`${this.base}/reservations/${id}`, payload);
  }

  cancel(id: number): Observable<{ data: Reservation }> {
    return this.http.delete<{ data: Reservation }>(`${this.base}/reservations/${id}`);
  }

  // Suppression définitive (irréversible), réservée aux réservations déjà annulées
  deletePermanently(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/reservations/${id}/force`);
  }

  checkIn(id: number): Observable<{ data: Reservation }> {
    return this.http.patch<{ data: Reservation }>(`${this.base}/reservations/${id}/check-in`, {});
  }

  checkOut(id: number): Observable<{ data: Reservation }> {
    return this.http.patch<{ data: Reservation }>(`${this.base}/reservations/${id}/check-out`, {});
  }
}
