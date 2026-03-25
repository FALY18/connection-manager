# 🖥️ Connection Manager — Frontend (`suivie_connexion`)

> Interface utilisateur Next.js 16 pour la gestion et le suivi des connexions WiFi — dashboard admin, activation de vouchers, achat de plans et monitoring temps réel.

---

## 📋 Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Stack technique](#stack-technique)
- [Architecture Clean Code](#architecture-clean-code)
- [Prérequis](#prérequis)
- [Installation & Démarrage](#installation--démarrage)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Pages & Fonctionnalités](#pages--fonctionnalités)
- [State Management (Zustand)](#state-management-zustand)
- [Composants UI](#composants-ui)
- [Intégration Backend](#intégration-backend)
- [Conventions & bonnes pratiques](#conventions--bonnes-pratiques)

---

## 🎯 Aperçu du projet

**Connection Manager Frontend** est une application **Next.js 16** (App Router) avec **React 19** qui propose :

- Un **portail client** : activation de vouchers WiFi, achat de plans tarifaires, suivi de session
- Un **dashboard admin** : monitoring des connexions actives en temps réel, actions sur les sessions (déconnecter, bloquer, limiter)
- Une **authentification admin** sécurisée avec persistance de session
- Une architecture **Clean Code** feature-driven avec TypeScript strict

---

## 🛠 Stack technique

### Framework & Langage
| Technologie | Version | Rôle |
|---|---|---|
| **Next.js** | 16.1.4 | Framework React — App Router, SSR, API routes |
| **React** | 19.2.3 | Bibliothèque UI |
| **TypeScript** | ^5 | Typage statique strict |

### Styling
| Technologie | Version | Rôle |
|---|---|---|
| **Tailwind CSS** | ^4.0 | Utility-first CSS |
| **tw-animate-css** | ^1.4.0 | Animations Tailwind |
| **class-variance-authority** | ^0.7.1 | Variants de composants |
| **clsx + tailwind-merge** | latest | Fusion conditionnelle de classes |

### Composants UI
| Technologie | Version | Rôle |
|---|---|---|
| **Radix UI** | ^1.x / ^2.x | Primitives accessibles (Dialog, Tabs, Label, Slot…) |
| **shadcn/ui** (custom) | — | Système de composants basé sur Radix UI |
| **Lucide React** | ^0.562.0 | Icônes SVG |

### State Management
| Technologie | Version | Rôle |
|---|---|---|
| **Zustand** | ^5.0.10 | Store global léger avec devtools & persist |

### Analytics & Build
| Technologie | Version | Rôle |
|---|---|---|
| **@vercel/analytics** | ^1.6.1 | Analytics de performance (Vercel) |
| **Bun** | latest | Package manager & runtime (fichier `bun.lock`) |
| **ESLint** | ^9 | Linting avec eslint-config-next |

---

## 🏗 Architecture Clean Code

Le projet applique une architecture **feature-driven** avec une séparation claire des responsabilités.

### Principe général

```
src/
├── app/                    # Routing Next.js (App Router)
│   ├── admin/page.tsx      # Shell de la page admin
│   ├── activate/page.tsx   # Shell de la page activation
│   ├── buy/page.tsx        # Shell de la page achat
│   ├── login/page.tsx      # Shell de la page login
│   ├── user/session/       # Suivi de session utilisateur
│   ├── layout.tsx          # Layout racine (ThemeProvider)
│   └── globals.css         # Styles globaux
│
├── features/               # Fonctionnalités métier (feature slices)
│   ├── admin/
│   │   ├── page.tsx                        # Composant AdminDashboard
│   │   ├── components/
│   │   │   ├── ConnectionsTable.tsx        # Tableau des connexions actives
│   │   │   ├── KpiCard.tsx                 # Cartes KPI (stats)
│   │   │   └── ConnectionActions.tsx       # Actions sur une connexion
│   │   ├── hooks/
│   │   │   ├── useAdminAuth.ts             # Auth admin (Zustand)
│   │   │   └── useConnections.ts           # État & actions sur les connexions
│   │   ├── types/connection.ts             # Type Connection
│   │   ├── constants/colors.ts             # Couleurs de statut
│   │   ├── utils/statusHelpers.ts          # Helpers de statut
│   │   └── data/mockConnections.ts         # Données mock (dev)
│   │
│   ├── activate/
│   │   ├── page.tsx                        # Page activation voucher
│   │   ├── components/ActivateForm.tsx     # Formulaire d'activation
│   │   ├── hooks/useVoucherActivation.ts   # Logique d'activation
│   │   ├── actions/voucher.actions.ts      # Actions réseau (pure I/O)
│   │   ├── utils/device-info.ts            # Détection MAC/IP
│   │   ├── types/voucher.ts                # Types voucher
│   │   └── constants/messages.ts           # Messages UX
│   │
│   ├── login/
│   │   ├── page.tsx                        # Page login admin
│   │   ├── components/LoginForm.tsx        # Formulaire de connexion
│   │   ├── hooks/useAdminLogin.ts          # Logique login
│   │   ├── actions/action.ts               # Appel API login
│   │   ├── utils/fetcher.ts                # Wrapper fetch
│   │   ├── types/auth.ts                   # Types auth
│   │   └── constants/messages.ts
│   │
│   ├── plans/
│   │   ├── components/pricing-plans.tsx    # Affichage des plans
│   │   ├── hooks/usePlans.ts               # Chargement des plans
│   │   ├── actions/actions.ts              # API plans
│   │   ├── lib/plan-mapper.ts              # Mapping API → UI
│   │   └── types/plan.ts                  # Type Plan
│   │
│   └── vouchers/
│       ├── components/VoucherManager.tsx   # Gestion vouchers admin
│       ├── hooks/useVouchers.ts            # État des vouchers
│       ├── actions/voucher_actions.ts      # API vouchers
│       └── types/types.ts                 # Types vouchers
│
├── components/
│   ├── theme-provider.tsx  # Fournisseur de thème (dark/light)
│   └── ui/                 # 40+ composants shadcn/ui
│
├── lib/
│   ├── api.ts              # Service API centralisé (types + fetcher)
│   ├── store.ts            # Store Zustand global (auth + connexions + WS)
│   └── utils.ts            # Utilitaires (cn, formatters…)
│
├── stores/
│   └── admin-auth_store.ts # Store Zustand dédié à l'auth admin
│
├── constants/
│   └── urls.ts             # BASE_URL et endpoints API
│
└── utils/
    └── fetcher.ts          # Fetcher HTTP générique typé
```

---

## ✅ Prérequis

- **Node.js** >= 20.x (ou **Bun** >= 1.x recommandé)
- L'API backend (`backend_manageCOnnexion`) doit être démarrée sur `http://localhost:8000`

---

## 🚀 Installation & Démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/FALY18/connection-manager.git
cd connection-manager
git checkout suivie_connexion
```

### 2. Installer les dépendances

Avec **Bun** (recommandé) :
```bash
bun install
```

Avec **npm** :
```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.local.example .env.local
# Modifier NEXT_PUBLIC_API_URL selon votre backend
```

### 4. Démarrer en développement

```bash
# Avec Bun
bun dev

# Avec npm
npm run dev
```

L'application sera disponible sur **http://localhost:3000**.

### 5. Build de production

```bash
bun run build
bun start
# ou
npm run build && npm start
```

---

## ⚙️ Variables d'environnement

```env
# URL de base de l'API backend Laravel
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Analytics Vercel (optionnel)
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

---

## 📱 Pages & Fonctionnalités

### `/login` — Authentification Admin
- Formulaire email / mot de passe
- Appel `POST /api/admin/login`
- Stockage du token Sanctum via le store Zustand (`admin-auth_store`)
- Persistance de session dans `localStorage` (`AdminSession`)
- Redirection automatique si déjà connecté

### `/admin` — Dashboard Admin
**Section Monitoring des connexions** :
- Tableau de toutes les connexions WiFi actives
- Données affichées : IP, MAC, temps restant, data utilisée / limite, statut (actif / bloqué)
- KPI cards : nombre de connexions actives, data totale consommée, quota moyen
- Simulation temps réel : progression des données toutes les 5 secondes
- Actions sur chaque connexion :
  - ❌ **Déconnecter** l'utilisateur
  - 🚫 **Bloquer / Débloquer** la connexion
  - 📉 **Réduire le quota data** de 50%
  - ⏱ **Réduire le temps restant** de 50%

**Section Vouchers** (VoucherManager) :
- Génération de nouveaux vouchers
- Suivi des vouchers actifs / expirés

### `/activate` — Portail Client : Activation Voucher
- Saisie du code voucher
- Détection automatique de l'adresse MAC (`device-info.ts`)
- Appel `POST /api/vouchers/activate`
- Retour d'état : succès avec durée restante, ou erreur descriptive

### `/buy` — Portail Client : Achat de Plans
- Affichage des plans tarifaires disponibles (fetch `GET /api/admin/plans`)
- Mapping API → UI via `plan-mapper.ts`
- Sélection et redirection vers l'activation

### `/user/session` — Suivi de Session Utilisateur
- Affichage de la session WiFi active de l'utilisateur
- Données consommées, temps restant

---

## 🧩 State Management (Zustand)

Le projet utilise **deux stores Zustand** distincts :

### `useAppStore` (`src/lib/store.ts`)
Store global avec **devtools** + **persist** (sauvegarde partielle en `localStorage`) :

```typescript
interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  token: string | null

  // Connexions
  connections: Connection[]
  connectionStats: { active, total, dataUsed, averageUsage }

  // UI
  isLoading: boolean
  error: string | null
  lastUpdated: number

  // WebSocket
  isConnected: boolean
  reconnectAttempts: number

  // Actions
  setUser, setToken, setConnections, updateConnection,
  removeConnection, setLoading, setError, setWebSocketStatus,
  incrementReconnectAttempts, resetReconnectAttempts,
  logout, reset
}
```

**Sélecteurs optimisés** (évitent les re-renders inutiles) :
```typescript
import { useAuth, useConnections, useUI, useWebSocket } from '@/lib/store'
```

### `useAdminAuthStore` (`src/stores/admin-auth_store.ts`)
Store léger dédié à l'authentification admin avec persistance via `localStorage` :

```typescript
// Utilisation dans un composant
const { user, token, setSession, logout } = useAdminAuthStore()
```

---

## 🎨 Composants UI

### Bibliothèque shadcn/ui (40+ composants)

Le dossier `src/components/ui/` contient une version custom de shadcn/ui, incluant notamment :

| Composant | Usage |
|---|---|
| `Button`, `Input`, `Label`, `Form` | Formulaires |
| `Card`, `Badge`, `Alert` | Affichage d'informations |
| `Dialog`, `Sheet`, `Drawer` | Modales et panneaux |
| `Table`, `Pagination` | Tableaux de données |
| `Tabs`, `Accordion` | Navigation interne |
| `Chart` | Graphiques (basé sur Recharts) |
| `Skeleton` | Loading states |
| `Sidebar`, `Navigation Menu` | Layout principal |
| `Toast` (via `Sonner`) | Notifications |

### Thème
- Support **dark / light mode** via `ThemeProvider` (next-themes)
- Variables CSS Tailwind v4 pour les couleurs sémantiques

---

## 🔌 Intégration Backend

### Fetcher générique

```typescript
// src/utils/fetcher.ts
export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
```

### Actions (Server Actions / Client actions)

Chaque feature expose des fonctions d'action **pures** (sans état, sans dépendance UI) dans son dossier `actions/` :

```typescript
// src/features/activate/actions/voucher.actions.ts
export const activateVoucher = async (
  code: string,
  deviceMac?: string,
  ipAddress?: string
): Promise<ActivateVoucherResponse> => {
  return fetcher<ActivateVoucherResponse>(`${base_url}/vouchers/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, device_mac: deviceMac, ip_address: ipAddress })
  })
}
```

### Hooks personnalisés

Chaque feature encapsule sa logique dans des hooks dédiés :

```typescript
// src/features/activate/hooks/useVoucherActivation.ts
const { activate, isLoading, error, result } = useVoucherActivation()
```

---

## 📐 Conventions & Bonnes pratiques

### Organisation des imports
```typescript
// ✅ Bon — imports centralisés depuis l'index de la feature
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth'
import { Connection } from '@/features/admin/types/connection'

// ✅ Bon — alias @/ configuré dans tsconfig.json
import { fetcher } from '@/utils/fetcher'
import { BASE_URL } from '@/constants/urls'
```

### Séparation des responsabilités
```
components/   →  UI pure (aucune logique métier)
hooks/        →  Logique réutilisable + état local
actions/      →  I/O réseau pure (aucun state, aucune UI)
types/        →  Interfaces TypeScript
constants/    →  Données statiques (messages, couleurs, URLs)
utils/        →  Fonctions pures (formatters, helpers)
stores/       →  État global Zustand
```

### Composants "use client"

Les hooks de state (`useState`, `useEffect`, Zustand) imposent `"use client"` en tête des fichiers concernés. Les composants Server Component (sans state) ne doivent pas avoir cette directive.

### TypeScript strict

Le projet est configuré avec TypeScript strict. Éviter `any` — utiliser des types génériques ou des types d'union précis.

---

## 🚀 Performance

- **Zustand selectors** : chaque consommateur du store ne s'abonne qu'aux slices qu'il utilise, minimisant les re-renders
- **Tree shaking** : exports centralisés per-feature pour un bundle optimisé
- **Next.js App Router** : Server Components par défaut, Client Components uniquement quand nécessaire
- **Tailwind CSS v4** : génération CSS à la compilation (zero-runtime)

---

## 🔧 Linting & Qualité

```bash
# Linter ESLint
bun lint
# ou
npm run lint
```

Configuration ESLint : `eslint.config.mjs` avec `eslint-config-next` (inclut les règles React, Next.js, accessibilité).

---

## 📌 Notes de développement

- Les données du dashboard admin utilisent actuellement des **données mock** (`mockConnections.ts`) — à connecter au stream SSE `/api/stream/sessions` du backend.
- Le store `useAppStore` prévoit une intégration **WebSocket** (`isConnected`, `reconnectAttempts`) — à brancher sur le backend SSE.
- Le `bun.lock` indique que **Bun** est le package manager de référence pour ce projet.

---

## 📄 Licence

Ce projet est privé — tous droits réservés.
