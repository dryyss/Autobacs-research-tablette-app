'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import {
  products,
  subcriteria,
  categories,
  getProductStock,
  getProductsForSubcriteria,
  isProductCompatibleWithVehicle,
  getProductImage,
  type VehicleInfo,
} from '@/data/mockData';
import { useKiosk } from '@/context/KioskContext';
import { Car, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Scale } from 'lucide-react';

type FilterTab = 'all' | 'in-stock' | 'equivalents' | 'other-stores';
type SortBy = 'default' | 'brand' | 'price-asc' | 'price-desc';

const PRODUCTS_PER_PAGE = 4;

export default function ResultsPage() {
  const router = useRouter();
  const { plate, vehicle, selectedCategory, selectedSubcriteria, storeId, compareIds, toggleCompare } = useKiosk();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [page, setPage] = useState(0);

  const category = categories.find((c) => c.id === selectedCategory);
  const subcriterion = subcriteria.find((sc) => sc.id === selectedSubcriteria);

  // Véhicule info pour compatibilité
  const vehicleInfo: VehicleInfo | null = vehicle?.brand
    ? {
        brand: vehicle.brand,
        model: vehicle.model,
        fuelType: vehicle.fuelType,
        year: vehicle.year,
      }
    : null;

  // Produits de base :
  //  - sous-critère si sélectionné
  //  - sinon catégorie si sélectionnée
  //  - sinon TOUT le catalogue (cas "voir toutes les pièces compatibles" depuis /vehicle)
  // + filtrage compatibilité véhicule si identifié.
  const baseProducts = useMemo(() => {
    let list: typeof products;
    if (selectedSubcriteria) list = getProductsForSubcriteria(selectedSubcriteria);
    else if (selectedCategory) list = products.filter((p) => p.categoryId === selectedCategory);
    else list = products;
    if (vehicleInfo) {
      list = list.filter((p) => isProductCompatibleWithVehicle(p.id, vehicleInfo));
    }
    return list;
  }, [selectedCategory, selectedSubcriteria, vehicleInfo]);

  // Filtrage
  const filteredProducts = useMemo(() => {
    let list = [...baseProducts];

    switch (activeFilter) {
      case 'in-stock':
        list = list.filter((p) => {
          const stock = getProductStock(p.id, storeId);
          return stock.status === 'in-stock' || stock.status === 'last-unit';
        });
        break;
      case 'equivalents':
        // Produits qui ont des équivalents
        list = list.filter((p) => p.equivalentIds && p.equivalentIds.length > 0);
        break;
      case 'other-stores':
        // Produits disponibles dans d'autres centres (mais pas forcément ici)
        list = list.filter((p) => {
          const stock = getProductStock(p.id, storeId);
          return stock.status === 'unavailable' || stock.status === 'on-order';
        });
        break;
    }

    // Tri
    switch (sortBy) {
      case 'brand':
        list.sort((a, b) => a.brand.localeCompare(b.brand));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
    }

    return list;
  }, [baseProducts, activeFilter, sortBy, storeId]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentPageProducts = filteredProducts.slice(
    page * PRODUCTS_PER_PAGE,
    (page + 1) * PRODUCTS_PER_PAGE
  );

  const handleFilterChange = (f: FilterTab) => {
    setActiveFilter(f);
    setPage(0);
  };

  const handleProductClick = (productId: string) => {
    // Toujours afficher la fiche produit (avec description), même si indisponible.
    // La fiche gère l'affichage du statut de stock.
    router.push(`/product/${productId}`);
  };

  const getStockBadge = (productId: string) => {
    const stock = getProductStock(productId, storeId);
    switch (stock.status) {
      case 'in-stock':
        return { label: `EN STOCK · ${stock.quantity}`, color: 'var(--status-green)' };
      case 'last-unit':
        return { label: `DERNIER${stock.quantity > 1 ? 'S' : ''} · ${stock.quantity}`, color: 'var(--status-amber)' };
      case 'on-order':
        return { label: 'SUR COMMANDE', color: '#3B82F6' };
      case 'unavailable':
        return { label: 'INDISPONIBLE', color: 'var(--status-red)' };
    }
  };

  const screenName = subcriterion ? `${category?.name} · ${subcriterion.name}` : category?.name || 'Résultats';

  return (
    <KioskLayout screenName={screenName}>
      <div className="h-full flex flex-col px-8 py-5 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/subcriteria')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <ArrowLeft size={18} />
            Sous-critères
          </button>

          {plate && (
            <div className="flex items-center gap-3 px-5 py-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-orange)]">
              <Car size={20} className="text-[var(--autobacs-orange)]" />
              <div>
                <div className="text-base font-bold tracking-wider" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {vehicle?.plate || plate}
                </div>
                <div className="text-xs text-[var(--autobacs-text-muted)]">
                  {vehicle?.model || 'Véhicule détecté'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bandeau compatibilité véhicule */}
        {vehicleInfo && (
          <div className="flex items-center gap-3 px-4 py-2 mb-3 bg-[var(--autobacs-card-bg)] border-l-4 border-[var(--autobacs-orange)]">
            <CheckCircle2 size={18} className="text-[var(--autobacs-orange)] flex-shrink-0" />
            <div
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              <span className="text-[var(--autobacs-text-muted)]">Filtré pour votre véhicule : </span>
              <span className="text-[var(--autobacs-orange)]">
                {vehicleInfo.brand} {vehicleInfo.model}
                {vehicleInfo.fuelType ? ` · ${vehicleInfo.fuelType}` : ''}
              </span>
              <span className="text-[var(--autobacs-text-muted)]"> — {baseProducts.length} produit{baseProducts.length > 1 ? 's' : ''} compatible{baseProducts.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Filters + Sort */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'in-stock', label: 'En stock ici' },
              { id: 'equivalents', label: 'Équivalents' },
              { id: 'other-stores', label: 'Autres centres' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id as FilterTab)}
                className={`px-5 py-2 uppercase tracking-wide transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[var(--autobacs-orange)] text-white'
                    : 'bg-[var(--autobacs-card-bg)] text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)]'
                }`}
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.9rem', minHeight: '44px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] text-[var(--autobacs-black)] px-4 py-2 text-sm uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <option value="default">Tri : Par défaut</option>
            <option value="brand">Tri : Marque</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>

        {/* Product grid 2x2 */}
        <div className="flex-1 min-h-0">
          {currentPageProducts.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xl text-[var(--autobacs-text-muted)]">Aucun produit trouvé pour ce filtre</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4 h-full auto-rows-fr">
              {currentPageProducts.map((product) => {
                const badge = getStockBadge(product.id);
                const isComparing = compareIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleProductClick(product.id); }}
                    className="stagger-item group relative bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all overflow-hidden text-left flex flex-row cursor-pointer"
                  >
                    {/* Image */}
                    <div className="w-28 md:w-32 lg:w-44 bg-[var(--autobacs-dark-bg)] relative overflow-hidden flex-shrink-0 flex items-center justify-center p-3">
                      <img
                        src={getProductImage(product.id)}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div
                        className="absolute top-3 left-3 px-3 py-1 text-[11px] font-bold tracking-wider text-white"
                        style={{ backgroundColor: badge.color, fontFamily: 'Barlow Condensed, sans-serif' }}
                      >
                        {badge.label}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold tracking-wider ${
                            product.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-black)]'
                          }`}
                          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                        >
                          {product.brand}
                        </span>
                      </div>

                      <h3
                        className="text-lg mb-1 line-clamp-2 group-hover:text-[var(--autobacs-orange)] transition-colors"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                      >
                        {product.name}
                      </h3>

                      <div className="text-xs text-[var(--autobacs-text-muted)] mb-2">
                        {product.specTagline}
                      </div>

                      {/* Expert tip preview */}
                      <p
                        className="text-[11px] italic text-[var(--autobacs-orange)]/80 line-clamp-2 leading-tight mb-2 pl-2 border-l-2 border-[var(--autobacs-orange)]/60"
                      >
                        {product.expertAdvice}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-2">
                        {product.promoPrice != null ? (
                          <div className="flex items-baseline gap-2">
                            <span
                              className="text-3xl text-[var(--autobacs-orange)]"
                              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                            >
                              {product.promoPrice.toFixed(2)} €
                            </span>
                            <span
                              className="text-sm text-[var(--autobacs-text-muted)] line-through"
                              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                            >
                              {product.price.toFixed(2)} €
                            </span>
                          </div>
                        ) : (
                          <div
                            className="text-3xl text-[var(--autobacs-orange)]"
                            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                          >
                            {product.price.toFixed(2)} €
                          </div>
                        )}
                        <div className="text-[10px] text-[var(--autobacs-text-muted)] uppercase tracking-wider">
                          Réf. {product.reference}
                        </div>
                      </div>
                    </div>

                    {/* Bouton Comparer — flottant en haut à droite */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }}
                      className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider border transition-all ${
                        isComparing
                          ? 'bg-[var(--autobacs-orange)] text-white border-[var(--autobacs-orange)]'
                          : 'bg-[var(--autobacs-dark-bg)] text-[var(--autobacs-text-muted)] border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:text-[var(--autobacs-orange)]'
                      }`}
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                      aria-label={isComparing ? `Retirer ${product.name} du comparateur` : `Comparer ${product.name}`}
                    >
                      <Scale size={12} />
                      {isComparing ? 'Sélectionné' : 'Comparer'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="w-12 h-12 flex items-center justify-center bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={22} />
            </button>
            <div
              className="text-sm uppercase tracking-wider text-[var(--autobacs-text-muted)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              Page {page + 1} / {totalPages} · {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="w-12 h-12 flex items-center justify-center bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
    </KioskLayout>
  );
}
