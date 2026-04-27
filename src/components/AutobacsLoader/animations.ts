// components/AutobacsLoader/animations.ts

export type AnimationId =
  // Basiques
  | 'pulse-wave'
  | 'fan-scan'
  | 'stagger'
  // Style Magar
  | 'sumi'
  | 'calligraphy'
  | 'fan'
  | 'spiral'
  | 'live'
  // Élégantes
  | 'aurora'
  // Poétiques
  | 'fireflies'
  | 'watercolor'
  | 'constellation'
  // Particules
  | 'ember'
  | 'rain'
  | 'lantern'
  | 'incense'
  | 'stardust';

export type AnimationCategory =
  | 'basic'
  | 'magar'
  | 'elegant'
  | 'poetic'
  | 'particles';

export interface AnimationConfig {
  id: AnimationId;
  label: string;
  /** Durée d'un cycle en ms */
  duration: number;
  /** Catégorie pour usage avancé */
  category: AnimationCategory;
  /** Overlays HTML supplémentaires nécessaires */
  overlays?: Array<
    | 'sumi-drop'
    | 'spiral'
    | 'aurora-glow'
    | 'fireflies'
    | 'watercolor'
    | 'constellation-stars'
    | 'embers'
    | 'rain'
    | 'lanterns'
    | 'incense'
    | 'stardust'
  >;
  /** Animation en loop infinie (déconseillée pour les vrais loaders) */
  isInfiniteLoop?: boolean;
}

export const ANIMATIONS: AnimationConfig[] = [
  // === Basiques ===
  { id: 'pulse-wave', label: 'Pulse Wave', duration: 2000, category: 'basic' },
  { id: 'fan-scan', label: 'Fan Scan', duration: 1500, category: 'basic' },
  { id: 'stagger', label: 'Stagger Fade', duration: 1600, category: 'basic' },
  // === Style Magar ===
  { id: 'sumi', label: 'Sumi-e', duration: 4000, category: 'magar', overlays: ['sumi-drop'] },
  { id: 'calligraphy', label: 'Calligraphy', duration: 4500, category: 'magar' },
  { id: 'fan', label: 'Fan Fold', duration: 4000, category: 'magar' },
  { id: 'spiral', label: 'Spiral Cut', duration: 3500, category: 'magar', overlays: ['spiral'] },
  { id: 'live', label: 'Live Pulse', duration: 4000, category: 'magar', isInfiniteLoop: true },
  // === Élégantes ===
  { id: 'aurora', label: 'Aurora Wave', duration: 6000, category: 'elegant', overlays: ['aurora-glow'] },
  // === Poétiques ===
  { id: 'fireflies', label: 'Fireflies', duration: 7000, category: 'poetic', overlays: ['fireflies'] },
  { id: 'watercolor', label: 'Watercolor Wash', duration: 8000, category: 'poetic', overlays: ['watercolor'] },
  { id: 'constellation', label: 'Constellation', duration: 5000, category: 'poetic', overlays: ['constellation-stars'] },
  // === Particules ===
  { id: 'ember', label: 'Ember Glow', duration: 5000, category: 'particles', overlays: ['embers'] },
  { id: 'rain', label: 'Rain on Pond', duration: 3000, category: 'particles', overlays: ['rain'] },
  { id: 'lantern', label: 'Paper Lanterns', duration: 12000, category: 'particles', overlays: ['lanterns'] },
  { id: 'incense', label: 'Incense Spiral', duration: 6000, category: 'particles', overlays: ['incense'] },
  { id: 'stardust', label: 'Stardust Trail', duration: 5000, category: 'particles', overlays: ['stardust'] },
];

/**
 * Récupérer toutes les animations d'une catégorie
 */
export function getAnimationsByCategory(category: AnimationCategory): AnimationConfig[] {
  return ANIMATIONS.filter(a => a.category === category);
}

/**
 * Récupérer une animation par son ID
 */
export function getAnimation(id: AnimationId): AnimationConfig | undefined {
  return ANIMATIONS.find(a => a.id === id);
}

/**
 * Pool par défaut : toutes sauf les loops infinies (inadapté aux loaders qui doivent se terminer)
 */
export const DEFAULT_POOL: AnimationId[] = ANIMATIONS
  .filter(a => !a.isInfiniteLoop)
  .map(a => a.id);
