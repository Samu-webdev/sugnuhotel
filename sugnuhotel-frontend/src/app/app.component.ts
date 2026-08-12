import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container my-4">
      <router-outlet></router-outlet>
    </div>
    <footer class="sh-footer py-4 mt-5 text-center" style="color: #d8cdbf;">
      <small><i class="fa-solid fa-sun me-1"></i> {{ year }} SugnuHotel — La Teranga vous accueille</small>
    </footer>
  `,
})
export class AppComponent {
  year = new Date().getFullYear();
}
