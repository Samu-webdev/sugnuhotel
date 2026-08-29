# SugnuHotel

SugnuHotel est une application web de gestion hôtelière. Elle permet à des clients de rechercher et réserver des chambres en ligne, à une équipe de réception de gérer les séjours au quotidien, et à un administrateur de configurer l'ensemble de l'hôtel (chambres, services, personnel).

L'application est construite en deux parties indépendantes qui communiquent entre elles :

- **Backend** : Laravel (API REST en JSON)
- **Frontend** : Angular (application cliente qui consomme cette API)

---

## 1. Vue d'ensemble des fonctionnalités

### Côté client (visiteur / client connecté)

- Recherche de chambres disponibles par dates et nombre de voyageurs
- Affichage des types de chambres (Standard, Deluxe, Suite) et de leurs tarifs
- Réservation en ligne avec choix de services additionnels (petit-déjeuner, parking, spa, navette aéroport…)
- Calcul automatique du prix total (nombre de nuits × prix de la chambre + services)
- Création de compte et connexion
- Historique personnel des réservations, classées automatiquement en *à venir*, *en cours*, *passées* et *annulées*
- Annulation d'une réservation tant qu'elle n'a pas commencé
- Gestion du profil (nom, email, téléphone, adresse)

### Côté personnel (réceptionniste et administrateur)

- Tableau de bord : arrivées et départs du jour, taux d'occupation de l'hôtel
- Recherche de réservations (par nom de client, numéro, chambre ou date)
- Vue calendrier mensuelle des réservations
- Création manuelle d'une réservation (ex. client arrivé par téléphone)
- Modification d'une réservation existante (dates, statut, voyageurs)
- Processus de check-in (la chambre passe en « occupée ») et de check-out (la chambre redevient « disponible »)
- Annulation d'une réservation, et suppression définitive d'une réservation déjà annulée

### Côté administration

- Gestion complète des types de chambres (création, modification, suppression, photo)
- Gestion complète des chambres physiques (numéro, étage, prix, capacité, statut, photos, équipements)
- Gestion des services additionnels proposés à la réservation
- Gestion des comptes du personnel (attribution des rôles réceptionniste / administrateur)
- Statistiques globales (nombre de chambres, de clients, arrivées/départs du jour, taux d'occupation)

### Notifications automatiques

Un email est envoyé automatiquement au client lors de la confirmation, de la modification ou de l'annulation d'une réservation.

---

## 2. Comment l'application fonctionne

### Architecture générale

```
┌────────────────────┐        requêtes HTTP (JSON)        ┌──────────────────────┐
│   Angular (SPA)     │  ────────────────────────────────▶ │   Laravel (API)       │
│  interface visitée  │                                     │  logique métier +     │
│  dans le navigateur │  ◀──────────────────────────────── │  base de données       │
└────────────────────┘        réponses JSON + token         └──────────────────────┘
```

Le navigateur ne charge **qu'une seule fois** l'application Angular (une "single-page application") ; ensuite, chaque action de l'utilisateur (rechercher une chambre, réserver, se connecter…) déclenche un appel réseau vers l'API Laravel, qui répond en JSON. Angular met à jour l'écran sans recharger la page.

### Logique du backend (Laravel)

Le backend suit une architecture en couches, chacune ayant une responsabilité précise :

- **Migrations** : décrivent la structure des tables (utilisateurs, types de chambres, chambres, réservations, services…) et leurs relations.
- **Modèles (Eloquent)** : représentent chaque table et définissent les relations entre elles (un utilisateur a plusieurs réservations, une réservation appartient à une chambre, etc.).
- **Contrôleurs API** : reçoivent les requêtes HTTP et renvoient une réponse JSON. Ils sont organisés par domaine (`Auth`, `Admin`, `Staff`, et les contrôleurs publics/clients).
- **Form Requests** : valident les données reçues (dates cohérentes, capacité respectée, champs obligatoires) avant qu'elles n'atteignent la logique métier.
- **API Resources** : transforment les modèles en JSON propre et cohérent, en ne renvoyant que les champs utiles au frontend.
- **Services métier** : centralisent la logique complexe. Le plus important est `ReservationService`, qui gère la création d'une réservation.

**Sécurité et authentification** : l'application utilise Laravel Sanctum. À la connexion, l'API renvoie un jeton (token) que le frontend conserve et renvoie ensuite dans l'en-tête `Authorization` de chaque requête. Un middleware de rôle (`role:admin`, `role:admin,receptionist`…) protège chaque groupe de routes selon qu'elles concernent le client, le personnel ou l'administration — la vérification se fait donc toujours côté serveur, jamais seulement dans l'interface.

**Empêcher la double réservation** : c'est le point technique le plus délicat du projet. Quand une réservation est créée, la chambre concernée est verrouillée le temps de la transaction en base de données, puis le système vérifie qu'aucune autre réservation active ne chevauche les mêmes dates avant de valider. Cela empêche deux clients de réserver la même chambre en même temps, même si leurs requêtes arrivent au même instant.

### Logique du frontend (Angular)

Le frontend est organisé en modules fonctionnels, chacun correspondant à un espace de l'application :

- **`core/`** : ce qui est transversal à toute l'application — les services qui appellent l'API (un par domaine : authentification, chambres, réservations, personnel, administration), les gardes de route qui protègent l'accès aux pages selon le rôle, et l'intercepteur HTTP qui ajoute automatiquement le jeton de connexion à chaque requête.
- **`features/`** : les pages elles-mêmes, regroupées par espace (accueil, authentification, réservations, espace personnel, administration).
- **`shared/`** : les éléments réutilisés partout, comme la barre de navigation.

**Chargement à la demande** : chaque page n'est téléchargée par le navigateur qu'au moment où l'utilisateur la visite (chargement différé), ce qui garde l'application rapide au premier affichage.

**État de connexion réactif** : l'utilisateur actuellement connecté est stocké dans un signal Angular. Dès qu'il change (connexion, déconnexion), tous les composants qui l'affichent (comme la barre de navigation) se mettent à jour automatiquement, sans code supplémentaire à écrire.

**Protection des pages** : avant d'afficher une page réservée (ex. tableau de bord administrateur), une garde de route vérifie que l'utilisateur est connecté et possède le bon rôle ; sinon, il est redirigé. Cette protection est un confort d'interface — la vraie sécurité reste toujours vérifiée côté serveur.

---

## 3. Les trois rôles de l'application

| Rôle | Ce qu'il peut faire |
|---|---|
| **Client** | Rechercher, réserver, consulter et annuler ses propres réservations |
| **Réceptionniste** | Gérer les réservations de tous les clients, check-in/check-out, tableau de bord quotidien |
| **Administrateur** | Tout ce que fait le réceptionniste, plus la configuration de l'hôtel (chambres, services, comptes du personnel) |

---

## 4. Stack technique

| Élément | Technologie |
|---|---|
| Backend | Laravel 11 (PHP) |
| Authentification API | Laravel Sanctum (jetons) |
| Base de données | PostgreSQL (ou SQLite en développement local) |
| Frontend | Angular 18 (composants autonomes) |
| Style | Bootstrap 5 + palette graphique personnalisée |
| Emails | Système de mail natif de Laravel |

---

## 5. Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@sugnuhotel.test | password |
| Réceptionniste | reception@sugnuhotel.test | password |
| Client | client@sugnuhotel.test | password |

---

## 6. Démarrage rapide

**Backend**
```bash
cd sugnuhotel-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

**Frontend**
```bash
cd sugnuhotel-frontend
npm install
npm start
```

L'application est ensuite accessible sur `http://localhost:4200`, connectée à l'API sur `http://localhost:8000`.