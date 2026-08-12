import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomType, Room } from '../models/room.model';
import { HotelService } from '../models/service.model';

export interface SearchCriteria {
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
}

// Toutes les requêtes API "publiques" (accueil, recherche, données de réservation)
@Injectable({ providedIn: 'root' })
export class RoomService {
  constructor(private http: HttpClient) {}

  getRoomTypes(): Observable<{ data: RoomType[] }> {
    return this.http.get<{ data: RoomType[] }>(`${environment.apiUrl}/room-types`);
  }

  search(criteria: SearchCriteria): Observable<{ data: Room[] }> {
    let params = new HttpParams()
      .set('check_in_date', criteria.check_in_date)
      .set('check_out_date', criteria.check_out_date)
      .set('adults', criteria.adults)
      .set('children', criteria.children);
    return this.http.get<{ data: Room[] }>(`${environment.apiUrl}/search`, { params });
  }

  getBookingData(roomId: number): Observable<{ room: Room; services: { data: HotelService[] } }> {
    return this.http.get<{ room: Room; services: { data: HotelService[] } }>(`${environment.apiUrl}/rooms/${roomId}/booking-data`);
  }
}
