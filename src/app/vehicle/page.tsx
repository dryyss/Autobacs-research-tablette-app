'use client';

import { useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import { useKiosk } from '@/context/KioskContext';
import { getProductsForVehicle, countProductsInCategory, categories, getCategoryImage, type VehicleInfo } from '@/data/mockData';
import { Car, ArrowLeft, ArrowRight, Calendar, Fuel, Gauge, Settings, Zap, Package } from 'lucide-react';

export default function VehiclePage() {
  const router = useRouter();
  const { plate, vehicle, setSelectedCategory, setSelectedSubcriteria } = useKiosk();

  const handleBrowseAll = () => {
    // On nettoie les filtres catégorie/sous-critère pour que /results affiche
    // tous les produits compatibles, toutes catégories confondues.
    setSelectedCategory(null);
    setSelectedSubcriteria(null);
    router.push('/results');
  };

  if (!vehicle || !plate) {
    return (
      <KioskLayout screenName="Fiche véhicule">
        <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-lg text-[var(--autobacs-text-muted)] text-center">
            Aucun véhicule identifié
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] transition-all uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            Retour accueil
          </button>
        </div>
      </KioskLayout>
    );
  }

  const vInfo: VehicleInfo = {
    brand: vehicle.brand || '',
    model: vehicle.model,
    fuelType: vehicle.fuelType,
    year: vehicle.year,
  };

  const compatibleProducts = getProductsForVehicle(vInfo);

  // Statistiques par catégorie
  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    count: compatibleProducts.filter((p) => p.categoryId === cat.id).length,
    totalCount: countProductsInCategory(cat.id),
  }));

  return (
    <KioskLayout screenName="Fiche véhicule">
      <div className="h-full flex flex-col px-4 md:px-6 lg:px-8 py-4 md:py-5 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <ArrowLeft size={18} />
            Accueil
          </button>
        </div>

        {/* Main grid : vehicle info + category breakdown */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6 min-h-0 overflow-hidden">
          {/* LEFT — Fiche technique */}
          <div className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] p-3 md:p-4 lg:p-6 overflow-auto">
            {/* Hero */}
            <div className="flex items-start gap-4 mb-5 pb-5 border-b border-[var(--autobacs-border)]">
              {vehicle.logoUrl ? (
                <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white border border-[var(--autobacs-border)] p-1.5">
                  <img
                    src={vehicle.logoUrl}
                    alt={vehicle.brand}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full"
                  style={{ background: 'linear-gradient(135deg, var(--autobacs-orange) 0%, var(--autobacs-orange-dark) 100%)' }}
                >
                  <Car size={28} className="text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-[var(--autobacs-orange)] uppercase tracking-wider font-bold mb-1">
                  Véhicule identifié
                </div>
                <h1
                  className="text-2xl md:text-3xl leading-tight"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                >
                  {vehicle.brand} {vehicle.model}
                </h1>
                {vehicle.version && (
                  <p className="text-sm text-[var(--autobacs-text-muted)] mt-0.5">{vehicle.version}</p>
                )}
              </div>
              <div
                className="px-3 py-1.5 bg-white text-black font-black tracking-wider text-sm"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                {plate}
              </div>
            </div>

            {/* Specs */}
            <div className="space-y-2">
              {[
                { icon: <Calendar size={16} />, label: 'Année', value: vehicle.year },
                { icon: <Fuel size={16} />, label: 'Carburant', value: vehicle.fuelType },
                { icon: <Gauge size={16} />, label: 'Puissance', value: vehicle.power },
                { icon: <Settings size={16} />, label: 'Cylindrée', value: vehicle.engine },
              ]
                .filter((s) => Boolean(s.value))
                .map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2.5 px-3 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)]"
                  >
                    <div className="text-[var(--autobacs-orange)] flex-shrink-0">{spec.icon}</div>
                    <div className="flex-1 text-xs text-[var(--autobacs-text-muted)] uppercase tracking-wider">
                      {spec.label}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                    >
                      {spec.value}
                    </div>
                  </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-5 p-4 bg-[var(--autobacs-dark-bg)] border-l-4 border-[var(--autobacs-orange)]">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-[var(--autobacs-orange)]" />
                <span
                  className="text-xs uppercase tracking-wider font-bold text-[var(--autobacs-orange)]"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  Pièces compatibles
                </span>
              </div>
              <p className="text-sm text-[var(--autobacs-text-muted)]">
                <span className="text-2xl text-[var(--autobacs-black)] font-black mr-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {compatibleProducts.length}
                </span>
                pièces disponibles pour votre véhicule dans le catalogue
              </p>
            </div>
          </div>

          {/* RIGHT — Catégories disponibles */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-lg md:text-xl tracking-wide"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
              >
                CHOISISSEZ UNE CATÉGORIE
              </h2>
              <div className="flex items-center gap-1 text-[10px] text-[var(--autobacs-text-muted)] uppercase tracking-wider">
                <Zap size={12} className="text-[var(--autobacs-orange)]" />
                Compatibilité filtrée
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2 md:gap-3 overflow-auto">
              {categoriesWithCount.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    router.push(`/categories`);
                  }}
                  className="stagger-item bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-3 flex items-center gap-3 transition-all text-left group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full overflow-hidden bg-[var(--autobacs-dark-bg)] flex items-center justify-center p-1.5">
                    <img src={getCategoryImage(cat.id)} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm truncate"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                    >
                      {cat.name}
                    </div>
                    <div className="text-[10px] text-[var(--autobacs-text-muted)]">
                      {cat.count} / {cat.totalCount} compatible{cat.count > 1 ? 's' : ''}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="text-[var(--autobacs-text-muted)] group-hover:text-[var(--autobacs-orange)] transition-all flex-shrink-0"
                  />
                </button>
              ))}
            </div>

            {/* CTA — double action */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={handleBrowseAll}
                className="w-full py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] text-white uppercase tracking-wider flex items-center justify-center gap-2"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, minHeight: '48px' }}
              >
                Voir toutes les pièces compatibles
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => router.push('/categories')}
                className="w-full py-3 border-2 border-[var(--autobacs-orange)] text-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] hover:text-[var(--autobacs-black)] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, minHeight: '48px' }}
              >
                Choisir par catégorie
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
