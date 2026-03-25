# 🔌 Connection Manager — Backend (`backend_manageCOnnexion`)

> API REST Laravel pour la gestion des connexions WiFi avec authentification RADIUS, vouchers, sessions temps réel et streaming SSE.

---

## 📋 Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation & Démarrage](#installation--démarrage)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [API Reference](#api-reference)
- [Modèles de données](#modèles-de-données)
- [Services & Fonctionnalités clés](#services--fonctionnalités-clés)
- [Commandes Artisan personnalisées](#commandes-artisan-personnalisées)
- [Infrastructure Docker](#infrastructure-docker)
- [Tests](#tests)

---

## 🎯 Aperçu du projet

**Connection Manager Backend** est une API REST construite avec **Laravel 12** qui orchestre :

- L'**authentification RADIUS** via FreeRADIUS pour les connexions WiFi
- La **gestion des vouchers** (génération, activation, expiration automatique)
- Le **suivi des sessions WiFi** en temps réel
- Un **dashboard admin** avec streaming SSE (Server-Sent Events)
- La **gestion des plans tarifaires** (durée, quota data, débit)

---

## 🛠 Stack technique

### Backend — Core
| Technologie | Version | Rôle |
|---|---|---|
| **PHP** | ^8.2 | Langage principal |
| **Laravel** | ^12.0 | Framework applicatif |
| **Laravel Sanctum** | ^4.2 | Authentification API par tokens |
| **Predis** | ^3.3 | Client Redis (Pub/Sub, cache sessions) |

### Base de données & Cache
| Technologie | Version | Rôle |
|---|---|---|
| **PostgreSQL** | 16 (Alpine) | Base de données principale |
| **Redis** | Custom build | Cache sessions, expiration TTL, pub/sub |

### Protocoles réseau
| Technologie | Rôle |
|---|---|
| **FreeRADIUS** | Serveur AAA (Authentication, Authorization, Accounting) |
| **RADIUS CoA** | Change of Authorization — modification dynamique des sessions actives |
| **SSE** | Server-Sent Events pour le dashboard temps réel |

### Infrastructure & DevOps
| Technologie | Rôle |
|---|---|
| **Docker / Docker Compose** | Orchestration multi-services |
| **Vite** | Build du frontend minimal (assets) |
| **Tailwind CSS** | Styles (frontend blade minimal) |

### Dev tools
| Outil | Rôle |
|---|---|
| **PHPUnit** ^11.5 | Tests unitaires & fonctionnels |
| **Laravel Pint** | Linting / formatage PHP |
| **Laravel Sail** | Dev local via Docker |
| **Faker** | Seeders de données de test |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (WiFi User)                    │
└────────────────────────┬────────────────────────────────┘
                         │ RADIUS Auth (UDP 1812/1813)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    FreeRADIUS                            │
│   ┌─────────────┐    REST API     ┌──────────────────┐  │
│   │ radius-config│ ──────────────▶│  Laravel API     │  │
│   │ clients.conf │                │  /radius/auth    │  │
│   └─────────────┘                │  /radius/acctg   │  │
└──────────────────────────────────┴──────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────┐
                    ▼                       ▼               ▼
            ┌──────────────┐      ┌──────────────┐  ┌─────────────┐
            │  PostgreSQL  │      │    Redis     │  │   Admin     │
            │  Sessions    │      │  TTL expiry  │  │  Dashboard  │
            │  Vouchers    │◀────▶│  Pub/Sub     │  │  SSE Stream │
            │  Plans       │      │  Session keys│  └─────────────┘
            └──────────────┘      └──────────────┘
```

### Flux de connexion WiFi

```
1. Client → FreeRADIUS (Access-Request, UDP 1812)
2. FreeRADIUS → Laravel POST /api/radius/auth
3. Laravel → vérifie voucher (PostgreSQL)
4. Laravel → stocke session dans Redis (TTL = durée plan)
5. FreeRADIUS → Access-Accept ou Access-Reject
6. Client connecté → FreeRADIUS Accounting (UDP 1813)
7. FreeRADIUS → Laravel POST /api/radius/accounting/start
8. Redis TTL expire → redis-listener → session invalidée (CoA disconnect)
```

---

## ✅ Prérequis

- **Docker** >= 24.x
- **Docker Compose** >= 2.x
- **Git**

> Pas besoin d'installer PHP, Composer, ou Node localement — tout tourne en conteneurs.

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/FALY18/connection-manager.git
cd connection-manager
git checkout backend_manageCOnnexion
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Modifier les valeurs sensibles dans `.env` (voir section [Variables d'environnement](#variables-denvironnement)).

### 3. Lancer l'infrastructure complète

```bash
docker compose up -d
```

Docker va automatiquement :
- Démarrer PostgreSQL, Redis, FreeRADIUS
- Lancer Laravel (`php artisan serve`)
- Jouer les migrations (`php artisan migrate`)
- Seeder la base de données (`php artisan db:seed`)
- Démarrer le listener Redis en arrière-plan

### 4. Vérifier que tout tourne

```bash
docker compose ps
# Tous les services doivent être "healthy" ou "running"

curl http://localhost:8000/api/admin/me
# → 401 Unauthenticated (c'est normal, non authentifié)
```

### 5. Se connecter en admin

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

---

## ⚙️ Variables d'environnement

```env
# Application
APP_NAME="Connection Manager"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=gestion_connect
DB_USERNAME=laravel_user
DB_PASSWORD=secret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PREFIX=laravel-database-

# RADIUS
RADIUS_API_KEY=supersecretkey    # Clé partagée entre FreeRADIUS et Laravel

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

---

## 📁 Structure du projet

```
connection-manager/
├── app/
│   ├── Console/Commands/
│   │   ├── CleanExpiredVouchers.php       # Nettoyage des vouchers expirés
│   │   ├── CleanupExpiredSessions.php     # Purge des sessions expirées
│   │   ├── RedisExpiryListener.php        # Écoute les événements TTL Redis
│   │   └── SeedSessionsRedis.php          # Seeder de sessions test dans Redis
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── AuthController.php      # Login / Logout admin
│   │   │   │   │   ├── RealtimeController.php  # Streaming SSE
│   │   │   │   │   └── VoucherController.php   # CRUD vouchers
│   │   │   │   ├── PlanController.php          # CRUD plans tarifaires
│   │   │   │   └── SessionController.php       # Liste et déconnexion sessions
│   │   │   ├── Client/
│   │   │   │   └── SessionController.php       # Validation session client
│   │   │   └── Raduis/
│   │   │       └── RadiusController.php        # Endpoints FreeRADIUS
│   │   └── Middleware/
│   │       ├── AdminOnly.php               # Restreint aux admins
│   │       ├── RadiusAuth.php              # Vérifie la clé API RADIUS
│   │       └── VerifyCsrfToken.php
│   ├── Models/
│   │   ├── Customer.php    # Clients WiFi
│   │   ├── Plan.php        # Plans (durée, quota, vitesse)
│   │   ├── Session.php     # Sessions WiFi actives
│   │   ├── User.php        # Administrateurs
│   │   └── Voucher.php     # Codes d'accès temporaires
│   ├── Providers/
│   │   ├── SessionService.php   # Service de gestion des sessions
│   │   └── VoucherService.php   # Service de gestion des vouchers
│   └── Services/
│       └── RadiusCoAService.php # Change of Authorization RADIUS
├── database/
│   ├── migrations/
│   │   ├── create_customers_table.php
│   │   ├── create_plans_table.php
│   │   ├── create_vouchers_table.php
│   │   └── create_wifi_sessions_table.php
│   └── seeders/
│       ├── AdminUserSeeder.php
│       ├── PlanSeeder.php
│       └── VoucherSeeder.php
├── routes/
│   └── api.php             # Toutes les routes API
├── radius-config/           # Configuration FreeRADIUS (certifs, mods, sites)
├── redis-config/            # Dockerfile Redis + redis.conf custom
├── postgres-init/           # Script SQL d'initialisation PostgreSQL
├── scripts/                 # Scripts utilitaires (setup, tests Redis)
├── docker-compose.yml
└── Dockerfile.laravel
```

---

## 📡 API Reference

### Authentification Admin

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | ❌ | Connexion admin, retourne un token Sanctum |
| `GET` | `/api/admin/me` | ✅ Sanctum | Profil de l'admin connecté |
| `POST` | `/api/admin/logout` | ✅ Sanctum | Révocation du token |

**Exemple — Login admin :**
```json
POST /api/admin/login
{
  "email": "admin@example.com",
  "password": "password"
}

// Réponse
{
  "token": "1|abc123...",
  "user": { "id": 1, "name": "Admin", "email": "admin@example.com" }
}
```

---

### Sessions WiFi

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/sessions` | ✅ Sanctum | Liste toutes les sessions actives |
| `DELETE` | `/api/admin/sessions/{id}` | ✅ Sanctum | Déconnecte une session (envoi CoA) |
| `GET` | `/api/radius/session/{sessionId}` | ✅ API Key | Valide une session (pour RADIUS) |

---

### Plans Tarifaires

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/plans` | ✅ Sanctum | Liste tous les plans |
| `POST` | `/api/admin/plans` | ✅ Sanctum | Créer un plan |
| `GET` | `/api/admin/plans/{plan}` | ✅ Sanctum | Détail d'un plan |
| `PUT` | `/api/admin/plans/{plan}` | ✅ Sanctum | Modifier un plan |
| `DELETE` | `/api/admin/plans/{plan}` | ✅ Sanctum | Supprimer un plan |
| `PATCH` | `/api/admin/plans/{plan}/toggle` | ✅ Sanctum | Activer / désactiver |

**Exemple — Créer un plan :**
```json
POST /api/admin/plans
{
  "name": "Plan 1h",
  "duration_minutes": 60,
  "data_limit_mb": 500,
  "speed_limit_kbps": 2048,
  "price": 1000,
  "is_active": true
}
```

---

### Vouchers

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/vouchers` | ❌ | Liste des vouchers disponibles |
| `POST` | `/api/vouchers/generate` | ❌ | Générer un nouveau voucher |
| `POST` | `/api/vouchers/activate` | ❌ | Activer un voucher (connexion WiFi) |
| `GET` | `/api/users/{user}/vouchers` | ❌ | Vouchers d'un utilisateur |

**Exemple — Activer un voucher :**
```json
POST /api/vouchers/activate
{
  "code": "ABC123",
  "device_mac": "AA:BB:CC:DD:EE:FF",
  "ip_address": "192.168.1.100"
}
```

---

### Endpoints RADIUS (FreeRADIUS → Laravel)

> Ces endpoints sont appelés par FreeRADIUS via le module `rest`. Sécurisés par clé API (`RADIUS_API_KEY`).

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/radius/auth` | Authentification d'un client WiFi |
| `POST` | `/api/radius/accounting/start` | Début de session |
| `POST` | `/api/radius/accounting/stop` | Fin de session |
| `POST` | `/api/radius/accounting/interim` | Mise à jour interim (data usage) |

---

### Dashboard Temps Réel (SSE)

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/stream/sessions` | ✅ Sanctum | Stream SSE — sessions en direct |

```javascript
// Connexion côté frontend
const evtSource = new EventSource('/api/stream/sessions', {
  headers: { Authorization: `Bearer ${token}` }
});
evtSource.onmessage = (e) => console.log(JSON.parse(e.data));
```

---

## 🗄 Modèles de données

### `Plans`
```
id, name, duration_minutes, data_limit_mb,
speed_limit_kbps (download/upload), price, is_active,
created_at, updated_at
```

### `Vouchers`
```
id, code (unique), plan_id, customer_id,
status (unused|active|expired|depleted),
activated_at, expires_at, data_used_mb,
device_mac, ip_address, created_at, updated_at
```

### `WiFi Sessions`
```
id, voucher_id, customer_id, session_id (RADIUS),
nas_ip, nas_port, calling_station_id (MAC),
framed_ip, start_time, stop_time,
input_octets, output_octets, terminate_cause,
created_at, updated_at
```

### `Customers`
```
id, name, email, phone, mac_address,
created_at, updated_at
```

---

## ⚡ Services & Fonctionnalités clés

### VoucherService

Gère le cycle de vie complet des vouchers :
- Génération de codes uniques
- Activation avec attribution d'un plan
- Calcul d'expiration (`activated_at + duration_minutes`)
- Mise à jour des quotas data consommés

### SessionService

- Création/fermeture de sessions en base PostgreSQL
- Synchronisation avec les clés Redis (`session:{id}`)
- Récupération des sessions actives pour le dashboard

### RadiusCoAService

Envoie des paquets **CoA (Change of Authorization)** au NAS (Network Access Server) pour :
- Déconnecter un utilisateur (`Disconnect-Request`)
- Modifier les paramètres de session (débit, quota)

### Redis TTL Listener (`RedisExpiryListener`)

Commande Artisan qui écoute le canal `__keyevent@0__:expired` de Redis. Quand un voucher expire (TTL = 0), elle :
1. Récupère la session associée
2. Envoie un CoA Disconnect au NAS
3. Met à jour le statut en base

---

## 🛠 Commandes Artisan personnalisées

```bash
# Écouter les expirations Redis (lancé automatiquement par docker-compose)
php artisan redis:listen-expired

# Nettoyer les vouchers expirés en base
php artisan vouchers:clean-expired

# Purger les sessions expirées
php artisan sessions:cleanup-expired

# Seeder des sessions de test dans Redis (développement)
php artisan sessions:seed-redis
```

---

## 🐳 Infrastructure Docker

### Services

| Service | Image | Port exposé | Rôle |
|---|---|---|---|
| `postgres` | postgres:16-alpine | `5433:5432` | Base de données |
| `redis` | custom build | `6380:6379` | Cache & pub/sub |
| `freeradius` | freeradius/freeradius-server | `1812-1813/udp` | Serveur AAA |
| `laravel` | custom (Dockerfile.laravel) | `8000:8000` | API REST |
| `redis-listener` | custom (Dockerfile.laravel) | — | Worker expiration |

### Lancer en développement

```bash
# Démarrer tous les services
docker compose up -d

# Voir les logs Laravel
docker compose logs -f laravel

# Voir les logs RADIUS
docker compose logs -f freeradius

# Accéder au shell Laravel
docker compose exec laravel bash

# Accéder à psql
docker compose exec postgres psql -U laravel_user -d gestion_connect

# Accéder à redis-cli
docker compose exec redis redis-cli
```

### Arrêter et nettoyer

```bash
# Arrêter les conteneurs
docker compose down

# Arrêter + supprimer les volumes (repart de zéro)
docker compose down -v
```

---

## 🧪 Tests

```bash
# Lancer tous les tests
docker compose exec laravel php artisan test

# Avec couverture de code
docker compose exec laravel php artisan test --coverage

# Tests unitaires seulement
docker compose exec laravel php artisan test --testsuite=Unit

# Tests fonctionnels seulement
docker compose exec laravel php artisan test --testsuite=Feature
```

---

## 🔒 Sécurité

- **Authentification Admin** : Laravel Sanctum (tokens Bearer, révocables)
- **Endpoints RADIUS** : Middleware `RadiusAuth` — vérifie le header `X-Radius-Key` contre `RADIUS_API_KEY`
- **CORS** : Configuré via `config/cors.php`
- **HTTPS** : Recommandé en production (proxy Nginx/Traefik devant Laravel)

---

## 📌 Notes de développement

- Le port PostgreSQL est exposé sur **5433** (et non 5432) pour éviter les conflits avec une instance locale.
- Le port Redis est exposé sur **6380** pour la même raison.
- FreeRADIUS communique avec Laravel via le hostname Docker `laravel` (résolution interne au réseau `app-network`).
- Les notifications d'expiration Redis nécessitent l'activation du keyspace notifications (`notify-keyspace-events KEA`), configuré dans `redis-config/redis.conf`.

---

## 📄 Licence

Ce projet est privé — tous droits réservés.
