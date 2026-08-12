# SugnuHotel — Laravel API + Angular

Projet nettoyé et réorganisé. Structure finale (2 dossiers seulement) :

```
sugnuhotel-api/         Laravel 11 — API JSON (Sanctum), projet complet et fonctionnel
sugnuhotel-frontend/    Angular 18 — application cliente, nouveau design "Teranga"
```

L'ancien dossier `sugnuhotel-backend/` (qui ne contenait que du code à copier
manuellement) a été supprimé : `sugnuhotel-api/` est maintenant un projet
Laravel complet et directement utilisable, avec toutes les migrations,
modèles, contrôleurs et routes déjà en place.

---

## 1. Backend Laravel (`sugnuhotel-api/`)

```bash
cd sugnuhotel-api
composer install
cp .env.example .env
php artisan key:generate
```

Le `.env.example` est préconfiguré en **SQLite** (aucun serveur MySQL à
installer/démarrer — recommandé pour le développement local et les rendus de
projet). Le fichier `database/database.sqlite` est déjà présent (vide).

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve       # http://localhost:8000
```

Si vous préférez MySQL, changez simplement `DB_CONNECTION=mysql` et les
variables `DB_HOST` / `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` dans `.env`.

### Comptes de démonstration (mot de passe : `password`)

| Rôle           | Email                       |
|----------------|------------------------------|
| Administrateur | admin@sugnuhotel.test        |
| Réceptionniste | reception@sugnuhotel.test    |
| Client         | client@sugnuhotel.test       |

---

## 2. Frontend Angular (`sugnuhotel-frontend/`)

```bash
cd sugnuhotel-frontend
npm install
npm start                # http://localhost:4200
```

`src/environments/environment.ts` pointe vers `http://localhost:8000/api`.
Les deux serveurs (Laravel `:8000` et Angular `:4200`) doivent tourner en
même temps.

---

## 3. Nouveau design "Teranga"

La page d'accueil et l'identité visuelle ont été retravaillées autour de
l'hospitalité sénégalaise :

- **Palette vive** (`src/styles.css`) : corail/terracotta en couleur
  principale (remplace le brun sombre), vert lagune, ambre coucher de soleil,
  rose Lac Rose pour les touches premium, fond sable.
- **Page d'accueil dynamique** (`home.component.ts`) : bandeau héro plein
  format avec une vraie photo de la Petite Côte sénégalaise, badges
  "Wifi gratuit / Petit-déjeuner Teranga / Vue sur l'océan / Parking",
  section "Pourquoi nous choisir", galerie de photos (Lac Rose, île de
  Gorée, coucher de soleil).
- **Photos** : trois photos libres de droits sous licence Unsplash
  (réutilisation commerciale autorisée sans attribution obligatoire),
  hotlinkées depuis `images.unsplash.com` — aucun fichier lourd à héberger.
- **Cartes chambres** : effet de survol (légère élévation), utilisation
  automatique d'une photo de secours thématique par type de chambre si
  aucune image n'a été uploadée côté admin.

Pour changer les photos, remplacez simplement les 3 constantes en haut de
`src/app/features/home/home.component.ts` (`SUNSET_MBODIENE`, `LAC_ROSE`,
`GOREE_DAKAR`) par d'autres URLs d'images.

---

## Ce qui a été nettoyé dans cette version

- Suppression du dossier `sugnuhotel-backend/` devenu redondant une fois
  `sugnuhotel-api/` fonctionnel.
- Suppression de `vendor/`, `node_modules/`, `.angular/`, `dist/` avant
  livraison (regénérés par `composer install` / `npm install`).
- Suppression du `.env` local (contenait une clé d'application propre à
  votre machine) au profit d'un `.env.example` à jour et prêt à l'emploi.
- `composer.lock` et `package-lock.json` conservés pour reproduire
  exactement les mêmes versions de dépendances.

## Ce qui est déjà implémenté (fonctionnel, inchangé)

- Authentification par token (Sanctum) + 3 rôles (client, receptionist, admin)
- CRUD complet : types de chambres, chambres (+ photos + équipements), services
- Recherche de disponibilité + anti double-booking (verrou pessimiste +
  vérification de chevauchement de dates)
- Réservation avec services additionnels, calcul automatique du prix
- Historique client, interface personnel (dashboard, recherche, calendrier,
  check-in/out), interface admin complète
- 3 emails automatiques (confirmation, modification, annulation)
