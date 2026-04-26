# Parcours utilisateur — Borne Autobacs

4 parcours principaux couvrent les usages en magasin.

## 1. Parcours avec plaque (nominal)

```
Accueil
  └─ Tape la plaque (AB-123-CD)
     └─ Clic "Rechercher"
        └─ Modal SIV (1-2 s)
           └─ Véhicule identifié (marque, modèle, carburant…)
              └─ Fiche véhicule (/vehicle)
                 ├─ Specs détaillées
                 └─ 10 catégories avec compteur de pièces compatibles
                    └─ Clic catégorie → Sous-critères (/subcriteria)
                       └─ Clic sous-critère → Résultats filtrés compatibilité (/results)
                          ├─ Filtres : Tous / En stock / Équivalents / Autres centres
                          └─ Clic produit
                             ├─ Disponible → Fiche produit (/product/[id])
                             │  ├─ Trouver en rayon
                             │  └─ Réserver en caisse
                             └─ Indisponible → /unavailable
                                ├─ Équivalents disponibles ici
                                ├─ Autres centres avec stock
                                └─ Commander (livraison 24-48 h / Click & Collect 2 h)
```

## 2. Parcours sans plaque — raccourci catégorie

```
Accueil
  └─ Clic sur raccourci catégorie ("Éclairage", "Batteries"…)
     └─ Catégories
        └─ Sous-critères → Résultats → Fiche produit
```

## 3. Parcours sans plaque — promo

```
Accueil
  └─ Clic sur carte promo (Batterie AGM -15 %, Kit filtres…)
     └─ Sous-critères de la catégorie
        └─ Résultats → Fiche produit
```

## 4. Parcours recherche directe

```
N'importe quel écran (bouton loupe en header)
  └─ Modal de recherche (nom, référence, marque…)
     └─ Clic résultat → Fiche produit
```

## Comportements transverses

| Déclencheur | Action |
|---|---|
| 90 s d'inactivité | Reset complet + retour accueil |
| Clic "TERMINÉ" (header) | Reset + retour accueil |
| Timeout SIV 5 s | Écran d'erreur + bouton "Continuer sans plaque" |
| SIV réponse > 3 s | Bouton "Continuer sans attendre" apparaît |
| Produit indisponible + onOrder | Badge bleu "Sur commande" |
| Changement magasin (header) | Stock s'adapte immédiatement partout |
| Véhicule identifié | Pages résultats ne montrent que les pièces compatibles |
| Sans véhicule | Toutes les pièces sont affichées |

## Écrans (routes Next.js)

| Route | Fonction | Étape |
|---|---|---|
| `/` | Accueil (clavier plaque + promos + raccourcis) | 1 |
| `/vehicle` | Fiche véhicule après SIV (NEW) | 2 |
| `/categories` | 10 catégories avec conseils experts | 3 |
| `/subcriteria` | 6 sous-critères par catégorie | 4 |
| `/results` | 4 produits par page + filtres + tri + pagination | 5 |
| `/product/[productId]` | Fiche produit complète + conseil expert | 6 |
| `/unavailable?productId=…` | Équivalents + autres centres + commande | 6 bis |

## État global (React Context)

- `storeId` — magasin courant (persistant entre reset)
- `plate` — plaque saisie
- `vehicle` — véhicule identifié (marque, modèle, carburant…)
- `selectedCategory` — catégorie choisie
- `selectedSubcriteria` — sous-critère choisi

## Règles de compatibilité produits

Un produit est compatible avec un véhicule si son `compatibilityMap` contient :

- `ALL` → universel
- `BRAND` (ex: `PEUGEOT`) → tous modèles de la marque
- `BRAND:MODEL` (ex: `PEUGEOT:208`) → modèle précis
- `BRAND:MODEL:FUEL` (ex: `PEUGEOT:208:DIESEL`) → modèle + motorisation
- `FUEL` (ex: `DIESEL`) → tous véhicules de cette motorisation

Les produits sans règle sont considérés comme universels.
