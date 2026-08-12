export interface HotelService {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
}
