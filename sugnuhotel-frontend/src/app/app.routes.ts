import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

/**
 * Toutes les routes utilisent le "lazy loading" standalone (loadComponent) :
 * chaque page n'est téléchargée par le navigateur qu'au moment où l'utilisateur
 * la visite, ce qui garde le chargement initial de l'application rapide.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent),
  },

  // --- Espace client ---
  {
    path: 'rooms/:roomId/reserve',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['client'] },
    loadComponent: () => import('./features/reservations/create/reservation-create.component').then(m => m.ReservationCreateComponent),
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['client'] },
    loadComponent: () => import('./features/reservations/list/reservation-list.component').then(m => m.ReservationListComponent),
  },
  {
    path: 'my-reservations/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['client'] },
    loadComponent: () => import('./features/reservations/detail/reservation-detail.component').then(m => m.ReservationDetailComponent),
  },

  // --- Espace personnel (réception + admin) ---
  {
    path: 'staff/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'receptionist'] },
    loadComponent: () => import('./features/staff/dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent),
  },
  {
    path: 'staff/reservations',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'receptionist'] },
    loadComponent: () => import('./features/staff/reservations/staff-reservation-list.component').then(m => m.StaffReservationListComponent),
  },
  {
    path: 'staff/reservations/calendar',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'receptionist'] },
    loadComponent: () => import('./features/staff/reservations/staff-calendar.component').then(m => m.StaffCalendarComponent),
  },
  {
    path: 'staff/reservations/new',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'receptionist'] },
    loadComponent: () => import('./features/staff/reservations/staff-reservation-form.component').then(m => m.StaffReservationFormComponent),
  },
  {
    path: 'staff/reservations/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'receptionist'] },
    loadComponent: () => import('./features/staff/reservations/staff-reservation-detail.component').then(m => m.StaffReservationDetailComponent),
  },
  {
    path: 'staff/reservations/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'receptionist'] },
    loadComponent: () => import('./features/staff/reservations/staff-reservation-form.component').then(m => m.StaffReservationFormComponent),
  },

  // --- Espace administrateur ---
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'admin/room-types',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/room-types/admin-room-types.component').then(m => m.AdminRoomTypesComponent),
  },
  {
    path: 'admin/rooms',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/rooms/admin-rooms.component').then(m => m.AdminRoomsComponent),
  },
  {
    path: 'admin/services',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/services/admin-services.component').then(m => m.AdminServicesComponent),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
  },

  { path: '**', redirectTo: '' },
];
