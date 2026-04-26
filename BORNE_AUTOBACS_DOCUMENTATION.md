# 🔧 Borne de Recherche Produit — Autobacs France
## Documentation Technique Complète

> **Projet** : Kiosque tactile de recherche produit en magasin  
> **Prestataire** : M. Andrys MAGAR — Auto-entrepreneur  
> **Client** : Autobacs France — M. David Fiuza  
> **Version** : 1.0.0  
> **Date** : Mars 2025  

---

## Table des matières

1. [Ce que fait l'application](#1-ce-que-fait-lapplication)
2. [Flux de recherche & minuteurs](#2-flux-de-recherche--minuteurs)
3. [Sécurité](#3-sécurité)
4. [Architecture technique](#4-architecture-technique)
5. [Base de données](#5-base-de-données)
6. [Intégrations externes](#6-intégrations-externes)
7. [Performance & cache](#7-performance--cache)
8. [Cycle de vie & déploiement](#8-cycle-de-vie--déploiement)
9. [Monitoring & alertes](#9-monitoring--alertes)
10. [Gestion des erreurs](#10-gestion-des-erreurs)
11. [Organisation du développement](#11-organisation-du-développement)
12. [Checklist avant mise en production](#12-checklist-avant-mise-en-production)

---

## 1. Ce que fait l'application

### Vue d'ensemble

La borne est une **application web Next.js 14 fullscreen** déployée sur tablette tactile ou borne kiosque en magasin. Elle permet à un client Autobacs de trouver en moins de 30 secondes un produit compatible avec son véhicule, de vérifier le stock sur place et dans les autres centres, et de passer commande si le produit est indisponible.

### Ce qu'elle fait exactement

```
CLIENT ENTRE SA PLAQUE
        ↓
API SIV identifie le véhicule (marque, modèle, année, motorisation)
        ↓
TecDoc retourne toutes les références compatibles
        ↓
Le système croise avec le catalogue Autobacs
        ↓
Affichage des produits disponibles avec stock temps réel
        ↓
┌─────────────────────────────────────────┐
│  Produit trouvé en stock local          │ → Emplacement rayon + réservation caisse
│  Produit épuisé ici                     │ → Autres centres avec stock
│  Produit indisponible partout           │ → Commande en ligne (livraison/Click&Collect)
│  Véhicule non reconnu                  │ → Navigation manuelle par catégorie
└─────────────────────────────────────────┘
```

### Fonctionnalités détaillées

#### Interface client (borne/tablette)

| Écran | Ce qu'il fait |
|-------|---------------|
| **Accueil** | Écran d'attente animé. Deux entrées : plaque ou catégorie. Raccourcis 8 catégories visuelles. Reset auto si inactif. |
| **Saisie plaque** | Clavier tactile optimisé. Auto-formatage SIV (AB-123-CD) et FNI (123 ABC 75). Validation format avant envoi. |
| **Identification véhicule** | Appel API SIV → affichage marque/modèle/année détectés. Confirmation visuelle avant de chercher les produits. |
| **Filtres catégories** | 8 catégories avec nombre de produits compatibles détectés. Sélection multiple possible. |
| **Résultats** | Grille 3 colonnes. Badge stock (vert/orange/rouge). Prix. Tri par prix ou pertinence. Filtres rapides par disponibilité. |
| **Fiche produit** | Photo, specs techniques, prix, stock exact, emplacement en rayon (allée + étagère), bouton guidage rayon. |
| **Autres centres** | Liste des centres avec stock, triés par distance. Lien itinéraire. Option commande depuis la borne. |
| **Commande** | Formulaire minimal (email ou tél). Confirmation par SMS. Livraison 24-48h ou Click & Collect 2h. |
| **Recherche sans plaque** | Sélection en cascade Marque → Modèle → Motorisation → Année. Ou recherche textuelle directe. |

#### Back-office administration (web desktop)

| Module | Ce qu'il fait |
|--------|---------------|
| **Tableau de bord** | Vue consolidée : recherches du jour, taux trouvé/non trouvé, alertes stock, activité récente. |
| **Gestion catalogue** | CRUD produits : référence, désignation, marque, catégorie, prix, photo, emplacement rayon par centre. |
| **Gestion compatibilités** | Interface de mapping produits ↔ véhicules TecDoc. Import CSV ou saisie manuelle ligne par ligne. |
| **Gestion stocks** | Mise à jour quantités par centre. Seuils d'alerte configurables. Historique des modifications. |
| **Import en masse** | Upload CSV/Excel produits et compatibilités. Validation du format avant import. Rapport d'erreurs. |
| **Analytique** | Plaques les plus recherchées, catégories populaires, produits non trouvés (opportunités de stock). |
| **Gestion utilisateurs** | Comptes admin par centre avec droits limités à leur propre magasin. Logs des connexions. |

---

## 2. Flux de recherche & minuteurs

### Minuteurs système

| Événement | Durée | Action |
|-----------|-------|--------|
| **Inactivité borne** | 90 secondes | Retour automatique écran accueil + reset complet de l'état |
| **Timeout API SIV** | 3 secondes | Affichage message + proposition recherche manuelle |
| **Timeout API TecDoc** | 3 secondes | Fallback sur base locale cache + message discret |
| **Timeout API stock** | 2 secondes | Affichage données cache + indication "données estimées" |
| **Animation de chargement** | Dès 300ms | Spinner affiché si pas de réponse après 300ms |
| **Cache local refresh** | 60 minutes | Mise à jour silencieuse du cache produits et stocks |
| **Session commande** | 10 minutes | Expiration du formulaire de commande non soumis |
| **Alerte stock non mis à jour** | 4 heures | Email automatique au responsable du centre concerné |

### Temps de réponse cibles

```
Saisie plaque → Identification véhicule   : < 1.5 secondes
Identification → Affichage résultats       : < 1 seconde
Navigation entre écrans                    : < 200ms (instantané)
Chargement images produits                 : < 500ms (CDN)
Soumission commande → Confirmation SMS     : < 10 secondes
Mise à jour stock (import CSV)             : toutes les heures
```

### Flux détaillé avec états

```
[ACCUEIL]
    │
    ├─ Tap "Recherche par plaque"
    │       ↓
    │   [SAISIE PLAQUE]
    │       │ Saisie clavier tactile
    │       │ Validation format (regex SIV/FNI)
    │       │
    │       ├─ Format invalide → message inline, pas de popup
    │       │
    │       └─ Format valide → tap "Rechercher"
    │               ↓
    │           Spinner (si > 300ms)
    │               ↓
    │           Appel API SIV (timeout 3s)
    │               │
    │               ├─ Véhicule non trouvé → proposition sélection manuelle
    │               ├─ Timeout → proposition sélection manuelle + log Sentry
    │               │
    │               └─ Véhicule trouvé
    │                       ↓
    │                   Appel TecDoc (timeout 3s)
    │                       │
    │                       ├─ Timeout → fallback cache local
    │                       │
    │                       └─ Références compatibles reçues
    │                               ↓
    │                   [FILTRES CATÉGORIES]
    │                       │
    │                       └─ Sélection catégorie
    │                               ↓
    │                   Requête Supabase stock (timeout 2s)
    │                               ↓
    │                   [RÉSULTATS]
    │                       │
    │                       ├─ Tap produit EN STOCK
    │                       │       ↓
    │                       │   [FICHE PRODUIT]
    │                       │       │
    │                       │       ├─ "Me guider en rayon" → affichage plan + emplacement
    │                       │       └─ "Réserver en caisse" → ticket QR code généré
    │                       │
    │                       ├─ Tap produit ÉPUISÉ ICI
    │                       │       ↓
    │                       │   [AUTRES CENTRES]
    │                       │       │
    │                       │       └─ "Commander" → [FORMULAIRE COMMANDE]
    │                       │               ↓
    │                       │           Email/SMS → Confirmation → [ACCUEIL]
    │                       │
    │                       └─ Aucun résultat → message + suggestion catégories
    │
    └─ Tap catégorie directe (sans plaque)
            ↓
        [RÉSULTATS sans filtre véhicule]
```

### Reset et nettoyage

```javascript
// Pseudo-code du timer d'inactivité
const INACTIVITY_TIMEOUT = 90_000 // 90 secondes

let inactivityTimer

function resetInactivityTimer() {
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    clearAppState()      // vider plaque, véhicule, catégorie sélectionnée
    clearSearchResults() // vider les résultats
    navigateTo('home')   // retour accueil
    logEvent('inactivity_reset') // log pour analytics
  }, INACTIVITY_TIMEOUT)
}

// Écouter tous les événements tactiles
document.addEventListener('touchstart', resetInactivityTimer)
document.addEventListener('touchend', resetInactivityTimer)
document.addEventListener('click', resetInactivityTimer)
```

---

## 3. Sécurité

### Modèle de sécurité général

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                             │
├─────────────────────────────────────────────────────────┤
│  Borne client (lecture seule, anonyme)                  │
│  Back-office (authentifié, rôles stricts)               │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS uniquement (TLS 1.3)
               ▼
┌─────────────────────────────────────────────────────────┐
│              VERCEL EDGE (CDN + WAF)                    │
│  Rate limiting · Headers sécurité · DDoS protection     │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│           NEXT.JS API ROUTES (Backend)                  │
│  Validation inputs · Sanitisation · Auth check          │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│         SUPABASE (PostgreSQL + Row Level Security)      │
│  RLS : chaque centre ne lit que son propre stock        │
└─────────────────────────────────────────────────────────┘
```

### Sécurité borne client

**Validation des entrées**

```typescript
// Validation plaque immatriculation
const PLATE_REGEX = {
  SIV: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/,
  FNI: /^\d{1,4}\s?[A-Z]{1,3}\s?\d{2,3}$/
}

function validatePlate(input: string): boolean {
  const normalized = input.trim().toUpperCase()
  return PLATE_REGEX.SIV.test(normalized) || PLATE_REGEX.FNI.test(normalized)
}

// Validation recherche textuelle
function sanitizeSearch(input: string): string {
  return input
    .trim()
    .slice(0, 100)           // longueur max
    .replace(/[<>\"'%;()&+]/g, '') // caractères dangereux
}
```

**Mode kiosque** — empêcher l'accès au système

```
Android : MDM (Mobile Device Management) + mode kiosque
          → seule l'app borne est accessible
          → pas d'accès aux paramètres, notifications, autres apps

iPad : Guided Access (natif iOS)
       → triple tap bouton latéral pour activer
       → PIN requis pour sortir du mode kiosque

Les deux : désactiver les mises à jour automatiques de l'OS
           (gérer manuellement pour éviter les redémarrages intempestifs)
```

**Ce que la borne ne peut pas faire**

- ❌ Accéder au back-office
- ❌ Modifier des données (lecture seule)
- ❌ Voir les données d'autres clients
- ❌ Accéder aux prix d'achat ou aux marges
- ❌ Appeler les APIs TecDoc directement (tout passe par le backend)
- ❌ Exécuter du code arbitraire (CSP strict)

**Headers de sécurité HTTP**

```
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data: cdn.autobacs.fr
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(), camera=(), microphone=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Sécurité back-office

**Authentification**

```
Auth0 → Login email/password + MFA obligatoire pour les admins réseau
     → Session expire après 8 heures d'inactivité
     → Refresh token rotation activé
     → Logout automatique si fermeture navigateur
```

**Rôles et permissions (Row Level Security Supabase)**

```sql
-- Admin réseau : voit tout
CREATE POLICY "admin_reseau_all" ON products
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin_reseau');

-- Responsable centre : voit uniquement son centre
CREATE POLICY "responsable_centre_own" ON stock
  FOR ALL USING (
    centre_id = (auth.jwt() ->> 'centre_id')::uuid
    AND auth.jwt() ->> 'role' = 'responsable_centre'
  );

-- Borne (anonyme) : lecture seule produits et stock
CREATE POLICY "borne_read_only" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "borne_stock_read" ON stock
  FOR SELECT USING (true);
```

**Rate limiting**

```
Borne (anonyme)   : 60 requêtes / minute par IP
Back-office       : 300 requêtes / minute par utilisateur
API commande      : 5 commandes / heure par IP (anti-spam)
API SIV           : limité par quota gouvernemental (géré en cache)
API TecDoc        : limité par contrat (résultats mis en cache 24h)
```

### Sécurité des données

**RGPD**

```
Données collectées sur la borne :
✅ Marque/modèle détecté (anonymisé — pas la plaque brute)
✅ Catégorie recherchée
✅ Produit consulté
✅ Résultat trouvé ou non

❌ Plaque d'immatriculation (jamais stockée après identification)
❌ Données personnelles sans consentement explicite

Commande depuis la borne :
→ Email/téléphone collecté uniquement pour cette commande
→ Supprimé automatiquement après 30 jours
→ Mention légale affichée avant soumission
```

**Chiffrement**

```
En transit  : TLS 1.3 (HTTPS)
Au repos    : AES-256 (Supabase gère nativement)
Secrets     : Variables d'environnement Vercel (jamais dans le code)
Clés API    : Rotation semestrielle
```

---

## 4. Architecture technique

### Stack complète

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND                               │
│                                                         │
│  Next.js 14 (App Router)                                │
│  ├── Interface borne    → /kiosk/*  (fullscreen tactile)│
│  ├── Back-office admin  → /admin/*  (desktop)           │
│  └── API Routes         → /api/*    (backend sécurisé)  │
│                                                         │
│  Tailwind CSS · TypeScript · Zustand (état global)      │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   SUPABASE   │  │    AUTH0     │  │  APIS EXTERNES   │
│              │  │              │  │                  │
│ PostgreSQL   │  │ Auth         │  │ TecDoc (compat.) │
│ Realtime     │  │ MFA          │  │ API SIV (plaque) │
│ Storage      │  │ Roles        │  │ Twilio (SMS)     │
│ RLS          │  │ Sessions     │  │ Stripe (cmd)     │
└──────────────┘  └──────────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              INFRASTRUCTURE                             │
│                                                         │
│  Vercel Edge Network  → Déploiement + CDN               │
│  Sentry               → Monitoring erreurs              │
│  Vercel Analytics     → Performance + uptime            │
└─────────────────────────────────────────────────────────┘
```

### Structure des dossiers

```
borne-autobacs/
├── app/
│   ├── kiosk/                    # Interface borne client
│   │   ├── page.tsx              # Écran accueil
│   │   ├── plate/page.tsx        # Saisie plaque
│   │   ├── filters/page.tsx      # Filtres catégories
│   │   ├── results/page.tsx      # Résultats produits
│   │   ├── product/[id]/page.tsx # Fiche produit
│   │   ├── stores/page.tsx       # Autres centres
│   │   └── order/page.tsx        # Formulaire commande
│   │
│   ├── admin/                    # Back-office
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── vehicles/page.tsx
│   │   ├── compat/page.tsx
│   │   ├── stock/page.tsx
│   │   ├── import/page.tsx
│   │   └── analytics/page.tsx
│   │
│   └── api/                      # Routes API (backend)
│       ├── identify/route.ts     # Identification plaque → véhicule
│       ├── compat/route.ts       # Compatibilités TecDoc
│       ├── products/route.ts     # Catalogue produits
│       ├── stock/route.ts        # Stock par centre
│       ├── order/route.ts        # Passer commande
│       └── import/route.ts      # Import CSV
│
├── components/
│   ├── kiosk/                    # Composants borne
│   │   ├── PlateKeyboard.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── StockBadge.tsx
│   │   ├── StoreList.tsx
│   │   └── InactivityTimer.tsx
│   └── admin/                    # Composants back-office
│
├── lib/
│   ├── tecdoc.ts                 # Client API TecDoc
│   ├── siv.ts                    # Client API SIV gouvernemental
│   ├── supabase.ts               # Client Supabase
│   ├── cache.ts                  # Gestion cache local
│   ├── validation.ts             # Validation inputs
│   └── security.ts               # Sanitisation, rate limiting
│
├── middleware.ts                 # Auth, rate limiting, headers sécu
├── supabase/
│   └── migrations/               # Migrations base de données versionnées
└── tests/
    ├── unit/                     # Tests unitaires (Vitest)
    └── e2e/                      # Tests end-to-end (Playwright)
```

---

## 5. Base de données

### Schéma Supabase

```sql
-- Centres Autobacs
CREATE TABLE centres (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT NOT NULL,                        -- "Autobacs Herblay"
  adresse     TEXT NOT NULL,
  ville       TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  horaires    JSONB,                                -- {"lun":"9h-19h", ...}
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Véhicules (importés depuis TecDoc ou saisis manuellement)
CREATE TABLE vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tecdoc_ktypeid INTEGER UNIQUE,                   -- identifiant TecDoc
  marque        TEXT NOT NULL,
  modele        TEXT NOT NULL,
  motorisation  TEXT,
  annee_debut   SMALLINT NOT NULL,
  annee_fin     SMALLINT,
  carburant     TEXT,                              -- essence/diesel/hybride/elec
  cylindree     TEXT,
  puissance_kw  SMALLINT,
  source        TEXT DEFAULT 'tecdoc',             -- tecdoc | manuel
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Catégories produits
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug  TEXT UNIQUE NOT NULL,                      -- "ampoules"
  nom   TEXT NOT NULL,                             -- "Ampoules"
  icone TEXT,                                      -- emoji ou nom icône
  ordre SMALLINT DEFAULT 0
);

-- Produits catalogue
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT UNIQUE NOT NULL,            -- "PH-12972XV"
  designation     TEXT NOT NULL,
  marque          TEXT NOT NULL,
  category_id     UUID REFERENCES categories(id),
  prix_ttc        DECIMAL(8,2) NOT NULL,
  photo_url       TEXT,
  description     TEXT,
  specifications  JSONB,                           -- {"type":"H7","voltage":"12V",...}
  tecdoc_artid    INTEGER,                         -- référence article TecDoc
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Compatibilités véhicules ↔ produits
CREATE TABLE compatibilities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  vehicle_id  UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  source      TEXT DEFAULT 'tecdoc',              -- tecdoc | manuel | import
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, vehicle_id)
);

-- Stock par centre
CREATE TABLE stock (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  centre_id   UUID REFERENCES centres(id) ON DELETE CASCADE,
  quantite    INTEGER NOT NULL DEFAULT 0,
  emplacement TEXT,                               -- "Rayon A · Étagère 3"
  seuil_alerte INTEGER DEFAULT 2,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, centre_id)
);

-- Logs de recherche (anonymisés RGPD)
CREATE TABLE search_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id       UUID REFERENCES centres(id),
  vehicle_marque  TEXT,                           -- "Renault" (pas la plaque)
  vehicle_modele  TEXT,                           -- "Clio V"
  vehicle_annee   SMALLINT,
  category_slug   TEXT,
  nb_resultats    INTEGER,
  produit_clique  UUID REFERENCES products(id),
  searched_at     TIMESTAMPTZ DEFAULT now()
  -- Pas de plaque, pas d'IP stockée
);

-- Commandes depuis la borne
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id   UUID REFERENCES centres(id),
  product_id  UUID REFERENCES products(id),
  contact     TEXT NOT NULL,                      -- email ou tél chiffré
  type        TEXT NOT NULL,                      -- livraison | click_collect
  statut      TEXT DEFAULT 'en_attente',
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ DEFAULT now() + interval '30 days'
);

-- Index pour les performances
CREATE INDEX idx_compat_vehicle ON compatibilities(vehicle_id);
CREATE INDEX idx_compat_product ON compatibilities(product_id);
CREATE INDEX idx_stock_centre ON stock(centre_id);
CREATE INDEX idx_stock_product ON stock(product_id);
CREATE INDEX idx_vehicles_tecdoc ON vehicles(tecdoc_ktypeid);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_logs_date ON search_logs(searched_at DESC);
```

---

## 6. Intégrations externes

### API SIV (gratuite — identification plaque)

```typescript
// lib/siv.ts
const SIV_BASE_URL = 'https://api.siv.interieur.gouv.fr'

export async function identifyPlate(plate: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000) // 3s max

  try {
    const response = await fetch(`${SIV_BASE_URL}/vehicule/${plate}`, {
      signal: controller.signal,
      headers: { 'Authorization': `Bearer ${process.env.SIV_API_KEY}` }
    })

    if (!response.ok) throw new Error(`SIV error: ${response.status}`)

    const data = await response.json()
    return {
      marque: data.marque,
      modele: data.modele,
      annee: data.annee_premiere_immat,
      motorisation: data.energie,
      cylindree: data.cylindree
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // Timeout → log + retour null pour fallback manuel
      console.warn('SIV timeout pour plaque:', plate)
      return null
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
```

### API TecDoc (compatibilités)

```typescript
// lib/tecdoc.ts
// Les clés TecDoc ne sont JAMAIS exposées côté client
// Tout passe par les API Routes Next.js (backend)

export async function getCompatibleProducts(
  ktypeId: number,
  categoryId: string
) {
  // Cache 24h — les compatibilités ne changent pas souvent
  const cacheKey = `tecdoc:${ktypeId}:${categoryId}`
  const cached = await getFromCache(cacheKey)
  if (cached) return cached

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const response = await fetch(
      `${process.env.TECDOC_API_URL}/articles?ktypeid=${ktypeId}&category=${categoryId}`,
      {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${process.env.TECDOC_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()
    const artIds = data.articles.map((a: any) => a.artId)

    // Mise en cache 24h
    await setCache(cacheKey, artIds, 86400)
    return artIds

  } catch (error) {
    if (error.name === 'AbortError') {
      // Fallback : retourner les compatibilités depuis la base locale
      return await getCompatibilitiesFromDB(ktypeId, categoryId)
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
```

### Twilio (SMS confirmation commande)

```typescript
// lib/twilio.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendOrderConfirmation(phone: string, order: Order) {
  await client.messages.create({
    body: `Autobacs France — Commande confirmée ✓\n`
        + `Produit : ${order.productName}\n`
        + `Livraison : ${order.type === 'livraison' ? '24-48h à domicile' : 'Click & Collect sous 2h'}\n`
        + `Ref : ${order.id.slice(0,8).toUpperCase()}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  })
}
```

---

## 7. Performance & cache

### Stratégie de cache multi-niveaux

```
NIVEAU 1 — Cache navigateur (borne)
  Durée : 5 minutes
  Contenu : résultats de recherche récents, images produits
  Méthode : Service Worker + Cache API

NIVEAU 2 — Cache Vercel Edge
  Durée : 1 heure pour le catalogue, 5 min pour le stock
  Contenu : pages produits, résultats TecDoc
  Méthode : Cache-Control headers + Vercel KV

NIVEAU 3 — Cache Supabase
  Durée : 24 heures pour les compatibilités TecDoc
  Contenu : résultats TecDoc, véhicules identifiés
  Méthode : Table cache dédiée avec expiration

NIVEAU 4 — Cache local offline (Service Worker)
  Durée : jusqu'à la prochaine connexion
  Contenu : catalogue complet + stock dernière mise à jour
  Méthode : IndexedDB via Workbox
  → La borne fonctionne même sans internet
```

### Optimisation images

```
Format   : WebP (80% moins lourd que JPEG, transparent)
Taille   : max 200Ko par image produit
Dimensions : 400x400px (affichage grille) + 800x800px (fiche)
CDN      : Vercel Image Optimization (resize/compress à la volée)
Lazy load : images hors écran chargées au scroll
Placeholder : blur hash pendant le chargement
```

---

## 8. Cycle de vie & déploiement

### Versioning SemVer

```
MAJOR.MINOR.PATCH

1.0.0 → Mise en production pilote Herblay
1.0.1 → Correction bug (patch)
1.1.0 → Nouvelle catégorie produit (feature mineure)
1.2.0 → Intégration TecDoc automatique (feature majeure)
2.0.0 → Extension multi-centres (breaking change architecture)
```

### Branches Git

```
main      → Production (protégée, jamais de push direct)
staging   → Recette client (auto-déployé sur staging.borne-autobacs.fr)
develop   → Développement actif
feature/* → Fonctionnalité en cours (ex: feature/offline-mode)
hotfix/*  → Correction urgente prod (ex: hotfix/stock-display-bug)
```

### Pipeline CI/CD (GitHub Actions + Vercel)

```yaml
# Déclenché sur chaque Pull Request
on: [pull_request]

jobs:
  test:
    - npm run lint          # ESLint
    - npm run type-check    # TypeScript
    - npm run test          # Vitest (unitaires)
    - npm run test:e2e      # Playwright (E2E)
    - npm audit             # Failles sécurité

  deploy-preview:
    - Vercel preview URL générée
    - URL partagée dans la PR pour review

# Déclenché sur merge dans staging
  deploy-staging:
    - Tests complets
    - Deploy sur staging.borne-autobacs.fr
    - Notification email à David Fiuza

# Déclenché sur merge dans main (après validation David)
  deploy-production:
    - Deploy Vercel production
    - Toutes les bornes mises à jour en < 30 secondes
    - Notification Slack + email équipe
    - Health check automatique post-déploiement
```

### Fenêtres de déploiement

```
✅ Déploiements autorisés : 6h00 → 9h00 (avant ouverture centres)
⚠️  Déploiements déconseillés : 11h → 14h et 16h → 19h (heures de pointe)
🚨 Hotfix P0 : déployable à tout moment avec notification immédiate
```

### Rollback

```bash
# Vercel — rollback en 1 clic ou via CLI
vercel rollback [deployment-url]

# Délai de rollback : < 30 secondes
# Les bornes basculent automatiquement sur la version précédente
```

---

## 9. Monitoring & alertes

### Tableau de bord monitoring

| Outil | Ce qu'il surveille | Alerte si |
|-------|-------------------|-----------|
| **Sentry** | Erreurs JS runtime | Nouvelle erreur critique |
| **Vercel Analytics** | Uptime, temps de réponse | Uptime < 99% sur 5 min |
| **Supabase Dashboard** | Connexions DB, requêtes lentes | Requête > 2s |
| **Custom job** | Stock non mis à jour | > 4h sans mise à jour |
| **Custom job** | Borne inactive | > 30 min sans requête |

### Niveaux d'alerte

```
🔴 CRITIQUE  → SMS immédiat + email
   La borne est inutilisable, stock inaccessible, DB down

🟠 MAJEUR    → Email immédiat
   Fonctionnalité dégradée, temps de réponse > 5s, imports échoués

🟡 MINEUR    → Email résumé quotidien
   Erreurs ponctuelles, stock bas, imports partiels
```

### Métriques clés à surveiller

```
Disponibilité borne         : cible > 99.5%
Temps identification plaque : cible < 1.5s
Taux produits trouvés       : cible > 80% des recherches
Taux commandes abouties     : cible > 95%
Erreurs JS par session      : cible < 0.1%
Score Lighthouse Performance: cible > 90
```

---

## 10. Gestion des erreurs

### Matrice des erreurs et comportements

| Erreur | Ce qui se passe | Ce que voit le client |
|--------|-----------------|-----------------------|
| API SIV timeout | Fallback sélection manuelle | "Véhicule non reconnu, choisissez manuellement" |
| API TecDoc timeout | Fallback cache local | Résultats depuis le cache, aucun message d'erreur visible |
| Supabase stock inaccessible | Cache local affiché | "Stock estimé - vérifiez en caisse" |
| Plaque format invalide | Validation inline | "Format invalide — ex: AB-123-CD" |
| Réseau coupé | Mode offline activé | Borne fonctionne, banner discret "Mode hors ligne" |
| Commande échouée | Retry 3x, puis email fallback | "Commande reçue, confirmation sous 5 min" |
| Crash application | Rechargement auto | Retour automatique à l'accueil |

### Format des erreurs (API interne)

```typescript
// Toujours retourner un format structuré
interface ApiError {
  code: string          // "PLATE_INVALID" | "TECDOC_TIMEOUT" | ...
  message: string       // Message human-readable pour les logs
  userMessage?: string  // Message à afficher au client (si nécessaire)
  retry?: boolean       // L'erreur est-elle retryable ?
}
```

---

## 11. Organisation du développement

### Phases de développement

```
PHASE 1 — Fondations (Semaine 1)
├── Setup Next.js 14 + TypeScript + Tailwind
├── Configuration Supabase (schéma, RLS, migrations)
├── Configuration Auth0 (rôles, callbacks)
├── Pipeline CI/CD GitHub Actions + Vercel
├── Environnements dev / staging / prod
└── Maquettes Figma validées

PHASE 2 — Interface borne (Semaines 2-3)
├── Écran accueil + timer inactivité
├── Clavier plaque tactile + validation
├── Intégration API SIV
├── Intégration API TecDoc
├── Filtres catégories
├── Grille résultats + stock badges
├── Fiche produit + emplacement rayon
└── Module autres centres

PHASE 3 — Back-office (Semaine 4)
├── Dashboard admin
├── CRUD produits + import CSV
├── Gestion compatibilités (mapping)
├── Gestion stocks par centre
└── Analytique recherches

PHASE 4 — Intégration stock & robustesse (Semaine 5)
├── Connexion API/CSV stock existant (selon scénario)
├── Cache multi-niveaux
├── Mode offline (Service Worker)
├── Mode kiosque tablette (Guided Access / MDM)
├── Tests E2E complets
└── Audit sécurité

PHASE 5 — Pilote & livraison (Semaine 6)
├── Tests sur tablette physique (conditions réelles)
├── Test sous lumière magasin
├── Formation responsable Herblay
├── Monitoring Sentry + alertes configurées
├── Documentation finale
└── Mise en production
```

### Conventions de code

```typescript
// Nommage
const camelCase = 'variables et fonctions'
const PascalCase = 'composants React et types'
const SCREAMING_SNAKE = 'constantes globales'
const kebab-case = 'fichiers et dossiers'

// Commits (Conventional Commits)
feat: ajout module commande depuis la borne
fix: correction timer inactivité sur iOS
chore: mise à jour dépendances novembre 2025
docs: mise à jour README déploiement
test: ajout tests E2E écran résultats

// Pull Requests
- Titre descriptif en français
- Description : Quoi / Pourquoi / Comment tester
- Au moins 1 reviewer avant merge
- Tous les tests CI verts obligatoires
```

### Variables d'environnement

```bash
# .env.local (jamais commité sur Git)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # clé publique (lecture seule borne)
SUPABASE_SERVICE_KEY=              # clé secrète (back-office uniquement)

# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# APIs externes (JAMAIS exposées côté client)
SIV_API_KEY=
TECDOC_API_URL=
TECDOC_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## 12. Checklist avant mise en production

### Sécurité
- [ ] Headers HTTP de sécurité configurés et testés
- [ ] Rate limiting activé sur toutes les API routes
- [ ] Validation et sanitisation de tous les inputs
- [ ] Clés API uniquement dans les variables d'environnement Vercel
- [ ] Row Level Security activé sur toutes les tables Supabase
- [ ] MFA activé sur tous les comptes admin
- [ ] Mode kiosque configuré sur la tablette physique

### Performance
- [ ] Score Lighthouse ≥ 90 sur mobile
- [ ] Images converties en WebP et optimisées
- [ ] Cache configuré sur les routes API
- [ ] Service Worker installé (mode offline)
- [ ] Test sur connexion 4G limitée (simulation)

### Monitoring
- [ ] Sentry configuré avec alertes email + SMS
- [ ] Vercel Analytics activé
- [ ] Alertes stock configurées (> 4h sans update)
- [ ] Health check endpoint `/api/health` actif
- [ ] Dashboard monitoring partagé avec David Fiuza

### Tests
- [ ] Tests unitaires > 80% de couverture sur les fonctions critiques
- [ ] Tests E2E : 7 parcours client couverts
- [ ] Test physique sur tablette réelle en conditions magasin
- [ ] Test avec réseau dégradé (mode avion partiel)
- [ ] Test inactivité : reset après 90s vérifié

### Documentation
- [ ] README.md à jour
- [ ] CHANGELOG.md version 1.0.0 documentée
- [ ] Runbook incidents rédigé
- [ ] Guide back-office avec captures d'écran remis à David
- [ ] Variables d'environnement documentées (sans les valeurs)

### Déploiement
- [ ] Migration BDD exécutée sur staging et validée
- [ ] Déploiement staging testé et validé par David
- [ ] Rollback testé (revenir v0 depuis v1 en < 1 min)
- [ ] Fenêtre de déploiement production planifiée (6h-9h)
- [ ] Notification équipes Autobacs envoyée

---

## Annexes

### Commandes utiles

```bash
# Développement
npm run dev              # Lancer en local
npm run build            # Build production
npm run lint             # Vérification ESLint
npm run type-check       # Vérification TypeScript

# Tests
npm run test             # Tests unitaires (watch mode)
npm run test:ci          # Tests unitaires (CI)
npm run test:e2e         # Tests Playwright

# Base de données
npm run db:migrate       # Appliquer les migrations
npm run db:reset         # Reset DB locale (dev uniquement)
npm run db:seed          # Injecter données de test

# Déploiement
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel rollback          # Rollback dernier déploiement
```

### Contacts

| Rôle | Nom | Contact |
|------|-----|---------|
| Prestataire | M. Andrys MAGAR | andrys.developper@gmail.com |
| Client — Direction | M. Kar Wai Lau | Autobacs France |
| Client — Opérations | M. David Fiuza | Autobacs France |
| Support TecDoc | TecAlliance | tecalliance.net |
| Support Supabase | Supabase Support | supabase.com/support |
| Support Vercel | Vercel Support | vercel.com/support |

---

*Document vivant — mis à jour à chaque release majeure.*  
*Version actuelle : 1.0.0 — Mars 2025*  
*Propriété intellectuelle : Autobacs France à la livraison finale.*
