# 🚗 Borne de Recherche Produit — Autobacs France
## Documentation Technique & Fonctionnelle Complète

> **Prestataire** : M. Andrys MAGAR — MAGAR Développement · andrys.developper@gmail.com  
> **Client** : Autobacs France · M. David Fiuza · M. Kar Wai Lau  
> **Référence** : CDC-2025-BRN-002  
> **Version** : 1.0 — Avril 2025  
> **Statut** : En cours de développement — POC phase 1  

---

## Table des matières

1. [Contexte & Objectifs](#1-contexte--objectifs)
2. [Ce que fait l'application](#2-ce-que-fait-lapplication)
3. [Parcours client en 6 étapes](#3-parcours-client-en-6-étapes)
4. [Fonctionnalités complètes](#4-fonctionnalités-complètes)
5. [Sous-critères par catégorie](#5-sous-critères-par-catégorie)
6. [Cas d'utilisation](#6-cas-dutilisation)
7. [Minuteurs & Performances](#7-minuteurs--performances)
8. [Sécurité](#8-sécurité)
9. [Architecture technique](#9-architecture-technique)
10. [Base de données](#10-base-de-données)
11. [Intégrations externes](#11-intégrations-externes)
12. [Scanner code-barres](#12-scanner-code-barres)
13. [Comparatif Norauto](#13-comparatif-norauto)
14. [Cycle de vie & Déploiement](#14-cycle-de-vie--déploiement)
15. [Monitoring & Alertes](#15-monitoring--alertes)
16. [Organisation du développement](#16-organisation-du-développement)
17. [Données nécessaires](#17-données-nécessaires)
18. [Conditions commerciales](#18-conditions-commerciales)
19. [Checklist avant production](#19-checklist-avant-production)

---

## 1. Contexte & Objectifs

### Situation actuelle

Autobacs France utilise la solution **Reparmax Bornes** (`autobacs.bornes.reparmax.com`) qui permet la recherche produit via QR code. Cette solution présente trois limites majeures :

- **Pas de stock visible** — le client ne sait pas si le produit est disponible en magasin
- **QR code obligatoire** — le client doit scanner un QR code avant toute recherche, créant une friction inutile
- **Pas d'outil réseau** — aucune visibilité sur les stocks des autres centres Autobacs
- **Éditeur tiers** — Autobacs ne possède pas le code, ne contrôle pas les évolutions

### Objectifs du projet

| Objectif | Cible |
|----------|-------|
| Temps de recherche | < 30 secondes du début à la fin |
| Identification véhicule | < 1,5 seconde |
| Disponibilité borne | > 99,5 % uptime |
| Remplacement Reparmax | 100 % — propriété totale Autobacs |
| Déploiement pilote | Centre Herblay |
| Extension réseau | 10 centres en Île-de-France |

### Catalogue fermé

La borne affiche **uniquement les produits Autobacs et Bosch**. Pas de références TecDoc tierces, pas d'autres marques. Ce choix simplifie le mapping de compatibilité et garantit la maîtrise totale du catalogue.

---

## 2. Ce que fait l'application

### Vue d'ensemble

```
CLIENT ENTRE SA PLAQUE
        ↓
API SIV identifie le véhicule (marque, modèle, année, motorisation)
        ↓
Client choisit une catégorie (ampoules, batteries, huiles...)
        ↓
Client affine avec un sous-critère (type de feu, capacité Ah...)
        ↓
Affichage des produits Autobacs & Bosch compatibles avec stock réel
        ↓
┌──────────────────────────────────────────────────────┐
│ Produit en stock ici      → Emplacement rayon + CTA  │
│ Produit épuisé ici        → Autres centres du réseau │
│ Produit nulle part        → Commande SMS/email        │
│ Client scanne code-barres → Vérification compatibilité│
└──────────────────────────────────────────────────────┘
```

### Deux interfaces

**Interface borne client** — fullscreen tactile, dark theme, touches 60px minimum, reset auto 90s  
**Back-office admin** — web desktop, gestion catalogue / stocks / promos / utilisateurs

---

## 3. Parcours client en 6 étapes

### Principe fondamental
**Une seule décision par écran.** Le client ne voit jamais plus de 4 options simultanées. Pas de scroll.

---

### Étape 1 — Accueil

**À gauche :**
- Titre "Trouvez vos pièces"
- Sous-titre explicatif
- Champ plaque immatriculation avec drapeau FR (style européen)
- Clavier tactile intégré (touches 60px, 6 colonnes)
- Bouton "Rechercher" orange

**À droite :**
- 3 cartes promotions du moment (configurables back-office)
- 4 raccourcis catégories sans plaque

**En haut :**
- Bandeau promotionnel défilant (ticker configurable back-office)

**Reset automatique :** 90 secondes d'inactivité → retour accueil

---

### Étape 2 — Catégories

Après identification du véhicule via API SIV.

- Badge véhicule persistant en haut à droite (plaque + modèle détecté)
- 8 grandes cartes visuelles (grille 2×4)
- Chaque carte : icône, nom, compteur produits disponibles, **conseil expert en italique orange**

```
Ampoules      · "Vérifiez le type de culot avant d'acheter (H7, H4, W5W)"
Essuie-glaces · "Mesurez la longueur ou entrez votre plaque pour la dimension exacte"
Batteries     · "Pour les Start-Stop, AGM ou EFB sont obligatoires"
Huiles        · "Vérifiez la viscosité ET la norme constructeur dans votre carnet"
Pneus         · "La dimension est sur le flanc de votre pneu : ex. 205/55 R16"
Freins        · "Les plaquettes avant s'usent 2× plus vite que les arrière"
Filtres       · "Un filtre encrassé augmente la consommation jusqu'à 10 %"
Accessoires   · "Tapis, dégivrants, produits d'entretien, sécurité..."
```

---

### Étape 3 — Sous-critères

6 sous-critères spécifiques à la catégorie choisie. Évite d'afficher tous les produits d'un coup. Voir [section 5](#5-sous-critères-par-catégorie) pour le détail complet.

---

### Étape 4 — Résultats

- **Maximum 4 produits par écran** (pas de scroll)
- Filtres en onglets : Tous / En stock ici / Équivalents / Autres centres
- Chaque carte produit :
  - Marque (AUTOBACS ou BOSCH)
  - Nom du produit
  - Spec technique (ex: "H7 12V 55W")
  - Prix en orange
  - Badge stock : vert (quantité) / orange (dernier) / rouge (indisponible)
  - Aperçu conseil expert (2 lignes tronquées)

---

### Étape 5 — Fiche produit

**Gauche :** grande zone image/icône produit  
**Droite :**
- Marque en orange
- Nom complet
- Prix grand format orange
- **Bloc conseil expert complet** (bordure orange, texte italique)
- Tableau specs techniques (clé / valeur)
- Stock exact + emplacement rayon (allée + numéro étagère)
- **Bouton "Trouver en rayon"** (primaire orange, pleine largeur)
- **Bouton "Réserver en caisse"** (secondaire ghost)
- **Bouton "Envoyer par SMS"** (envoie la fiche sur le téléphone du client)

---

### Étape 6 — Indisponible / Autres centres

Si produit en rupture à ce centre :

**Section 1 — Produits équivalents disponibles ici**
2 à 3 produits compatibles en stock, même catégorie

**Section 2 — Produit exact dans d'autres centres**
Liste des centres Autobacs IDF avec :
- Point vert (en stock) ou orange (dernier)
- Nom et adresse du centre
- Quantité disponible
- Distance en km

**Section 3 — Commander**
Bannière CTA : livraison 24-48h ou Click & Collect 2h + confirmation SMS

---

## 4. Fonctionnalités complètes

### MVP — Indispensables (inclus dans le forfait)

| Fonctionnalité | Détail |
|----------------|--------|
| Clavier plaque tactile | Auto-formatage SIV (AB-123-CD) et FNI, touches 60px, effacement lettre par lettre |
| Identification API SIV | Appel API gouvernementale gratuite, timeout 3s, fallback sélection manuelle |
| 8 catégories + conseil expert | Icône, compteur produits, conseil expert italique orange par catégorie |
| 6 sous-critères par catégorie | Filtrage spécifique avant résultats, adapté à chaque type de produit |
| Catalogue fermé Autobacs & Bosch | Uniquement les deux marques, pas de TecDoc tiers |
| Stock temps réel par centre | Quantité exacte, badge vert/orange/rouge, emplacement allée + étagère |
| Conseil expert par produit | Speech unique par produit — aperçu sur carte, intégral sur fiche |
| Produits équivalents | 2-3 alternatives compatibles en stock si rupture |
| Autres centres avec stock | Triés par distance, adresse, quantité |
| Reset automatique 90s | Retour accueil, effacement session, prêt pour client suivant |
| Back-office administration | Catalogue, stocks, textes conseil, promos, utilisateurs, imports CSV |
| Mode offline cache local | Cache mis à jour toutes les heures, borne fonctionnelle sans internet |

### V1.1 — Importantes (inclus dans le forfait)

| Fonctionnalité | Détail |
|----------------|--------|
| Bandeau promotionnel défilant | Ticker configurable back-office, visible en permanence même en attente |
| 3 cartes promotions accueil | Cliquables, badge (-33%, PROMO, ECO), redirection directe résultats |
| **Scanner code-barres** | Camera tablette — client scanne un produit → vérification compatibilité + prix |
| **Envoi fiche produit par SMS** | Emplacement rayon + fiche sur téléphone client via Twilio |
| Commande depuis la borne | Formulaire minimal, confirmation SMS, livraison 24-48h ou Click & Collect 2h |
| Multi-tablettes par rayon | Une tablette par section, rayon par défaut configurable |
| Analytics recherches | Logs anonymisés, catégories populaires, produits non trouvés |
| Mode kiosque sécurisé | iPad : Guided Access · Android : MDM |

### V2 — Optionnelles (avenant séparé)

| Fonctionnalité | Détail |
|----------------|--------|
| Guidage en rayon | Plan simplifié magasin avec localisation produit |
| Recommandations croisées | Si ampoule H7 → proposer dégivrant ou kit remplacement |
| Promotions sur fiches produit | Badge promo synchronisé avec le bandeau défilant |
| QR code fiche produit | Client scanne pour continuer sur son téléphone |

---

## 5. Sous-critères par catégorie

| Catégorie | SC 1 | SC 2 | SC 3 | SC 4 | SC 5 | SC 6 |
|-----------|------|------|------|------|------|------|
| **Ampoules** | Feux de croisement (H7, H11) | Feux de route (H1, HB3) | Position (W5W, T10) | Clignotants (P21W) | Feux stop / AR | Feux de recul |
| **Essuie-glaces** | Avant gauche — conducteur | Avant droit — passager | Arrière — hayon/break | Hiver (-30°C) | Plats (beam) | Adaptateurs |
| **Batteries** | 45-55 Ah — citadines | 60-70 Ah — berlines | 80-100 Ah — SUV | AGM/EFB — Start-Stop | Accessoires batterie | Reprise ancienne |
| **Huiles** | 5W-30 — modernes | 5W-40 — polyvalente | 0W-30/0W-40 — récents | 10W-40 — anciens | Additifs & traitements | 1L (appoint) vs 5L |
| **Pneus** | 195/65 R15 | 205/55 R16 | 215/60 R17 | Hiver (3PMSF) | 4 saisons (M+S) | Pack montage inclus |
| **Freins** | Plaquettes avant | Plaquettes arrière | Disques avant | Disques arrière | Liquide DOT4 | Kit disques+plaquettes |
| **Filtres** | Filtre air moteur | Filtre à huile | Filtre habitacle | Filtre carburant | Kit révision 3 filtres | Filtres spéciaux |
| **Accessoires** | Entretien carrosserie | Traitement vitres | Tapis de sol | Supports & chargeurs | Sécurité (triangle, gilet) | Lavage & shampoings |

---

## 6. Cas d'utilisation

| Cas | Situation | Résolution |
|-----|-----------|------------|
| **CAS 1** | Produit trouvé en stock local | Plaque → catégorie → sous-critère → produit → emplacement rayon |
| **CAS 2** | Produit épuisé dans ce centre | Affichage automatique autres centres avec stock et distance |
| **CAS 3** | Commande depuis la borne | Formulaire email/tél → confirmation SMS → livraison 24-48h ou C&C 2h |
| **CAS 4** | Client sans plaque | Sélection manuelle Marque → Modèle → Motorisation → Année |
| **CAS 5** | Véhicule non reconnu par API SIV | Fallback sélection manuelle + message clair, aucune erreur visible |
| **CAS 6** | Client scanne un code-barres | Caméra tablette → vérification compatibilité + prix + alternatives |
| **CAS 7** | Envoi fiche par SMS | Client tape son numéro → reçoit emplacement + fiche sur son téléphone |
| **CAS 8** | Tablette nomade technicien | Mode portrait, vérification stock en rayon, accompagnement client |
| **CAS 9** | Inactivité > 90 secondes | Reset automatique → retour accueil → prêt pour client suivant |
| **CAS 10** | Réseau coupé | Mode offline — cache local affiché avec indication "données mises à jour il y a Xh" |

---

## 7. Minuteurs & Performances

### Minuteurs système

| Événement | Durée | Action |
|-----------|-------|--------|
| Inactivité borne | 90 secondes | Retour accueil + reset complet état |
| Timeout API SIV | 3 secondes | Fallback sélection manuelle |
| Timeout API stock | 2 secondes | Cache local affiché |
| Animation chargement | Dès 300ms | Spinner si pas de réponse |
| Cache local refresh | 60 minutes | Mise à jour silencieuse |
| Session commande | 10 minutes | Expiration formulaire non soumis |
| Alerte stock non mis à jour | 4 heures | Email responsable centre |
| Borne inactive | 30 minutes | Alerte monitoring |

### Temps de réponse cibles

```
Saisie plaque → Identification véhicule  : < 1,5 seconde
Identification → Affichage catégories    : < 500ms
Navigation entre écrans                  : < 200ms (instantané)
Chargement images produits               : < 500ms (CDN)
Soumission commande → SMS client         : < 10 secondes
Score Lighthouse Performance             : > 90
```

### Reset inactivité — pseudocode

```javascript
const INACTIVITY_TIMEOUT = 90_000 // 90 secondes

let inactivityTimer

function resetInactivityTimer() {
  clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    clearAppState()       // vider plaque, véhicule, catégorie
    clearSearchResults()  // vider les résultats
    navigateTo('home')    // retour accueil
    logEvent('inactivity_reset') // log analytics
  }, INACTIVITY_TIMEOUT)
}

document.addEventListener('touchstart', resetInactivityTimer)
document.addEventListener('touchend', resetInactivityTimer)
document.addEventListener('click', resetInactivityTimer)
```

---

## 8. Sécurité

### Architecture sécurité

```
┌─────────────────────────────────────────────────┐
│               INTERNET                          │
├─────────────────────────────────────────────────┤
│ Borne client  → lecture seule, anonyme          │
│ Back-office   → authentifié, rôles stricts      │
└──────────────┬──────────────────────────────────┘
               │ HTTPS TLS 1.3 uniquement
               ▼
┌─────────────────────────────────────────────────┐
│         VERCEL EDGE (CDN + WAF)                 │
│  Rate limiting · Headers sécurité               │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│      NEXT.JS API ROUTES (Backend)               │
│  Validation inputs · Sanitisation · Auth check  │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│    SUPABASE (PostgreSQL + Row Level Security)   │
│  RLS : chaque centre ne voit que son stock      │
└─────────────────────────────────────────────────┘
```

### Validation plaque

```typescript
const PLATE_REGEX = {
  SIV: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/,
  FNI: /^\d{1,4}\s?[A-Z]{1,3}\s?\d{2,3}$/
}

function validatePlate(input: string): boolean {
  const normalized = input.trim().toUpperCase()
  return PLATE_REGEX.SIV.test(normalized) || PLATE_REGEX.FNI.test(normalized)
}
```

### Rate limiting

| Acteur | Limite |
|--------|--------|
| Borne anonyme | 60 requêtes / minute / IP |
| Back-office | 300 requêtes / minute / utilisateur |
| API commande | 5 commandes / heure / IP |

### Mode kiosque

```
Android : MDM (Mobile Device Management)
          → seule l'app borne accessible
          → pas d'accès paramètres, notifications, autres apps

iPad : Guided Access (natif iOS)
       → triple tap bouton latéral pour activer
       → PIN requis pour sortir
```

### RGPD

```
Données collectées (anonymisées) :
✅ Marque/modèle détecté (pas la plaque brute)
✅ Catégorie recherchée
✅ Produit consulté
✅ Résultat trouvé ou non

❌ Plaque brute (jamais stockée après identification)
❌ Données personnelles sans consentement

Données commande :
→ Email/téléphone supprimés après 30 jours
→ Mention légale affichée avant soumission
```

### Headers HTTP

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 9. Architecture technique

### Stack

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| Interface borne | Next.js 14 · Tailwind CSS | App web fullscreen tactile |
| Base de données | Supabase PostgreSQL | Catalogue, stock, logs, RLS par centre |
| Identification plaque | API SIV gouvernementale | Gratuite · timeout 3s · fallback manuel |
| Authentification back-office | Auth0 | MFA · rôles par centre · session 8h |
| SMS | Twilio | Commande + envoi fiche produit |
| Déploiement | Vercel Edge | Mise à jour toutes bornes en < 30s à distance |
| Monitoring | Sentry + Vercel Analytics | Erreurs temps réel · Core Web Vitals |
| Mode kiosque | Guided Access / MDM | iPad · Android |
| Scanner code-barres | API Web Camera (navigateur) | Lecture QR/code-barres sans app native |

### Structure des dossiers

```
borne-autobacs/
├── app/
│   ├── kiosk/                    # Interface borne client
│   │   ├── page.tsx              # Accueil + clavier plaque
│   │   ├── categories/page.tsx   # Catégories
│   │   ├── subcriteria/page.tsx  # Sous-critères
│   │   ├── results/page.tsx      # Résultats produits
│   │   ├── product/[id]/page.tsx # Fiche produit
│   │   ├── stores/page.tsx       # Autres centres
│   │   ├── order/page.tsx        # Formulaire commande
│   │   └── scanner/page.tsx      # Scanner code-barres
│   │
│   ├── admin/                    # Back-office
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── stock/page.tsx
│   │   ├── promos/page.tsx
│   │   ├── import/page.tsx
│   │   └── analytics/page.tsx
│   │
│   └── api/                      # Routes API backend
│       ├── identify/route.ts     # Identification plaque → véhicule
│       ├── products/route.ts     # Catalogue produits
│       ├── stock/route.ts        # Stock par centre
│       ├── order/route.ts        # Passer commande
│       ├── sms/route.ts          # Envoi SMS fiche produit
│       ├── scan/route.ts         # Vérification code-barres
│       └── import/route.ts       # Import CSV
│
├── components/
│   ├── kiosk/
│   │   ├── PlateKeyboard.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── SubcriteriaGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductSpeech.tsx
│   │   ├── StockBadge.tsx
│   │   ├── StoreList.tsx
│   │   ├── BarcodeScanner.tsx
│   │   ├── PromoBanner.tsx
│   │   └── InactivityTimer.tsx
│   └── admin/
│
├── lib/
│   ├── siv.ts                    # Client API SIV
│   ├── supabase.ts               # Client Supabase
│   ├── twilio.ts                 # Client SMS
│   ├── cache.ts                  # Cache local offline
│   ├── barcode.ts                # Décodage code-barres
│   └── validation.ts             # Validation inputs
│
├── supabase/
│   └── migrations/               # Migrations versionnées
└── tests/
    ├── unit/                     # Vitest
    └── e2e/                      # Playwright
```

---

## 10. Base de données

### Schéma Supabase

```sql
-- Centres Autobacs
CREATE TABLE centres (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT NOT NULL,
  adresse     TEXT NOT NULL,
  ville       TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Catégories produits
CREATE TABLE categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug  TEXT UNIQUE NOT NULL,       -- "ampoules"
  nom   TEXT NOT NULL,              -- "Ampoules"
  conseil_expert TEXT,              -- speech affiché sur la carte catégorie
  ordre SMALLINT DEFAULT 0
);

-- Sous-critères par catégorie
CREATE TABLE subcriteria (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  UUID REFERENCES categories(id),
  nom          TEXT NOT NULL,       -- "Feux de croisement (H7, H11)"
  ordre        SMALLINT DEFAULT 0
);

-- Produits catalogue (Autobacs & Bosch uniquement)
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference       TEXT UNIQUE NOT NULL,   -- "BOSCH-H7-PURE"
  designation     TEXT NOT NULL,
  marque          TEXT NOT NULL,          -- "BOSCH" | "AUTOBACS"
  category_id     UUID REFERENCES categories(id),
  subcriteria_id  UUID REFERENCES subcriteria(id),
  prix_ttc        DECIMAL(8,2) NOT NULL,
  photo_url       TEXT,
  conseil_expert  TEXT,                   -- speech complet affiché sur la fiche
  specifications  JSONB,                  -- {"type":"H7","voltage":"12V",...}
  code_barres     TEXT,                   -- EAN-13 pour le scanner
  is_active       BOOLEAN DEFAULT true,
  is_promo        BOOLEAN DEFAULT false,
  prix_promo      DECIMAL(8,2),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Compatibilités véhicules (via marque/modèle/année — pas TecDoc)
CREATE TABLE compatibilities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  marque       TEXT NOT NULL,    -- "Renault"
  modele       TEXT NOT NULL,    -- "Clio V"
  annee_debut  SMALLINT,
  annee_fin    SMALLINT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, marque, modele, annee_debut)
);

-- Stock par centre
CREATE TABLE stock (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products(id) ON DELETE CASCADE,
  centre_id    UUID REFERENCES centres(id) ON DELETE CASCADE,
  quantite     INTEGER NOT NULL DEFAULT 0,
  emplacement  TEXT,             -- "Rayon A · Étagère 3"
  seuil_alerte INTEGER DEFAULT 2,
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, centre_id)
);

-- Promotions configurables
CREATE TABLE promotions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       TEXT NOT NULL,
  sous_titre  TEXT,
  badge       TEXT,             -- "-33%", "PROMO", "ECO"
  category_id UUID REFERENCES categories(id),
  date_debut  DATE,
  date_fin    DATE,
  is_active   BOOLEAN DEFAULT true,
  ordre       SMALLINT DEFAULT 0
);

-- Logs recherches (anonymisés RGPD)
CREATE TABLE search_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id      UUID REFERENCES centres(id),
  vehicle_marque TEXT,
  vehicle_modele TEXT,
  vehicle_annee  SMALLINT,
  category_slug  TEXT,
  subcriteria    TEXT,
  nb_resultats   INTEGER,
  produit_scanne BOOLEAN DEFAULT false,
  searched_at    TIMESTAMPTZ DEFAULT now()
);

-- Commandes depuis la borne
CREATE TABLE orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id   UUID REFERENCES centres(id),
  product_id  UUID REFERENCES products(id),
  contact     TEXT NOT NULL,         -- email ou tél (chiffré)
  type        TEXT NOT NULL,         -- 'livraison' | 'click_collect'
  statut      TEXT DEFAULT 'en_attente',
  created_at  TIMESTAMPTZ DEFAULT now(),
  expires_at  TIMESTAMPTZ DEFAULT now() + interval '30 days'
);

-- Index de performance
CREATE INDEX idx_compat_product   ON compatibilities(product_id);
CREATE INDEX idx_compat_marque    ON compatibilities(marque, modele);
CREATE INDEX idx_stock_centre     ON stock(centre_id);
CREATE INDEX idx_stock_product    ON stock(product_id);
CREATE INDEX idx_products_cat     ON products(category_id);
CREATE INDEX idx_products_barcode ON products(code_barres);
CREATE INDEX idx_logs_date        ON search_logs(searched_at DESC);
```

---

## 11. Intégrations externes

### API SIV — Identification plaque

```typescript
// lib/siv.ts
export async function identifyPlate(plate: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const response = await fetch(
      `${process.env.SIV_API_URL}/vehicule/${plate}`,
      {
        signal: controller.signal,
        headers: { 'Authorization': `Bearer ${process.env.SIV_API_KEY}` }
      }
    )
    const data = await response.json()
    return {
      marque: data.marque,
      modele: data.modele,
      annee: data.annee_premiere_immat,
      motorisation: data.energie,
    }
  } catch (error) {
    if (error.name === 'AbortError') return null  // fallback manuel
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
```

### Twilio — SMS

```typescript
// lib/twilio.ts
export async function sendProductFiche(phone: string, product: Product, stock: Stock) {
  await client.messages.create({
    body: `Autobacs ${stock.centreName}\n`
        + `${product.designation}\n`
        + `${stock.emplacement}\n`
        + `Prix : ${product.prix_ttc} €`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  })
}
```

---

## 12. Scanner code-barres

### Fonctionnement

Le scanner utilise la **caméra native de la tablette** via l'API Web (pas d'app native requise). Aucun matériel supplémentaire nécessaire.

```
Client tape "Scanner un produit"
        ↓
Caméra s'active (API MediaDevices)
        ↓
Bibliothèque ZXing décode le code EAN-13
        ↓
Requête backend : code-barres → produit
        ↓
Si produit trouvé : affiche fiche + vérifie compatibilité si plaque connue
Si produit inconnu : "Produit non référencé chez Autobacs"
Si produit compatible : badge vert "Compatible avec votre véhicule"
Si produit incompatible : badge rouge + équivalents compatibles
```

### Intégration

```typescript
// lib/barcode.ts
import { BrowserMultiFormatReader } from '@zxing/library'

export async function startScanner(videoElement: HTMLVideoElement) {
  const reader = new BrowserMultiFormatReader()
  return reader.decodeFromVideoDevice(null, videoElement, (result) => {
    if (result) {
      const barcode = result.getText()
      lookupProduct(barcode) // appel API backend
    }
  })
}
```

---

## 13. Comparatif Norauto

| Fonctionnalité | Norauto | Autobacs (MAGAR) |
|----------------|---------|------------------|
| Recherche par plaque | ✅ Clavier virtuel | ✅ Clavier tactile optimisé |
| Sélection manuelle véhicule | ✅ Logos marques | ✅ Fallback plaque |
| Catégories visuelles | ✅ 8 catégories | ✅ 8 catégories + conseil expert |
| Sous-critères de filtrage | ✅ 3 niveaux de navigation | ✅ 6 sous-critères directs |
| Stock visible | ✅ "En stock / Sur commande" | ✅ Quantité exacte + badge couleur |
| Emplacement rayon | ✅ Fonction "Localiser" | ✅ Allée + étagère sur fiche |
| Tri par prix | ✅ Présent | ✅ Présent |
| **Stock autres magasins** | ❌ Absent | ✅ Tous les centres + distance |
| **Conseil expert produit** | ❌ Absent | ✅ Speech complet par produit |
| **Scanner code-barres** | ❌ Absent | ✅ Camera tablette |
| **Envoi fiche par SMS** | ❌ Absent | ✅ Via Twilio |
| **Promotions configurables** | ❌ Absent | ✅ Bandeau + 3 cartes |
| **Commande depuis borne** | ❌ Absent | ✅ Livraison / Click & Collect |
| **Back-office propriétaire** | ❌ Éditeur tiers | ✅ 100% propriété Autobacs |
| **Multi-tablettes par rayon** | ❌ Borne fixe centrale | ✅ 1 tablette par section |
| Fluidité tactile | ⚠️ Scroll peu fluide | ✅ Pas de scroll — 4 produits max |
| Taille zones tactiles | ⚠️ Boutons trop petits | ✅ 60px minimum |

**Résultat : 8 fonctionnalités exclusives absentes chez Norauto.**

---

## 14. Cycle de vie & Déploiement

### Versioning SemVer

```
1.0.0 → Mise en production pilote Herblay
1.0.x → Corrections bugs
1.1.0 → Scanner code-barres + SMS fiche (V1.1)
1.2.0 → Extension multi-centres
2.0.0 → Fonctionnalités V2 (guidage rayon, recommandations)
```

### Branches Git

```
main      → Production (protégée, jamais de push direct)
staging   → Recette client validée par David Fiuza
develop   → Développement actif
feature/* → Fonctionnalité en cours
hotfix/*  → Correction urgente prod
```

### Pipeline CI/CD

```
Push develop
    → ESLint + TypeScript check
    → Tests Vitest (unitaires)
    → Tests Playwright (E2E)
    → npm audit (sécurité)
    → Deploy preview Vercel

Merge staging
    → Deploy staging.borne-autobacs.fr
    → Notification email David Fiuza

Merge main (après validation)
    → Deploy production
    → Toutes les bornes mises à jour en < 30 secondes
    → Health check automatique
    → Rollback 1 clic si problème
```

### Fenêtres de déploiement

```
✅ Autorisé    : 6h00 → 9h00 (avant ouverture centres)
⚠️ Déconseillé : 11h → 14h et 16h → 19h (heures de pointe)
🚨 Hotfix P0  : déployable à tout moment avec notification
```

---

## 15. Monitoring & Alertes

| Outil | Surveille | Alerte si |
|-------|-----------|-----------|
| **Sentry** | Erreurs JS runtime | Nouvelle erreur critique |
| **Vercel Analytics** | Uptime, temps de réponse | Uptime < 99% sur 5 min |
| **Supabase** | Connexions DB, requêtes lentes | Requête > 2s |
| **Job custom** | Stock non mis à jour | > 4h sans mise à jour |
| **Job custom** | Borne inactive | > 30 min sans requête |

### Niveaux d'alerte

```
🔴 CRITIQUE  → SMS immédiat
   Borne inutilisable, stock inaccessible, DB down

🟠 MAJEUR    → Email immédiat
   Fonction dégradée, temps de réponse > 5s

🟡 MINEUR    → Email résumé quotidien
   Erreurs ponctuelles, stock bas, imports partiels
```

### Métriques cibles

```
Disponibilité borne          > 99,5%
Temps identification plaque  < 1,5s
Taux produits trouvés        > 80% des recherches
Erreurs JS par session       < 0,1%
Score Lighthouse             > 90
```

---

## 16. Organisation du développement

### Planning

| Semaine | Contenu |
|---------|---------|
| **1** | Cadrage · Accès données catalogue · Maquettes Figma validées · Config infrastructure |
| **2–3** | Interface borne : accueil + plaque + API SIV + catégories + sous-critères + résultats + fiche |
| **4** | Étape 6 (indisponible) · Scanner code-barres · Promos défilantes · Back-office admin |
| **5** | Intégration stock · Envoi SMS fiche · Mode offline · Multi-tablettes · Mode kiosque · Tests QA |
| **6** | Déploiement pilote Herblay · Tests terrain tablette physique · Formation responsable · Production |

### Variables d'environnement

```bash
# .env.local — jamais commité sur Git

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Auth0 (back-office)
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# APIs externes — jamais exposées côté client
SIV_API_URL=
SIV_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

### Commandes utiles

```bash
# Développement
npm run dev              # Lancer en local
npm run build            # Build production
npm run lint             # ESLint
npm run type-check       # TypeScript

# Tests
npm run test             # Vitest watch
npm run test:ci          # Tests CI
npm run test:e2e         # Playwright

# Base de données
npm run db:migrate       # Appliquer migrations
npm run db:reset         # Reset DB locale
npm run db:seed          # Données de test

# Déploiement
vercel                   # Deploy preview
vercel --prod            # Deploy production
vercel rollback          # Rollback
```

---

## 17. Données nécessaires

### Ce qu'il faut pour démarrer

| Donnée | Format | Délai requis |
|--------|--------|--------------|
| Catalogue produits (ampoules minimum) | CSV, Excel, JSON | 5 jours ouvrés après signature |
| Stock par centre | Export Excel par magasin | 5 jours ouvrés après signature |
| Codes-barres EAN-13 des produits | Colonne dans l'export | En même temps que le catalogue |
| Logiciel de caisse actuel par centre | Information verbale | À l'appel |

### Structure catalogue attendue

```csv
reference,designation,marque,categorie,sous_critere,prix_ttc,code_barres,conseil_expert
BOSCH-H7-PURE,"Ampoule H7 Pure Light 55W",BOSCH,ampoules,croisement,9.90,4047024301898,"L'ampoule H7 est la plus courante en Europe..."
```

### Structure stock attendue

```csv
reference,centre,quantite,emplacement
BOSCH-H7-PURE,Herblay,8,"Rayon A · Étagère 3"
BOSCH-H7-PURE,Rosny,4,"Rayon B · Étagère 1"
```

---

## 18. Conditions commerciales

| Élément | Détail |
|---------|--------|
| **Mode de facturation** | Forfait — prix ferme et définitif |
| **Option A (avec acompte)** | 15 000 € HT — acompte 40 % à la signature |
| **Option B (sans acompte)** | 17 500 € HT — totalité à la validation |
| **Condition de paiement** | Le solde n'est dû qu'à l'approbation du résultat par le Client |
| **Délai de livraison** | 4 à 6 semaines après réception des données |
| **Propriété intellectuelle** | Code source propriété Autobacs à règlement complet |
| **Maintenance** | 6 premiers mois offerts · puis 400 € / mois |
| **Extension par centre** | 500 € par centre supplémentaire |
| **Réseau complet (9 centres)** | 3 500 € |
| **Hébergement** | Vercel + Supabase ~80 € / mois — à la charge d'Autobacs |
| **Matériel** | Tablettes fournies par Autobacs — non inclus |

---

## 19. Checklist avant mise en production

### Sécurité
- [ ] Headers HTTP configurés et testés
- [ ] Rate limiting activé sur toutes les API routes
- [ ] Validation et sanitisation de tous les inputs
- [ ] Clés API dans variables d'environnement Vercel uniquement
- [ ] Row Level Security activé sur toutes les tables Supabase
- [ ] MFA activé sur tous les comptes admin back-office
- [ ] Mode kiosque configuré sur la tablette physique

### Fonctionnel
- [ ] Clavier plaque testé sur tablette réelle (pas navigateur desktop)
- [ ] API SIV testée avec vraies plaques IDF
- [ ] Stock affiché correctement par centre
- [ ] Scanner code-barres testé sur produits réels
- [ ] Envoi SMS fiche produit testé et reçu
- [ ] Reset 90s vérifié
- [ ] Mode offline vérifié (mode avion tablette)
- [ ] Autres centres affichés correctement

### Performance
- [ ] Score Lighthouse ≥ 90 sur tablette
- [ ] Images en WebP optimisées
- [ ] Cache configuré sur routes API
- [ ] Test sur connexion réseau dégradée

### Déploiement
- [ ] Migrations BDD exécutées sur staging
- [ ] Déploiement staging validé par David Fiuza
- [ ] Rollback testé
- [ ] Monitoring Sentry configuré avec alertes
- [ ] Formation responsable Herblay planifiée
- [ ] Fenêtre déploiement prod réservée (6h-9h)

---

## Contacts

| Rôle | Nom | Contact |
|------|-----|---------|
| Prestataire | M. Andrys MAGAR | andrys.developper@gmail.com |
| Client — Président | M. Kar Wai Lau | Autobacs France |
| Client — Opérations | M. David Fiuza | Autobacs France |
| Hébergement | Vercel Support | vercel.com/support |
| Base de données | Supabase Support | supabase.com/support |
| SMS | Twilio Support | twilio.com/support |

---

*Document vivant — mis à jour à chaque release majeure.*  
*Version 1.0 — Avril 2025 — Référence CDC-2025-BRN-002*  
*Propriété intellectuelle : Autobacs France à règlement complet.*
