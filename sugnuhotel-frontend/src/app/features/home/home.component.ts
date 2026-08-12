import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoomService } from '../../core/services/room.service';
import { RoomType, Room } from '../../core/models/room.model';
import { AuthService } from '../../core/services/auth.service';

// Photos libres de droits (licence Unsplash, réutilisation commerciale autorisée),
// prises au Sénégal : coucher de soleil à Mbodiène, Lac Rose, Gorée/Dakar.
const SUNSET_MBODIENE = 'https://images.unsplash.com/photo-1498121957837-60d97c66df4d?w=1600&q=80&auto=format&fit=crop';
const LAC_ROSE = 'https://images.unsplash.com/photo-1510263491918-15eb421bc6c1?w=1000&q=80&auto=format&fit=crop';
const GOREE_DAKAR = 'https://images.unsplash.com/photo-1524520120037-c3f28865f644?w=1000&q=80&auto=format&fit=crop';

const ROOM_TYPE_FALLBACKS: Record<string, string> = {
  Standard: LAC_ROSE,
  Deluxe: GOREE_DAKAR,
  Suite: SUNSET_MBODIENE,
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Héro dynamique : vraie photo de la Petite Côte sénégalaise en fond -->
    <div class="sh-hero p-5 mb-4 text-white" [style.background-image]="'url(' + heroImage + ')'">
      <div>
        <span class="sh-badge-pill mb-3"><i class="fa-solid fa-sun"></i> La Teranga vous accueille</span>
        <h1 class="display-5 fw-bold mb-2">Bienvenue à SugnuHotel</h1>
        <p class="lead mb-4" style="max-width: 480px;">
          L'hospitalité sénégalaise entre océan Atlantique et baobabs centenaires. Réservez votre chambre en quelques clics.
        </p>
        <div class="d-flex flex-wrap gap-4">
          <div class="d-flex align-items-center gap-2" *ngFor="let h of highlights">
            <div class="sh-highlight-icon"><i class="fa-solid" [ngClass]="h.icon"></i></div>
            <span class="small">{{ h.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Étape 1 du parcours client : Recherche (dates + nombre de personnes) -->
    <div class="card shadow-sm mb-5 border-0" style="margin-top: -48px; position: relative; z-index: 2;">
      <div class="card-body p-4">
        <h5 class="card-title mb-3"><i class="fa-solid fa-magnifying-glass text-secondary me-1"></i> Rechercher une chambre disponible</h5>
        <form [formGroup]="searchForm" (ngSubmit)="search()" class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Arrivée</label>
            <input type="date" formControlName="check_in_date" class="form-control" [min]="today" required>
          </div>
          <div class="col-md-3">
            <label class="form-label">Départ</label>
            <input type="date" formControlName="check_out_date" class="form-control" required>
          </div>
          <div class="col-md-2">
            <label class="form-label">Adultes</label>
            <input type="number" formControlName="adults" class="form-control" min="1" required>
          </div>
          <div class="col-md-2">
            <label class="form-label">Enfants</label>
            <input type="number" formControlName="children" class="form-control" min="0">
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-dark w-100" [disabled]="searchForm.invalid || searching">
              <i class="fa-solid fa-magnifying-glass"></i> Rechercher
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Résultats de recherche affichés inline dès qu'une recherche a été lancée -->
    <div *ngIf="searched">
      <h5 class="mb-1">Chambres disponibles</h5>
      <p class="text-muted">{{ lastCriteria.adults }} adulte(s), {{ lastCriteria.children }} enfant(s) — {{ rooms.length }} résultat(s)</p>

      <div class="alert alert-warning" *ngIf="!searching && rooms.length === 0">
        Aucune chambre disponible pour ces critères. Essayez d'autres dates.
      </div>

      <div class="row g-4 mb-5">
        <div class="col-md-4" *ngFor="let room of rooms">
          <div class="card h-100 shadow-sm room-card border-0">
            <img [src]="room.images?.[0] || fallbackFor(room.room_type.name)" class="card-img-top" [alt]="'Chambre ' + room.room_number">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ room.room_type.name }} — Ch. {{ room.room_number }}</h5>
              <p class="text-muted mb-1">Étage {{ room.floor }} · Jusqu'à {{ room.max_occupancy }} pers.</p>
              <p class="fw-bold">{{ room.price_per_night | number:'1.0-0' }} FCFA / nuit</p>
              <p class="small">{{ room.nights }} nuit(s) — Total estimé : <strong>{{ room.estimated_total | number:'1.0-0' }} FCFA</strong></p>
              <button class="btn btn-dark mt-auto" (click)="reserve(room)">Réserver cette chambre</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h5 class="mb-3">Nos types de chambres</h5>
    <div class="row g-4 mb-5">
      <div class="col-md-4" *ngFor="let type of roomTypes">
        <div class="card h-100 shadow-sm room-card border-0">
          <img [src]="type.image_url || fallbackFor(type.name)" class="card-img-top" [alt]="type.name">
          <div class="card-body">
            <h5 class="card-title">{{ type.name }}</h5>
            <p class="card-text text-muted">{{ type.description }}</p>
            <p class="fw-bold">À partir de {{ type.base_price | number:'1.0-0' }} FCFA / nuit</p>
            <p class="small text-muted">{{ type.rooms_count }} chambre(s) · jusqu'à {{ type.max_occupancy }} pers.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pourquoi nous choisir : ambiance chaleureuse et rassurante -->
    <div class="row g-4 mb-5 text-center">
      <div class="col-md-4" *ngFor="let f of whyUs">
        <div class="sh-highlight-icon mx-auto mb-2" style="width:56px;height:56px;font-size:1.4rem;">
          <i class="fa-solid" [ngClass]="f.icon"></i>
        </div>
        <h6 class="fw-bold">{{ f.title }}</h6>
        <p class="text-muted small mb-0">{{ f.text }}</p>
      </div>
    </div>

    <!-- Galerie : donner envie de découvrir le Sénégal autour de l'hôtel -->
    <h5 class="mb-3">Autour de SugnuHotel</h5>
    <div class="row g-3 mb-5 sh-gallery">
      <div class="col-md-4" *ngFor="let g of gallery">
        <a href="javascript:void(0)" class="d-block text-decoration-none position-relative">
          <img [src]="g.src" [alt]="g.label">
          <span class="position-absolute bottom-0 start-0 m-2 px-2 py-1 rounded text-white small" style="background: rgba(44,30,20,.65);">{{ g.label }}</span>
        </a>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  roomTypes: RoomType[] = [];
  rooms: Room[] = [];
  searched = false;
  searching = false;
  lastCriteria = { adults: 0, children: 0 };
  today = new Date().toISOString().split('T')[0];
  heroImage = SUNSET_MBODIENE;

  highlights = [
    { icon: 'fa-wifi', label: 'Wifi gratuit' },
    { icon: 'fa-mug-saucer', label: 'Petit-déjeuner Teranga' },
    { icon: 'fa-water', label: 'Vue sur l’océan' },
    { icon: 'fa-square-parking', label: 'Parking sécurisé' },
  ];

  whyUs = [
    { icon: 'fa-hand-holding-heart', title: 'L\'hospitalité Teranga', text: 'Un accueil chaleureux, à l\'image de la tradition sénégalaise de l\'hospitalité.' },
    { icon: 'fa-umbrella-beach', title: 'À deux pas de l\'océan', text: 'Profitez de la Petite Côte et de ses couchers de soleil sans quitter l\'hôtel.' },
    { icon: 'fa-utensils', title: 'Saveurs locales', text: 'Thiéboudienne, yassa et pâtisseries maison servis chaque matin.' },
  ];

  gallery = [
    { src: SUNSET_MBODIENE, label: 'Coucher de soleil, Mbodiène' },
    { src: LAC_ROSE, label: 'Lac Rose' },
    { src: GOREE_DAKAR, label: 'Île de Gorée, Dakar' },
  ];

  searchForm = this.fb.group({
    check_in_date: ['', Validators.required],
    check_out_date: ['', Validators.required],
    adults: [2, [Validators.required, Validators.min(1)]],
    children: [0],
  });

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.roomService.getRoomTypes().subscribe((res) => (this.roomTypes = res.data));
  }

  fallbackFor(typeName: string): string {
    return ROOM_TYPE_FALLBACKS[typeName] ?? LAC_ROSE;
  }

  search(): void {
    if (this.searchForm.invalid) return;
    this.searching = true;
    const criteria = this.searchForm.getRawValue() as any;
    this.lastCriteria = criteria;

    this.roomService.search(criteria).subscribe({
      next: (res) => {
        this.rooms = res.data;
        this.searched = true;
        this.searching = false;
      },
      error: () => (this.searching = false),
    });
  }

  reserve(room: Room): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    // On transmet les critères de recherche en query params pour préremplir le formulaire de réservation
    this.router.navigate(['/rooms', room.id, 'reserve'], {
      queryParams: {
        check_in_date: this.lastCriteria['check_in_date' as keyof typeof this.lastCriteria] ?? this.searchForm.value.check_in_date,
        check_out_date: this.searchForm.value.check_out_date,
        adults: this.lastCriteria.adults,
        children: this.lastCriteria.children,
      },
    });
  }
}
