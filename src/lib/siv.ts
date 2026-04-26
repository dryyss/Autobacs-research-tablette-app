/**
 * Mock API SIV — Identification d'un véhicule par plaque.
 * En production : remplacer le corps de identifyVehicle() par un appel
 * vers /api/siv/[plate] qui proxy le fournisseur (ImmatriculationAPI, SIVincar, AAA DATA).
 */

export interface SivVehicle {
  plate: string;
  brand: string;
  model: string;
  version?: string;
  year: number;
  fuelType: 'Essence' | 'Diesel' | 'Hybride' | 'Électrique';
  power: string;
  engine: string;
  mine?: string;
  /** Code TecDoc K-Type — renseigné par les vrais fournisseurs, utilisé pour
   *  l'étape suivante (plate → K-type → SKU compatibles). */
  kType?: string;
  /** Numéro VIN (chassis) — renseigné si dispo. */
  vin?: string;
  /** URL du logo officiel de la marque (apiplaqueimmat renvoie cette URL). */
  logoUrl?: string;
  /** CO₂ en g/km, poids, nombre de portes… (métadonnées brutes transmises si dispo). */
  co2?: string;
  doors?: string;
  weight?: string;
  gearbox?: string;
}

export interface SivResult {
  success: boolean;
  vehicle?: SivVehicle;
  error?: 'NOT_FOUND' | 'TIMEOUT' | 'INVALID_FORMAT';
}

// Base de véhicules mock explicitement mappés (facilite les démos live)
const MOCK_VEHICLES: Record<string, SivVehicle> = {
  'AB-123-CD': { plate: 'AB-123-CD', brand: 'Peugeot',    model: '208',         version: '1.2 PureTech 110',  year: 2019, fuelType: 'Essence',    power: '110 ch', engine: '1199 cm³', mine: 'MPE208FT0' },
  'EF-456-GH': { plate: 'EF-456-GH', brand: 'Renault',    model: 'Clio V',      version: '1.5 dCi 85',        year: 2021, fuelType: 'Diesel',     power: '85 ch',  engine: '1461 cm³', mine: 'MRE5DCI85' },
  'IJ-789-KL': { plate: 'IJ-789-KL', brand: 'Volkswagen', model: 'Golf VIII',   version: '1.5 TSI 130',       year: 2022, fuelType: 'Essence',    power: '130 ch', engine: '1498 cm³', mine: 'MVWG8TSI1' },
  'MN-012-OP': { plate: 'MN-012-OP', brand: 'Citroën',    model: 'C3',          version: '1.2 PureTech 82',   year: 2020, fuelType: 'Essence',    power: '82 ch',  engine: '1199 cm³', mine: 'MCIC3PT82' },
  'QR-345-ST': { plate: 'QR-345-ST', brand: 'Dacia',      model: 'Sandero',     version: '1.0 TCe 90',        year: 2023, fuelType: 'Essence',    power: '90 ch',  engine: '999 cm³',  mine: 'MDAS090TC' },
  'UV-678-WX': { plate: 'UV-678-WX', brand: 'Tesla',      model: 'Model 3',     version: 'Long Range',        year: 2022, fuelType: 'Électrique', power: '450 ch', engine: 'Électrique', mine: 'MTSM3LRAW' },
  'YZ-901-AB': { plate: 'YZ-901-AB', brand: 'Toyota',     model: 'Yaris Hybrid',version: '1.5 Hybrid 116',    year: 2021, fuelType: 'Hybride',    power: '116 ch', engine: '1490 cm³', mine: 'MTYH116YR' },
};

// Pool de véhicules pour les plaques inconnues — sélection stable par hash de la plaque
const FALLBACK_POOL: Omit<SivVehicle, 'plate'>[] = [
  { brand: 'Peugeot',    model: '208',          version: '1.2 PureTech 110', year: 2019, fuelType: 'Essence', power: '110 ch', engine: '1199 cm³' },
  { brand: 'Peugeot',    model: '308',          version: '1.5 BlueHDi 130',  year: 2020, fuelType: 'Diesel',  power: '130 ch', engine: '1499 cm³' },
  { brand: 'Renault',    model: 'Clio',         version: '1.0 TCe 100',      year: 2021, fuelType: 'Essence', power: '100 ch', engine: '999 cm³'  },
  { brand: 'Renault',    model: 'Megane',       version: '1.3 TCe 140',      year: 2019, fuelType: 'Essence', power: '140 ch', engine: '1332 cm³' },
  { brand: 'Citroën',    model: 'C3',           version: '1.2 PureTech 83',  year: 2020, fuelType: 'Essence', power: '83 ch',  engine: '1199 cm³' },
  { brand: 'Citroën',    model: 'C4',           version: '1.5 BlueHDi 100',  year: 2018, fuelType: 'Diesel',  power: '100 ch', engine: '1499 cm³' },
  { brand: 'Volkswagen', model: 'Golf',         version: '2.0 TDI 150',      year: 2018, fuelType: 'Diesel',  power: '150 ch', engine: '1968 cm³' },
  { brand: 'Volkswagen', model: 'Polo',         version: '1.0 TSI 95',       year: 2020, fuelType: 'Essence', power: '95 ch',  engine: '999 cm³'  },
  { brand: 'Dacia',      model: 'Sandero',      version: '1.0 TCe 90',       year: 2021, fuelType: 'Essence', power: '90 ch',  engine: '999 cm³'  },
  { brand: 'Toyota',     model: 'Yaris Hybrid', version: '1.5 Hybrid 116',   year: 2022, fuelType: 'Hybride', power: '116 ch', engine: '1490 cm³' },
];

/** Hash déterministe sur la plaque : même plaque = même véhicule. */
function pickFromPlate(plate: string): Omit<SivVehicle, 'plate'> {
  let h = 2166136261;
  for (let i = 0; i < plate.length; i++) {
    h ^= plate.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return FALLBACK_POOL[h % FALLBACK_POOL.length];
}

/** Implémentation mock — utilisée en dev et côté serveur par /api/siv/[plate] */
async function identifyMock(plate: string): Promise<SivResult> {
  const normalized = plate.trim().toUpperCase();

  // Validation format SIV (AB-123-CD) ou FNI (123 ABC 75)
  const sivRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
  const fniRegex = /^\d{1,4}\s?[A-Z]{1,3}\s?\d{2,3}$/;

  if (!sivRegex.test(normalized) && !fniRegex.test(normalized)) {
    return { success: false, error: 'INVALID_FORMAT' };
  }

  const delay = 400 + Math.random() * 500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Timeout aléatoire désactivé par défaut en démo. Activable via env pour QA :
  //   NEXT_PUBLIC_SIV_MOCK_TIMEOUT_RATE=0.03
  const timeoutRate = Number(process.env.NEXT_PUBLIC_SIV_MOCK_TIMEOUT_RATE ?? '0');
  if (timeoutRate > 0 && Math.random() < timeoutRate) {
    return { success: false, error: 'TIMEOUT' };
  }

  const known = MOCK_VEHICLES[normalized];
  const vehicle: SivVehicle = known ?? { plate: normalized, ...pickFromPlate(normalized) };
  return { success: true, vehicle };
}

/**
 * Point d'entrée côté client.
 * En prod (NEXT_PUBLIC_USE_REAL_SIV=true), appelle la route serveur qui masque
 * la clé API et délègue au bon fournisseur (autobacs-internal / aaadata / …).
 * En dev, exécute le mock directement (zéro latence réseau en plus).
 */
export async function identifyVehicle(plate: string): Promise<SivResult> {
  if (process.env.NEXT_PUBLIC_USE_REAL_SIV === 'true') {
    try {
      const res = await fetch(`/api/siv/${encodeURIComponent(plate)}`);
      return (await res.json()) as SivResult;
    } catch {
      return { success: false, error: 'TIMEOUT' };
    }
  }
  return identifyMock(plate);
}

/** Export du mock pour usage serveur (route API) sans passer par fetch récursif. */
export { identifyMock };

export function getVehicleDisplay(vehicle: SivVehicle): string {
  return `${vehicle.brand} ${vehicle.model} (${vehicle.year})`;
}
