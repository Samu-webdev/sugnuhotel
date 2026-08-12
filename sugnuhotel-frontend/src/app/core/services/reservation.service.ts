import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation } from '../models/reservation.model';

export interface CreateReservationPayload {
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  number_of_adults: number;
  number_of_children: number;
  special_requests?: string;
  services?: number[];
  quantities?: Record<number, number>;
}

// Requêtes API "espace client" (nécessite d'être connecté avec le rôle 'client')
@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private http: HttpClient) {}

  create(payload: CreateReservationPayload): Observable<{ data: Reservation }> {
    return this.http.post<{ data: Reservation }>(`${environment.apiUrl}/reservations`, payload);
  }

  myReservations(): Observable<{ data: Reservation[] }> {
    return this.http.get<{ data: Reservation[] }>(`${environment.apiUrl}/my-reservations`);
  }

  show(id: number): Observable<{ data: Reservation }> {
    return this.http.get<{ data: Reservation }>(`${environment.apiUrl}/my-reservations/${id}`);
  }

  cancel(id: number): Observable<{ data: Reservation }> {
    return this.http.patch<{ data: Reservation }>(`${environment.apiUrl}/my-reservations/${id}/cancel`, {});
  }
}
