# Intégration du composant AutobacsLoader

## Contexte

Cette tâche consiste à intégrer un composant React de loader animé dans le projet **Autobacs** (app tablette de recherche véhicule par plaque, Next.js 15 / React 19 / TypeScript).

Le composant `<AutobacsLoader />` affiche un état de chargement avec **17 animations CSS différentes**, choisies aléatoirement à chaque montage (sans répétition immédiate). Il remplace les loaders génériques actuels par une expérience de marque cohérente et variée.

## Fichiers à intégrer

Quatre fichiers sont fournis et doivent être copiés tels quels dans le projet :

- `AutobacsLoader.tsx` (9.6 KB, 220 lignes) — composant React principal
- `AutobacsLoader.module.css` (50 KB, 1288 lignes) — toutes les animations CSS scopées
- `animations.ts` (3.5 KB, 103 lignes) — configuration typée des 17 animations
- `index.ts` (0.3 KB) — exports publics propres

## Arborescence cible

À placer dans `src/components/AutobacsLoader/` (ou équivalent selon la convention du projet, par exemple `app/components/` si l'App Router est utilisé sans dossier `src`) :

```
src/components/AutobacsLoader/
├── AutobacsLoader.tsx
├── AutobacsLoader.module.css
├── animations.ts
└── index.ts
```

## Tâches à exécuter

### 1. Vérifier la structure du projet

Avant toute chose, inspecter :
- L'organisation des dossiers (`src/components/`, `app/components/`, ou autre)
- La convention d'imports (`@/components/...` via tsconfig paths, ou imports relatifs)
- La présence éventuelle d'un système de design tokens existant
- Si le projet utilise Tailwind, ou CSS Modules, ou autre

### 2. Copier les fichiers

Placer les 4 fichiers dans le bon dossier en respectant la convention du projet. Ne pas modifier leur contenu à ce stade — ils sont fonctionnels tels quels.

### 3. Vérifier la compatibilité TypeScript

Le composant utilise TypeScript strict. Vérifier que :
- Le `tsconfig.json` du projet est compatible (cible ES2020+, JSX `react-jsx` ou `preserve`)
- Les types `AnimationId`, `AnimationCategory`, `AnimationConfig` exportés dans `animations.ts` ne rentrent pas en conflit avec d'autres types existants

### 4. Repérer les usages actuels de loaders

Faire un grep dans le projet pour trouver les emplacements où des loaders sont actuellement utilisés. Patterns probables :
- `<Spinner />`, `<Loader />`, `<Loading />`
- `<CircularProgress />`, `<LinearProgress />` (si MUI)
- `Suspense fallback={...}` avec un fallback générique
- États conditionnels `if (isLoading) return ...`
- Classes Tailwind `animate-spin` sur des éléments

### 5. Proposer un plan de remplacement

**Ne pas remplacer automatiquement** tous les loaders existants. À la place, faire un rapport listant :
- Tous les emplacements où un loader est utilisé
- Pour chacun, suggérer si `<AutobacsLoader />` est pertinent (oui pour les états de chargement de données, non pour des micro-loaders inline dans des boutons)
- Si oui, proposer la prop appropriée (`title`, `subtitle`, `size`, `force` éventuellement)

### 6. Tests d'intégration

Vérifier que :
- L'import `import { AutobacsLoader } from '@/components/AutobacsLoader'` fonctionne
- Le composant se rend sans erreur TypeScript
- Le CSS Module est bien chargé (pas de FOUC, pas de classe non résolue)
- Les 17 animations tournent correctement (la random pioche au montage, donc rafraîchir la page plusieurs fois pour vérifier)
- Le mode dark fonctionne si l'app a un toggle de thème

## API du composant — référence rapide

### Props

```typescript
interface AutobacsLoaderProps {
  force?: AnimationId;          // Forcer une animation spécifique
  exclude?: AnimationId[];       // Exclure des anims du pool
  pool?: AnimationId[];          // Pool custom (défaut : DEFAULT_POOL)
  size?: 'sm' | 'md' | 'lg' | 'xl';  // 80 / 160 / 240 / 320 px
  title?: string;                // Titre sous le logo
  subtitle?: string;             // Sous-titre
  fullHeight?: boolean;          // min-height: 240px (défaut: true)
  className?: string;            // Classe CSS supplémentaire
}
```

### IDs des 17 animations disponibles

- **Basiques** : `pulse-wave`, `fan-scan`, `stagger`
- **Style Magar** : `sumi`, `calligraphy`, `fan`, `spiral`, `live`
- **Élégantes** : `aurora`
- **Poétiques** : `fireflies`, `watercolor`, `constellation`
- **Particules** : `ember`, `rain`, `lantern`, `incense`, `stardust`

Note : `live` est exclu du pool par défaut (boucle infinie inadaptée à un état "loading qui se termine").

### Exemples d'usage

**Random simple** (cas le plus fréquent) :
```tsx
<AutobacsLoader 
  title="Recherche en cours"
  subtitle="Identification de votre véhicule…"
/>
```

**Avec Suspense** :
```tsx
<Suspense fallback={<AutobacsLoader />}>
  <VehicleDetails />
</Suspense>
```

**Forcer une animation spécifique** (splash de démarrage par exemple) :
```tsx
<AutobacsLoader 
  force="aurora" 
  size="lg"
  title="Chargement de l'application"
/>
```

**Pool restreint à une catégorie** :
```tsx
import { getAnimationsByCategory } from '@/components/AutobacsLoader';

const poetics = getAnimationsByCategory('poetic').map(a => a.id);

<AutobacsLoader 
  pool={poetics} 
  title="Synchronisation longue"
/>
```

## Points d'attention

### Random sans répétition

Le composant garde une variable globale `lastAnimId` (au niveau du module, en dehors du composant) qui mémorise la dernière animation affichée. Au prochain montage du composant — peu importe où dans l'app — cette animation sera évitée. C'est volontaire et garantit que l'utilisateur ne voit jamais 2 fois la même animation de suite.

Cette variable se réinitialise au reload de la page. Pas besoin de la persister.

### Performance

- Le module CSS pèse 50 KB en non-compressé (≈ 12 KB gzip)
- Toutes les animations sont CSS pur, aucune dépendance JS ajoutée
- Le composant est `'use client'` (utilise `useState`)
- 69 keyframes scopées avec préfixe `ab-{anim}-` pour éviter les conflits avec d'autres CSS du projet

### Accessibilité

Le composant inclut déjà :
- `role="status"` 
- `aria-live="polite"`
- `aria-label` (basé sur `title` ou défaut "Chargement en cours")
- Respect de `prefers-reduced-motion` (animations désactivées si l'utilisateur préfère moins de mouvement)

Ne pas retirer ces attributs lors de l'intégration.

### Mode dark

Le composant détecte automatiquement `prefers-color-scheme: dark`. Si le projet a son propre système de thème (ex: classe `.dark` sur `<html>` via next-themes), il faudra peut-être adapter le CSS module pour qu'il réagisse à cette classe au lieu (ou en plus) de la media query.

Si nécessaire, ajouter dans `AutobacsLoader.module.css` :

```css
:global(.dark) .loader { background: #0a0a0e; }
:global(.dark) .title { color: #f0f0f3; }
:global(.dark) .subtitle { color: #8086a8; }
```

### SVG du logo

Le SVG du logo Autobacs est embarqué directement dans `AutobacsLoader.tsx` pour éviter un fetch HTTP supplémentaire. Si une externalisation est souhaitée (par exemple parce qu'un fichier `/public/logo-autobacs.svg` existe déjà), remplacer le composant `AutobacsLogo` par :

```tsx
import Image from 'next/image';

function AutobacsLogo() {
  return (
    <Image 
      src="/logo-autobacs.svg" 
      alt="" 
      width={88} 
      height={64}
      priority
    />
  );
}
```

**Attention** : si on externalise, on perd les attributs `data-element` et `data-wave` sur les paths du SVG. Or ces attributs sont **essentiels** au fonctionnement des animations (les sélecteurs CSS s'en servent pour cibler chaque vague individuellement). Donc soit on garde le SVG inline, soit on copie le SVG modifié dans `/public/` avec ses attributs `data-*`.

## Livrables attendus

À la fin de l'intégration, fournir :

1. Confirmation que les 4 fichiers sont en place
2. Capture (ou simple mention) qu'au moins 3-4 animations différentes ont été observées en rafraîchissant la page
3. Liste des emplacements de loaders existants identifiés (rapport)
4. Pour chaque emplacement, recommandation : remplacer ou pas
5. Diff des changements appliqués (si remplacement effectué)

## Questions à poser si quelque chose n'est pas clair

- Le projet utilise-t-il déjà CSS Modules ? Si non, vérifier que Next.js les supporte (par défaut oui)
- Y a-t-il un système de design tokens à respecter pour les couleurs ? Le composant utilise `#d9782d` (orange Autobacs) en dur dans les variables CSS internes
- Y a-t-il un Storybook dans le projet ? Si oui, créer aussi une story `AutobacsLoader.stories.tsx` qui montre toutes les variantes via la prop `force`
- Le projet a-t-il un loader actuel qui doit être totalement remplacé, ou qui doit cohabiter ?

## En cas d'erreur

Si l'intégration pose problème :
- **Erreur TypeScript sur les types `AnimationId`** : vérifier que `tsconfig.json` a `"strict": true` et `"moduleResolution": "bundler"` ou `"node16"`
- **CSS module non résolu** : vérifier `next.config.js` ne désactive pas les CSS Modules
- **Animations qui ne tournent pas** : ouvrir DevTools → Inspector, vérifier que les classes CSS sont bien appliquées sur l'élément et que `data-variant="..."` est présent
- **Conflits de keyframes avec d'autres CSS** : ne devrait pas arriver car toutes les keyframes sont préfixées `ab-`, mais si oui, renommer encore plus aggressivement

## Récapitulatif

Le composant `<AutobacsLoader />` est **autonome** : pas de dépendance npm à installer, pas de configuration Next.js à modifier, pas de provider à ajouter au layout. C'est un drop-in replacement pour n'importe quel loader existant.

Une fois en place, l'app gagne en :
- **Identité de marque** : chaque attente devient un mini-moment Autobacs
- **Variété** : 17 animations évitent l'effet "j'ai déjà vu ça"
- **Cohérence** : toutes les anims utilisent le logo officiel Autobacs

Bon courage pour l'intégration.
