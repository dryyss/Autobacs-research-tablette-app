'use client';

import { useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import { categories, countProductsInCategory, getCategoryImage } from '@/data/mockData';
import { useKiosk } from '@/context/KioskContext';
import { Car, ArrowLeft } from 'lucide-react';

export default function CategoriesPage() {
  const router = useRouter();
  const { plate, vehicle, setSelectedCategory } = useKiosk();

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push('/subcriteria');
  };

  return (
    <KioskLayout screenName="Sélection catégorie">
      <div className="h-full flex flex-col px-3 sm:px-6 md:px-8 py-3 sm:py-6 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <ArrowLeft size={18} />
            Accueil
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

        {/* Title */}
        <div className="text-center mb-4">
          <h1
            className="text-3xl tracking-tight"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
          >
            CHOISISSEZ UNE <span className="text-[var(--autobacs-orange)]">CATÉGORIE</span>
          </h1>
        </div>

        {/* Category grid 5x2 */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 max-w-[1400px] mx-auto w-full overflow-y-auto">
          {categories.map((category) => {
            const count = countProductsInCategory(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="stagger-item group relative bg-[var(--autobacs-card-bg)] border-2 border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all p-4 flex flex-col items-center justify-between overflow-hidden text-center"
              >
                <div className="absolute inset-0 bg-[var(--autobacs-orange)] opacity-0 group-hover:opacity-5 transition-opacity" />

                {/* Image */}
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform bg-[var(--autobacs-dark-bg)] flex items-center justify-center p-2.5">
                  <img src={getCategoryImage(category.id)} alt={category.name} className="w-full h-full object-contain" />
                </div>

                {/* Name */}
                <h3
                  className="text-lg uppercase tracking-wide leading-tight"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  {category.name}
                </h3>

                {/* Product count */}
                <div className="text-xs text-[var(--autobacs-text-muted)]">
                  {count} produit{count > 1 ? 's' : ''}
                </div>

                {/* Expert tip */}
                <p
                  className="text-[11px] text-[var(--autobacs-orange)] italic leading-tight px-1"
                  style={{ fontFamily: 'Barlow, sans-serif' }}
                >
                  « {category.expertTip} »
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </KioskLayout>
  );
}
