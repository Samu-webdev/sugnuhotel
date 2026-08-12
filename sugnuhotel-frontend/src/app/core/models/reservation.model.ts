import { Room } from './room.model';
import { User } from './user.model';

export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type TimeStatus = 'upcoming' | 'current' | 'past' | 'cancelled';

export interface ReservationServiceLine {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Reservation {
  id: number;
  reservation_number: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  number_of_adults: number;
  number_of_children: number;
  total_price: number;
  status: ReservationStatus;
  time_status: TimeStatus;
  special_requests: string | null;
  user?: User;
  room: Room;
  services?: ReservationServiceLine[];
  created_at?: string;
}
