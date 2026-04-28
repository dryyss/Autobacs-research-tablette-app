# Cahier de données — Borne kiosque Autobacs

**Destinataire :** FLUXEA
**Émetteur :** MAGAR Développement
**Projet :** Borne tactile en magasin Autobacs — recherche pièces par plaque
**Objet :** Liste des données nécessaires pour établissement du devis

---

## Contexte

La borne tactile permet à un client en magasin Autobacs :

1. de saisir sa plaque d'immatriculation pour identifier son véhicule,
2. de visualiser la fiche technique du véhicule,
3. de consulter le catalogue des pièces compatibles (filtré par véhicule),
4. de vérifier la disponibilité en stock dans le magasin courant et les autres centres,
5. d'obtenir le prix, le code-barres EAN-13 et les caractéristiques de chaque produit.

Pour fonctionner, la borne consomme **quatre flux de données distincts** :

- **Flux 1 :** Identification véhicule par plaque → renvoie un véhicule + son **K-Type TecDoc**
- **Flux 2 :** Catalogue pièces compatibles par K-Type → renvoie la liste des SKU adaptés
- **Flux 3 :** Stock en temps réel par SKU et par magasin
- **Flux 4 :** Métadonnées catalogue (catégories, promotions, contenu marketing)

---

## 1. Flux Identification véhicule (plaque → fiche véhicule)

**Endpoint attendu :** `GET /vehicle/by-plate/{immatriculation}`
**Format :** JSON
**Authentification :** clé API ou OAuth (à définir)

| Champ | Type | Exemple | Statut | Usage côté borne |
|---|---|---|---|---|
| `plate` | string | `AB-123-CD` | obligatoire | Affichage plaque française |
| `brand` | string | `PEUGEOT` | obligatoire | Filtrage compat + affichage |
| `model` | string | `208` | obligatoire | Filtrage compat + affichage |
| `version` | string | `1.2 PureTech 110` | obligatoire | Affichage fiche détaillée |
| `year` | int | `2019` | obligatoire | Filtrage par millésime |
| `fuel_type` | enum | `Essence` / `Diesel` / `Hybride` / `Électrique` | obligatoire | Filtrage compat (batteries diesel, FAP, etc.) |
| `power_hp` | int | `110` | obligatoire | Affichage technique |
| `power_kw` | int | `81` | optionnel | Affichage technique |
| `engine_cc` | int | `1199` | obligatoire | Affichage technique |
| `co2_g_km` | int | `120` | optionnel | Vignette Crit'Air |
| `gearbox` | enum | `M` / `A` / `BVM` / `BVA` | optionnel | Compatibilité kit embrayage |
| `body_type` | string | `Berline` / `SUV` / `Break` / `Compacte` | optionnel | Filtrage tapis, barres de toit |
| `mine_code` (TVV) | string | `MPE208FT0` | obligatoire | Recoupement pièces OEM |
| `vin` | string | `VF1DZ0N0641118804` | optionnel | Décodage avancé |
| `tecdoc_k_type` | string | `31164` | **CRITIQUE** | **Clé du matching pièces compatibles (Flux 2)** |
| `brand_logo_url` | string | URL HTTPS | optionnel | Affichage logo marque sur la fiche |
| `first_registration_date` | date ISO 8601 | `2019-04-15` | optionnel | Calcul de garantie |

> **Note critique :** `tecdoc_k_type` est l'identifiant TecDoc unique de la version véhicule. C'est lui qui permet d'interroger le catalogue pièces compatibles. Sans ce champ, la borne ne peut pas filtrer les pièces et perd 80 % de sa valeur.

---

## 2. Flux Catalogue pièces compatibles (K-Type → liste produits)

**Endpoint attendu :** `GET /catalog/by-ktype/{k_type}?category={cat}&subcategory={sub}`
**Format :** JSON, tableau d'objets (un par produit)
**Pagination :** souhaitée (max 50 produits par page)

| Champ | Type | Exemple | Statut | Usage côté borne |
|---|---|---|---|---|
| `sku` | string | `AB-H7VP90` | obligatoire | Identifiant unique référence Autobacs |
| `tecdoc_article_number` | string | `1987302801` | optionnel | Référence TecDoc internationale |
| `gtin` / `ean13` | string (13 chiffres) | `3760123456789` | obligatoire | **Code-barres scannable en caisse** |
| `brand` | string | `BOSCH` / `AUTOBACS` / `OSRAM` | obligatoire | Affichage carte produit |
| `name` | string | `Ampoule H7 Pure Light` | obligatoire | Titre fiche produit |
| `description_short` | string | `Halogène 55W standard` | obligatoire | Tagline sous le titre |
| `description_long` | string | `Ampoule halogène H7 55W, format standard...` | obligatoire | Bloc description complète |
| `expert_advice` | string | `Remplacez toujours par paire...` | optionnel | Bloc "Conseil expert" |
| `category_id` | string | `lighting` | obligatoire | Navigation par catégorie |
| `subcategory_id` | string | `lighting-low` | obligatoire | Navigation par sous-critère |
| `image_url` | string | URL HTTPS | obligatoire | Photo produit pleine taille |
| `image_thumbnail_url` | string | URL HTTPS | optionnel | Vignettes carousel et listes |
| `price_ttc` | decimal | `9.90` | obligatoire | Prix barré ou prix normal |
| `promo_price_ttc` | decimal ou `null` | `7.90` | optionnel | Prix promo si applicable |
| `promo_label` | string | `-20%` / `BEST` / `TOP` / `PROMO` | optionnel | Badge orange affiché |
| `loyalty_price_ttc` | decimal ou `null` | `9.40` | optionnel | Prix carte fidélité Autobacs Card |
| `loyalty_label` | string | `-5% Autobacs Card` | optionnel | Libellé du programme |
| `specs` | array d'objets | `[{label:"Voltage", value:"12V"}, ...]` | obligatoire | Tableau caractéristiques techniques |
| `compatible_k_types` | array string | `["31164", "65432", ...]` | optionnel | Vérification compatibilité fine côté borne |
| `equivalent_skus` | array string | `["BO-1987302801"]` | optionnel | Bouton "Voir équivalents" / cross-sell |

---

## 3. Flux Stock en temps réel par magasin

**Endpoint attendu :** `GET /stock/{sku}`
**Format :** JSON, tableau d'objets (un par magasin)
**Fraîcheur :** temps réel ou cache court (≤ 5 min)

| Champ | Type | Exemple | Statut | Usage côté borne |
|---|---|---|---|---|
| `store_id` | string | `pierrelaye` | obligatoire | Identification du centre |
| `store_name` | string | `Autobacs Pierrelaye` | obligatoire | Affichage texte |
| `store_short_name` | string | `Pierrelaye` | optionnel | Affichage compact |
| `store_address` | string | `254 Boulevard du Havre` | obligatoire | Affichage adresse |
| `store_postal_code` | string | `95480` | obligatoire | Géolocalisation |
| `store_city` | string | `Pierrelaye` | obligatoire | Affichage |
| `store_lat` | decimal | `49.0194` | obligatoire | Calcul distance pour tri "centres les plus proches" |
| `store_lng` | decimal | `2.1561` | obligatoire | Calcul distance |
| `quantity` | int | `5` | obligatoire | Affichage "EN STOCK · 5" |
| `aisle` | string | `A1` | optionnel | Indication rayon en magasin (signalétique) |
| `is_on_order` | bool | `false` | optionnel | "Sur commande" si rupture mais commandable |
| `restock_eta_days` | int | `2` | optionnel | Délai estimé si sur commande |

> **Cas d'usage** : quand le produit est indisponible dans le magasin courant, la borne affiche les **3 centres Autobacs les plus proches avec stock**, triés par distance kilométrique calculée via les coordonnées GPS.

---

## 4. Flux Métadonnées catalogue

**Endpoints attendus :**
- `GET /categories` → liste des 10 catégories principales
- `GET /subcategories?category={id}` → liste des sous-critères de la catégorie

### Catégories

| Champ | Type | Exemple | Statut |
|---|---|---|---|
| `id` | string | `lighting` | obligatoire |
| `name` | string | `Éclairage` | obligatoire |
| `icon_url` | string | URL HTTPS | obligatoire |
| `expert_tip` | string | `Vérifiez le type de culot avant d'acheter (H7, H4, W5W)` | optionnel |
| `display_order` | int | `1` | optionnel |

### Sous-critères

| Champ | Type | Exemple | Statut |
|---|---|---|---|
| `id` | string | `lighting-low` | obligatoire |
| `parent_category_id` | string | `lighting` | obligatoire |
| `name` | string | `Feux de croisement` | obligatoire |
| `description` | string | `H7, H11` | optionnel |
| `display_order` | int | `1` | optionnel |

---

## 5. Flux Promotions (contenu marketing accueil)

**Endpoint attendu :** `GET /promotions/active`
**Fraîcheur :** rafraîchissement journalier suffisant

| Champ | Type | Exemple |
|---|---|---|
| `promo_id` | string | `promo-batterie-agm-2026q2` |
| `linked_sku` | string | SKU mis en avant |
| `banner_image_url` | string | URL HTTPS bannière (idéal 2560×425 desktop, 768×589 mobile) |
| `title` | string | `Batterie AGM Start-Stop` |
| `badge` | string | `-15%` |
| `category_id` | string | `batteries` |
| `valid_from` | date ISO 8601 | `2026-04-01` |
| `valid_to` | date ISO 8601 | `2026-05-31` |
| `link_url` | string | URL fiche produit |

---

## 6. Carte fidélité (optionnel)

Si la borne doit valider une carte fidélité Autobacs Card en temps réel :

**Endpoint attendu :** `GET /loyalty/validate/{card_number}`

| Champ | Type | Exemple |
|---|---|---|
| `card_number` | string | `9876543210123` |
| `customer_first_name` | string | `Jean` |
| `customer_last_name_initial` | string | `D.` |
| `points_balance` | int | `1240` |
| `tier` | enum | `Bronze` / `Argent` / `Or` |
| `default_discount_rate` | decimal | `0.05` |

> **Note :** ce flux est probablement déjà géré par le SI Autobacs interne et n'est pas forcément du périmètre FLUXEA.

---

## Volumétrie estimée

| Métrique | Estimation par borne / jour |
|---|---|
| Identifications plaque (Flux 1) | 50 à 200 |
| Requêtes catalogue (Flux 2) | 100 à 400 |
| Vérifications stock (Flux 3) | 200 à 800 |
| Métadonnées (Flux 4) | 1 (cache long) |
| Promotions (Flux 5) | 1 par heure |

**Nombre de bornes envisagées :** à définir avec Autobacs (pilote 1 magasin → déploiement réseau).

---

## Contraintes techniques

- **Authentification** : clé API en header `Authorization: Bearer ...` ou OAuth 2.0 client credentials.
- **Format réponse** : JSON UTF-8.
- **Latence acceptable** : < 1 s pour Flux 1 (plaque) et Flux 3 (stock), < 2 s pour Flux 2 (catalogue).
- **HTTPS obligatoire**.
- **CORS** : autoriser le domaine de la borne ou utiliser un proxy serveur côté MAGAR.
- **Rate limiting** : à définir selon volumétrie réelle.
- **Disponibilité cible** : 99.5 % minimum (la borne fonctionne en magasin, ouverture en continu).

---

## Données déjà disponibles côté MAGAR

Pour information, la borne intègre déjà :

- 10 catégories produits (Éclairage, Essuie-glaces, Batteries, Huiles & Fluides, Pneus & Roues, Freinage, Filtration, Échappement, Distribution, Accessoires & Entretien)
- 60 sous-critères répartis dans ces catégories
- Mise en page tactile complète (saisie plaque, fiche véhicule, navigation catégories, fiche produit, comparateur, vus récemment)
- Affichage code-barres EAN-13 scannable en caisse
- Calcul distance entre magasins via coordonnées GPS

L'objectif est donc uniquement de **brancher les vraies données** sur les structures déjà existantes.

---

## Contact

**MAGAR Développement** — référent technique
Repo de référence : https://github.com/dryyss/Autobacs-research-tablette-app

---

*Document à compléter avec les éventuels champs FLUXEA propose en plus, ou à restreindre si certains ne sont pas dans son périmètre.*
