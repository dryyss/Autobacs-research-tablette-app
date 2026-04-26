/**
 * Route serveur : GET /api/siv/:plate
 *
 * Rôle : isoler la clé API du fournisseur SIV commercial (ou de l'endpoint interne
 * Autobacs) côté serveur. Le front appelle toujours cette route — c'est elle qui
 * choisit le driver selon l'env.
 *
 * Drivers supportés (via SIV_PROVIDER) :
 *   - "mock"                 → base mock locale + pool hashé (dev & démos)
 *   - "autobacs-internal"    → endpoint interne Autobacs (prod cible)
 *   - "aaadata"              → AAA DATA SIvin (fallback commercial)
 *   - "apiplaqueimmat"       → apiplaqueimmatriculation.com (starter €59, renvoie k_type)
 *
 * Variables d'environnement attendues (selon driver) :
 *   SIV_PROVIDER           = mock | autobacs-internal | aaadata | immatriculationapi
 *   SIV_API_URL            = endpoint du fournisseur (si externe)
 *   SIV_API_KEY            = clé/token d'auth
 *   SIV_CLIENT_ID          = identifiant client (AAA DATA)
 *
 * Réponse normalisée (quel que soit le driver) — même forme que SivResult :
 *   { success: true,  vehicle: {...} }
 *   { success: false, error: "NOT_FOUND" | "TIMEOUT" | "INVALID_FORMAT" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { identifyMock, type SivResult, type SivVehicle } from '@/lib/siv';

type Provider = 'mock' | 'autobacs-internal' | 'aaadata' | 'apiplaqueimmat';

/** Normalise une chaîne énergie vers notre type fuelType. */
function normalizeFuel(raw: string): SivVehicle['fuelType'] {
  const up = (raw || '').toUpperCase();
  if (up.includes('DIESEL') || up.includes('GAZOLE')) return 'Diesel';
  if (up.includes('HYBRID')) return 'Hybride';
  if (up.includes('ELEC')) return 'Électrique';
  return 'Essence';
}

/** Convertit "RENAULT" → "Renault" pour l'UI. */
function titleCase(s: string): string {
  return (s || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

async function callAutobacsInternal(plate: string): Promise<SivResult> {
  const url = process.env.SIV_API_URL;
  const key = process.env.SIV_API_KEY;
  if (!url || !key) {
    return { success: false, error: 'TIMEOUT' };
  }
  try {
    const res = await fetch(`${url}/vehicle/${encodeURIComponent(plate)}`, {
      headers: { Authorization: `Bearer ${key}` },
      // Timeout côté Next : AbortSignal.timeout(5000) si runtime récent
      cache: 'no-store',
    });
    if (!res.ok) return { success: false, error: res.status === 404 ? 'NOT_FOUND' : 'TIMEOUT' };
    const data = await res.json();
    // À adapter au schéma réel renvoyé par Autobacs
    const vehicle: SivVehicle = {
      plate,
      brand: data.brand,
      model: data.model,
      version: data.version,
      year: data.year,
      fuelType: data.fuelType,
      power: data.power,
      engine: data.engine,
      mine: data.mine,
    };
    return { success: true, vehicle };
  } catch {
    return { success: false, error: 'TIMEOUT' };
  }
}

async function callAaaData(plate: string): Promise<SivResult> {
  const url = process.env.SIV_API_URL; // ex: https://api.aaa-data.fr/sivin/v1
  const key = process.env.SIV_API_KEY;
  const clientId = process.env.SIV_CLIENT_ID;
  if (!url || !key || !clientId) return { success: false, error: 'TIMEOUT' };
  // TODO: mapper la réponse AAA DATA vers SivVehicle quand on aura le contrat
  return { success: false, error: 'TIMEOUT' };
}

/**
 * Driver apiplaqueimmatriculation.com
 *
 * Endpoint : POST https://api.apiplaqueimmatriculation.com/plaque
 * Auth     : query param `token`
 * Params   : immatriculation, token, pays=FR
 *
 * Réponse (extrait des champs utiles) :
 *   marque, modele, date1erCir_us ("2009-04-18"), energieNGC, puisFiscReelCH,
 *   ccm, k_type, vin, variante, code_moteur
 */
async function callApiPlaqueImmat(plate: string): Promise<SivResult> {
  const token = process.env.SIV_API_KEY;
  if (!token) return { success: false, error: 'TIMEOUT' };

  const url = `https://api.apiplaqueimmatriculation.com/plaque?immatriculation=${encodeURIComponent(
    plate
  )}&token=${encodeURIComponent(token)}&pays=FR`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { success: false, error: res.status === 404 ? 'NOT_FOUND' : 'TIMEOUT' };

    const body = await res.json();
    // Réponse d'erreur : data=[] + code_erreur
    if (!body.data || Array.isArray(body.data)) {
      return { success: false, error: body.code_erreur === 401 ? 'TIMEOUT' : 'NOT_FOUND' };
    }
    const d = body.data;
    const year = d.date1erCir_us ? parseInt(String(d.date1erCir_us).slice(0, 4), 10) : 0;
    const vehicle: SivVehicle = {
      plate,
      brand: titleCase(d.marque ?? ''),
      model: titleCase(d.modele ?? ''),
      // sra_commercial = libellé marketing ("1.9 DCI 130 XV DE FRANCE"), plus propre à l'affichage
      version: d.sra_commercial || d.code_moteur || d.variante,
      year,
      fuelType: normalizeFuel(d.energieNGC ?? d.energie ?? ''),
      power: d.puisFiscReelCH || `${d.puisFisc ?? ''} CV`,
      engine: d.ccm || '',
      mine: d.variante,
      kType: d.k_type ? String(d.k_type) : undefined,
      vin: d.vin,
      logoUrl: d.logo_marque,
      co2: d.co2,
      doors: d.nb_portes,
      weight: d.poids,
      gearbox: d.boite_vitesse,
    };

    // Monitoring quota : log le nombre de requêtes restantes sur le token.
    if (typeof d.nbr_req_restants === 'number') {
      console.log(`[SIV apiplaqueimmat] ${d.nbr_req_restants} requêtes restantes sur le token`);
      if (d.nbr_req_restants < 50) {
        console.warn(`[SIV apiplaqueimmat] ⚠ Quota bas : ${d.nbr_req_restants} requêtes`);
      }
    }

    return { success: true, vehicle };
  } catch {
    return { success: false, error: 'TIMEOUT' };
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { plate: string } }
) {
  const plate = decodeURIComponent(params.plate);
  const provider = (process.env.SIV_PROVIDER ?? 'mock') as Provider;

  let result: SivResult;
  switch (provider) {
    case 'autobacs-internal':
      result = await callAutobacsInternal(plate);
      break;
    case 'aaadata':
      result = await callAaaData(plate);
      break;
    case 'apiplaqueimmat':
      result = await callApiPlaqueImmat(plate);
      break;
    case 'mock':
    default:
      result = await identifyMock(plate);
  }

  // Fallback : si le fournisseur externe est KO, on bascule sur le mock pour
  // que la borne reste utilisable (dégradé propre plutôt qu'écran d'erreur).
  if (!result.success && provider !== 'mock' && process.env.SIV_FALLBACK_MOCK === 'true') {
    result = await identifyMock(plate);
  }

  return NextResponse.json(result);
}
