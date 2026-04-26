'use client';

import { useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import { categories, getSubcriteriaForCategory, getProductsForSubcriteria } from '@/data/mockData';
import { useKiosk } from '@/context/KioskContext';
import {
  Car, ArrowLeft, Circle, List,
  Lightbulb, SunDim, Octagon, ArrowRightCircle, ArrowLeftCircle, Undo2,
  ArrowLeft as ArrLeft, ArrowRight, ArrowDown, Snowflake, Minus, Wrench,
  BatteryLow, BatteryMedium, BatteryFull, Zap, Plug, Recycle,
  Droplet, Droplets, FlaskConical, Package,
  CloudSun, Link2,
  Disc, Shield, Filter, Wind, User, Fuel, Sparkles,
  RotateCw, Power, Cog,
  Plug2, Camera, Square, ShieldAlert, Hammer,
} from 'lucide-react';

type IconType = typeof Circle;

const SUBCRITERIA_ICONS: Record<string, IconType> = {
  // Éclairage
  'lighting-low': Lightbulb, 'lighting-high': SunDim, 'lighting-position': Circle,
  'lighting-turn': ArrowRightCircle, 'lighting-stop': Octagon, 'lighting-reverse': Undo2,
  // Essuie-glaces
  'wipers-front-driver': ArrLeft, 'wipers-front-passenger': ArrowRight, 'wipers-rear': ArrowDown,
  'wipers-winter': Snowflake, 'wipers-beam': Minus, 'wipers-adapters': Wrench,
  // Batteries
  'bat-small': BatteryLow, 'bat-medium': BatteryMedium, 'bat-large': BatteryFull,
  'bat-agm': Zap, 'bat-accessories': Plug, 'bat-recycle': Recycle,
  // Fluides
  'fluid-5w30': Droplet, 'fluid-5w40': Droplet, 'fluid-0w30': Snowflake, 'fluid-10w40': Droplet,
  'fluid-additives': FlaskConical, 'fluid-brake': Droplets,
  // Pneus
  'tire-15': Circle, 'tire-16': Circle, 'tire-17': Circle,
  'tire-winter': Snowflake, 'tire-allseason': CloudSun, 'tire-chains': Link2,
  // Freinage
  'brake-pads-front': Disc, 'brake-pads-rear': Disc,
  'brake-disc-front': Disc, 'brake-disc-rear': Disc,
  'brake-fluid': Droplet, 'brake-kit': Package,
  // Filtres
  'filter-air': Wind, 'filter-oil': Droplet, 'filter-cabin': User,
  'filter-fuel': Fuel, 'filter-kit': Package, 'filter-special': Sparkles,
  // Échappement
  'exhaust-rear': ArrowRight, 'exhaust-mid': Minus, 'exhaust-cat': Shield,
  'exhaust-fap': Filter, 'exhaust-full': Package, 'exhaust-parts': Wrench,
  // Distribution
  'dist-belt': RotateCw, 'dist-kit': Package, 'dist-tensioner': Wrench,
  'dist-alternator': Zap, 'dist-starter': Power, 'dist-clutch': Disc,
  // Accessoires
  'acc-chargers': Plug2, 'acc-dashcam': Camera, 'acc-mats': Square,
  'acc-carcare': Sparkles, 'acc-safety': ShieldAlert, 'acc-tools': Hammer,
};

export default function SubcriteriaPage() {
  const router = useRouter();
  const { plate, vehicle, selectedCategory, setSelectedSubcriteria } = useKiosk();

  const category = categories.find((c) => c.id === selectedCategory);
  const subcriteria = selectedCategory ? getSubcriteriaForCategory(selectedCategory) : [];

  const handleSubcriteriaClick = (subcriteriaId: string) => {
    setSelectedSubcriteria(subcriteriaId);
    router.push('/results');
  };

  const handleViewAll = () => {
    // Pas de sous-critère sélectionné → /results liste tous les produits de la catégorie
    // (filtrés en plus par la plaque si véhicule identifié)
    setSelectedSubcriteria(null);
    router.push('/results');
  };

  if (!category) {
    return (
      <KioskLayout screenName="Sous-critères">
        <div className="h-full flex items-center justify-center">
          <button
            onClick={() => router.push('/categories')}
            className="px-8 py-4 bg-[var(--autobacs-orange)] text-white"
          >
            Retour aux catégories
          </button>
        </div>
      </KioskLayout>
    );
  }

  return (
    <KioskLayout screenName={category.name}>
      <div className="h-full flex flex-col px-8 py-6 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/categories')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <ArrowLeft size={18} />
            Catégories
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

        {/* Title with category */}
        <div className="text-center mb-4">
          <h1
            className="text-3xl tracking-tight"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
          >
            PRÉCISEZ VOTRE <span className="text-[var(--autobacs-orange)]">BESOIN</span>
          </h1>
          <p className="text-sm text-[var(--autobacs-text-muted)] italic mt-1">
            « {category.expertTip} »
          </p>
          <button
            onClick={handleViewAll}
            className="mt-3 inline-flex items-center gap-2 px-5 py-2 border border-[var(--autobacs-orange)] text-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wider"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}
          >
            <List size={16} />
            Voir toute la liste
          </button>
        </div>

        {/* Sub-criteria grid 3x2 */}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-5 max-w-6xl mx-auto w-full">
          {subcriteria.map((sc, index) => {
            const productCount = getProductsForSubcriteria(sc.id).length;
            return (
              <button
                key={sc.id}
                onClick={() => handleSubcriteriaClick(sc.id)}
                className="stagger-item group relative bg-[var(--autobacs-card-bg)] border-2 border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all p-6 flex flex-col items-center justify-center gap-3 overflow-hidden"
                style={{ minHeight: '180px' }}
              >
                <div className="absolute inset-0 bg-[var(--autobacs-orange)] opacity-0 group-hover:opacity-5 transition-opacity" />

                {/* Icon + numéro */}
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] group-hover:border-[var(--autobacs-orange)] group-hover:bg-[var(--autobacs-orange)]/10 transition-all">
                  {(() => {
                    const Icon = SUBCRITERIA_ICONS[sc.id] || Circle;
                    return <Icon size={28} className="text-[var(--autobacs-orange)]" />;
                  })()}
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--autobacs-orange)] text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Name */}
                <h3
                  className="text-xl uppercase tracking-wide text-center"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  {sc.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-[var(--autobacs-text-muted)] text-center">
                  {sc.description}
                </p>

                {/* Product count */}
                {productCount > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--autobacs-orange)]" />
                    <span className="text-[11px] text-[var(--autobacs-text-muted)] uppercase tracking-wide">
                      {productCount} produit{productCount > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </KioskLayout>
  );
}
