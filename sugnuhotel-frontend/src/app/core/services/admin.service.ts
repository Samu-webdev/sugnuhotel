import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoomType, Room } from '../models/room.model';
import { HotelService } from '../models/service.model';
import { User } from '../models/user.model';
import { PaginatedResponse } from '../models/pagination.model';

/**
 * Un seul service générique pour tout le CRUD "administration",
 * plutôt qu'un service par entité : les 3 ressources (types, chambres, services)
 * suivent exactement le même schéma REST (index/store/update/destroy),
 * donc factoriser évite de dupliquer 4 méthodes x 3 entités.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  dashboard(): Observable<any> {
    return this.http.get(`${this.base}/dashboard`);
  }

  // --- Types de chambres ---
  roomTypes(): Observable<PaginatedResponse<RoomType>> {
    return this.http.get<PaginatedResponse<RoomType>>(`${this.base}/room-types`);
  }
  createRoomType(formData: FormData): Observable<{ data: RoomType }> {
    return this.http.post<{ data: RoomType }>(`${this.base}/room-types`, formData);
  }
  updateRoomType(id: number, formData: FormData): Observable<{ data: RoomType }> {
    // Laravel ne parse pas multipart/form-data sur PUT : on simule le PUT via POST + _method=PUT
    formData.append('_method', 'PUT');
    return this.http.post<{ data: RoomType }>(`${this.base}/room-types/${id}`, formData);
  }
  deleteRoomType(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/room-types/${id}`);
  }

  // --- Chambres ---
  rooms(): Observable<PaginatedResponse<Room>> {
    return this.http.get<PaginatedResponse<Room>>(`${this.base}/rooms`);
  }
  createRoom(formData: FormData): Observable<{ data: Room }> {
    return this.http.post<{ data: Room }>(`${this.base}/rooms`, formData);
  }
  updateRoom(id: number, formData: FormData): Observable<{ data: Room }> {
    formData.append('_method', 'PUT');
    return this.http.post<{ data: Room }>(`${this.base}/rooms/${id}`, formData);
  }
  deleteRoom(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/rooms/${id}`);
  }

  // --- Services additionnels ---
  services(): Observable<PaginatedResponse<HotelService>> {
    return this.http.get<PaginatedResponse<HotelService>>(`${this.base}/services`);
  }
  // `Record<string, unknown>` plutôt que `Partial<HotelService>` : le formulaire réactif
  // (via getRawValue()) type ses champs en "string | null", ce qui ne correspond pas
  // exactement aux types stricts du modèle HotelService — Laravel valide de toute façon les données reçues.
  createService(payload: Record<string, unknown>): Observable<{ data: HotelService }> {
    return this.http.post<{ data: HotelService }>(`${this.base}/services`, payload);
  }
  updateService(id: number, payload: Record<string, unknown>): Observable<{ data: HotelService }> {
    return this.http.put<{ data: HotelService }>(`${this.base}/services/${id}`, payload);
  }
  deleteService(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/services/${id}`);
  }

  // --- Utilisateurs ---
  users(): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.base}/users`);
  }
  createUser(payload: any): Observable<{ data: User }> {
    return this.http.post<{ data: User }>(`${this.base}/users`, payload);
  }
  updateUserRole(id: number, role: string): Observable<{ data: User }> {
    return this.http.patch<{ data: User }>(`${this.base}/users/${id}`, { role });
  }
  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/users/${id}`);
  }
}
