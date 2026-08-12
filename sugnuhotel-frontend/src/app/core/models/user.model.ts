export type Role = 'client' | 'receptionist' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
}
