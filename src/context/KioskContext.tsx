'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Vehicle {
  plate: string;
  model: string;
  brand?: string;
  fuelType?: string;
  year?: number;
  version?: string;
  power?: string;
  engine?: string;
  logoUrl?: string;
  kType?: string;
  vin?: string;
}

interface KioskState {
  storeId: string;
  plate: string;
  vehicle: Vehicle | null;
  selectedCategory: string | null;
  selectedSubcriteria: string | null;
  selectedProductId: string | null;
  /** IDs des produits sélectionnés pour comparaison (max 4). */
  compareIds: string[];
  /** Historique des produits consultés, plus récent en tête (max 8). */
  recentlyViewed: string[];
}

interface KioskContextType extends KioskState {
  setStoreId: (storeId: string) => void;
  setPlate: (plate: string) => void;
  setVehicle: (vehicle: Vehicle | null) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedSubcriteria: (subcriteriaId: string | null) => void;
  setSelectedProductId: (productId: string | null) => void;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  trackViewed: (productId: string) => void;
  resetAll: () => void;
}

const MAX_COMPARE = 4;
const MAX_RECENT = 8;

const initialState: KioskState = {
  storeId: 'pierrelaye',
  plate: '',
  vehicle: null,
  selectedCategory: null,
  selectedSubcriteria: null,
  selectedProductId: null,
  compareIds: [],
  recentlyViewed: [],
};

const KioskContext = createContext<KioskContextType | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<KioskState>(initialState);

  const setStoreId = (storeId: string) => setState((s) => ({ ...s, storeId }));
  const setPlate = (plate: string) => setState((s) => ({ ...s, plate }));
  const setVehicle = (vehicle: Vehicle | null) => setState((s) => ({ ...s, vehicle }));
  const setSelectedCategory = (selectedCategory: string | null) => setState((s) => ({ ...s, selectedCategory }));
  const setSelectedSubcriteria = (selectedSubcriteria: string | null) => setState((s) => ({ ...s, selectedSubcriteria }));
  const setSelectedProductId = (selectedProductId: string | null) => setState((s) => ({ ...s, selectedProductId }));
  const toggleCompare = (productId: string) =>
    setState((s) => {
      if (s.compareIds.includes(productId)) {
        return { ...s, compareIds: s.compareIds.filter((id) => id !== productId) };
      }
      // Anti-débordement : au-delà de MAX_COMPARE on remplace le plus ancien.
      const next = s.compareIds.length >= MAX_COMPARE ? s.compareIds.slice(1) : s.compareIds;
      return { ...s, compareIds: [...next, productId] };
    });
  const clearCompare = () => setState((s) => ({ ...s, compareIds: [] }));
  const trackViewed = (productId: string) =>
    setState((s) => {
      const next = [productId, ...s.recentlyViewed.filter((id) => id !== productId)].slice(0, MAX_RECENT);
      return { ...s, recentlyViewed: next };
    });
  const resetAll = () => setState((s) => ({ ...initialState, storeId: s.storeId }));

  return (
    <KioskContext.Provider
      value={{
        ...state,
        setStoreId, setPlate, setVehicle,
        setSelectedCategory, setSelectedSubcriteria, setSelectedProductId,
        toggleCompare, clearCompare,
        trackViewed,
        resetAll,
      }}
    >
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = useContext(KioskContext);
  if (!context) throw new Error('useKiosk must be used within KioskProvider');
  return context;
}
