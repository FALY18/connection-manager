# Architecture des Flux d'Authentification

## 🎯 Deux Scénarios d'Usage

### Scénario A : Portail Captif Web (Recommandé)
**Flux utilisateur final via navigateur**

```
Client Web → /vouchers/activate → Session créée → Accès Internet
```

**Étapes :**
1. Client entre le code voucher sur le portail web
2. Frontend appelle `/api/vouchers/activate`
3. Backend :
   - Vérifie voucher (unused)
   - Crée session Redis + PostgreSQL
   - Marque voucher comme 'used'
4. Client obtient accès Internet

**Utilisation :** Hotspot WiFi avec portail captif

---

### Scénario B : Infrastructure RADIUS (Avancé)
**Flux serveur RADIUS pour authentification WiFi**

```
WiFi AP → FreeRADIUS → /radius/auth → /radius/accounting/start → Session
```

**Étapes :**
1. Client se connecte au WiFi (WPA2-Enterprise)
2. Access Point envoie requête à FreeRADIUS
3. FreeRADIUS appelle `/api/radius/auth` (vérification)
4. Si accepté, FreeRADIUS appelle `/api/radius/accounting/start`
5. Backend crée session et marque voucher comme 'used'

**Utilisation :** Infrastructure WiFi professionnelle avec RADIUS

---

## 🔧 Recommandations de Correction

### Option 1 : Portail Captif Simple (Recommandé pour MVP)
**Garder uniquement `/vouchers/activate`**

- Supprimer la logique RADIUS si non utilisée
- `/vouchers/activate` fait tout :
  - Vérifie voucher
  - Crée session DB + Redis
  - Marque voucher comme 'used'

### Option 2 : Dual Mode (Production)
**Supporter les deux flux**

#### Modifier `/vouchers/activate` :
- Créer session dans `wifi_sessions` (pas seulement Redis)
- Garder le marquage 'used'

#### Modifier `/radius/auth` :
- Accepter vouchers 'unused' OU 'used' (vérifier session active)
- Vérifier dans Redis si session existe déjà

#### Modifier `/radius/accounting/start` :
- Marquer voucher comme 'used' si pas déjà fait
- Créer session DB si pas déjà créée

---

## 📝 État Actuel vs Recommandé

### État Actuel (Problématique)
```
/vouchers/activate:
  ✅ Crée Redis session
  ✅ Marque voucher 'used'
  ❌ Ne crée PAS wifi_sessions

/radius/auth:
  ✅ Vérifie voucher 'unused'
  ❌ Conflit si déjà activé via web

/radius/accounting/start:
  ✅ Crée wifi_sessions
  ❌ Ne marque PAS voucher 'used'
```

### Recommandé (Cohérent)
```
/vouchers/activate:
  ✅ Crée Redis session
  ✅ Crée wifi_sessions
  ✅ Marque voucher 'used'

/radius/auth:
  ✅ Vérifie voucher 'unused' OU session active
  ✅ Compatible avec activation web

/radius/accounting/start:
  ✅ Crée wifi_sessions si pas existe
  ✅ Marque voucher 'used' si pas déjà fait
```

---

## 🚀 Implémentation Recommandée

Pour ce projet, je recommande **Option 1** (Portail Captif Simple) car :
- Plus simple à maintenir
- Pas de FreeRADIUS configuré actuellement
- Frontend Next.js déjà en place
- Suffisant pour un hotspot WiFi basique

Si besoin de RADIUS plus tard, migrer vers **Option 2**.
