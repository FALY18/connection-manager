# Architecture Clean Code - Frontend WiFi Connect

## 📁 Structure Organisée

```
src/
├── components/           # Composants UI réutilisables
│   ├── ui/              # Composants de base (shadcn/ui)
│   └── *.tsx            # Composants métier
├── hooks/               # Hooks personnalisés
│   ├── useAuth.ts       # Authentification
│   ├── useConnections.ts # Gestion connexions
│   ├── useForm.ts       # Gestion formulaires
│   ├── useWebSocket.ts  # WebSocket temps réel
│   └── index.ts         # Exports centralisés
├── types/               # Définitions TypeScript
│   ├── entities.ts      # Entités métier
│   ├── api.ts          # Types API
│   ├── components.ts    # Props composants
│   └── index.ts        # Exports centralisés
├── constants/           # Constantes de l'application
│   ├── plans.ts        # Plans tarifaires
│   ├── api.ts          # Endpoints API
│   ├── ui.ts           # Constantes UI
│   └── index.ts        # Exports centralisés
├── utils/               # Fonctions utilitaires
│   ├── helpers.ts      # Fonctions helper
│   ├── validation.ts   # Validations
│   └── index.ts        # Exports centralisés
└── lib/                 # Services et configuration
    ├── api.ts          # Service API centralisé
    ├── store.ts        # Store Zustand
    └── utils.ts        # Utilitaires généraux
```

## 🎯 Principes Appliqués

### 1. **Séparation des Responsabilités**
- **Components** : UI pure, pas de logique métier
- **Hooks** : Logique réutilisable et état
- **Utils** : Fonctions pures sans effet de bord
- **Constants** : Données statiques centralisées

### 2. **Types Centralisés**
```typescript
// types/entities.ts - Entités métier
export interface Connection { ... }
export interface User { ... }

// types/api.ts - Types API
export interface ApiResponse<T> { ... }
export interface LoginCredentials { ... }

// types/components.ts - Props composants
export interface LoginFormProps { ... }
```

### 3. **Hooks Spécialisés**
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { login, logout, user } = ...
  return { login, logout, user }
}

// hooks/useConnections.ts
export function useConnections() {
  const { connections, stats } = ...
  return { connections, stats }
}
```

### 4. **Constantes Organisées**
```typescript
// constants/api.ts
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  CONNECTIONS: '/connections'
} as const

// constants/ui.ts
export const STATUS_COLORS = {
  active: 'bg-green-500/20...',
  expired: 'bg-red-500/20...'
} as const
```

### 5. **Utilitaires Purs**
```typescript
// utils/helpers.ts
export const formatTime = (seconds: number): string => { ... }
export const validateEmail = (email: string): boolean => { ... }

// utils/validation.ts
export const validateLogin = (values: LoginCredentials) => { ... }
```

## 🔧 Utilisation

### Import Centralisé
```typescript
// ✅ Bon
import { useAuth, useConnections } from '@/hooks'
import { Connection, User } from '@/types'
import { PLANS, API_ENDPOINTS } from '@/constants'
import { formatTime, validateEmail } from '@/utils'

// ❌ Éviter
import { useAuth } from '@/hooks/useAuth'
import { Connection } from '@/types/entities'
```

### Composant Optimisé
```typescript
// components/login-form.tsx
import { useForm, useAuth } from '@/hooks'
import { validateLogin } from '@/utils'
import type { LoginFormProps, LoginCredentials } from '@/types'

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useAuth()
  
  const form = useForm<LoginCredentials>({
    initialValues: { username: '', password: '' },
    validate: validateLogin,
    onSubmit: async (values) => {
      const result = await login(values)
      if (result.success) onLoginSuccess()
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      {/* UI */}
    </form>
  )
}
```

## 📋 Avantages

### ✅ **Maintenabilité**
- Code organisé et prévisible
- Responsabilités clairement séparées
- Réutilisabilité maximale

### ✅ **Développement**
- Auto-complétion TypeScript optimale
- Imports centralisés et cohérents
- Tests unitaires facilités

### ✅ **Performance**
- Tree-shaking efficace
- Bundles optimisés
- Re-renders minimisés

### ✅ **Évolutivité**
- Ajout de fonctionnalités simplifié
- Refactoring sécurisé
- Intégration backend facilitée

## 🚀 Migration Backend

La nouvelle architecture facilite l'intégration avec un nouveau backend :

1. **Types centralisés** : Modification des interfaces en un seul endroit
2. **Service API** : Point d'entrée unique pour tous les appels
3. **Hooks spécialisés** : Logique métier isolée et testable
4. **Constantes** : Configuration centralisée des endpoints

```typescript
// Changement d'API simple
// constants/api.ts
export const API_ENDPOINTS = {
  LOGIN: '/v2/auth/login', // ✅ Un seul endroit à modifier
  // ...
}
```

Cette architecture respecte les principes du clean code et facilite grandement la maintenance et l'évolution du projet.