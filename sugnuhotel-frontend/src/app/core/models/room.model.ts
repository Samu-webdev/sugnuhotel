export interface RoomType {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  max_occupancy: number;
  image_url: string | null;
  rooms_count?: number;
}

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'out_of_service';

export interface Room {
  id: number;
  room_number: string;
  floor: number;
  price_per_night: number;
  max_occupancy: number;
  status: RoomStatus;
  room_type: RoomType;
  amenities?: string[];
  images?: string[];
  nights?: number;
  estimated_total?: number;
}
