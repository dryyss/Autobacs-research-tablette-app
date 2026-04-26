'use client';

import { useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import { useKiosk } from '@/context/KioskContext';
import { products, getProductStock, getProductImage, getLoyaltyPrice } from '@/data/mockData';
import { ArrowLeft, Home, X, Check } from 'lucide-react';

export default function ComparePage() {
  const router = useRouter();
  const { compareIds, toggleCompare, clearCompare, storeId } = useKiosk();

  const selected = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (selected.length < 2) {
    return (
      <KioskLayout screenName="Comparateur">
        <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg text-[var(--autobacs-text-muted)]">
            Sélectionnez au moins 2 produits pour les comparer.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] text-white uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            Retour
          </button>
        </div>
      </KioskLayout>
    );
  }

  // Union des labels de specs (pour afficher une ligne par caractéristique)
  const specLabels = Array.from(
    new Set(selected.flatMap((p) => p.specs.map((s) => s.label)))
  );

  const minPrice = Math.min(...selected.map((p) => p.promoPrice ?? p.price));

  return (
    <KioskLayout screenName="Comparateur produits">
      <div className="h-full flex flex-col px-6 py-4 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] uppercase tracking-wide"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              <ArrowLeft size={16} />
              Retour
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-orange)] uppercase tracking-wide border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              <Home size={16} />
              Accueil
            </button>
          </div>
          <button
            onClick={clearCompare}
            className="text-xs uppercase tracking-wider text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-orange)]"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            Tout vider
          </button>
        </div>

        {/* Colonnes produits */}
        <div
          className="flex-1 grid gap-3 overflow-auto"
          style={{ gridTemplateColumns: `200px repeat(${selected.length}, minmax(220px, 1fr))` }}
        >
          {/* Col d'en-tête labels — vide en haut, puis un label par ligne */}
          <div className="flex flex-col gap-0 sticky left-0 z-10 bg-[var(--autobacs-dark-bg)]">
            {/* Spacer pour aligner avec l'image/header */}
            <div className="h-[228px] flex-shrink-0" />
            <CompareRowLabel>Prix</CompareRowLabel>
            <CompareRowLabel>Réf.</CompareRowLabel>
            <CompareRowLabel>EAN</CompareRowLabel>
            <CompareRowLabel>Stock ici</CompareRowLabel>
            <CompareRowLabel>Description</CompareRowLabel>
            {specLabels.map((lbl) => (
              <CompareRowLabel key={lbl}>{lbl}</CompareRowLabel>
            ))}
          </div>

          {/* Une colonne par produit */}
          {selected.map((p) => {
            const stock = getProductStock(p.id, storeId);
            const effectivePrice = p.promoPrice ?? p.price;
            const isBestPrice = effectivePrice === minPrice;
            return (
              <div
                key={p.id}
                className="flex flex-col border border-[var(--autobacs-border)] bg-[var(--autobacs-card-bg)]"
              >
                {/* Header : image + nom + bouton retirer */}
                <div className="relative p-3 border-b border-[var(--autobacs-border)]">
                  <button
                    onClick={() => toggleCompare(p.id)}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-orange)]"
                    aria-label={`Retirer ${p.name}`}
                  >
                    <X size={14} />
                  </button>
                  <div className="w-full h-28 bg-[var(--autobacs-dark-bg)] flex items-center justify-center p-2 mb-2">
                    <img
                      src={getProductImage(p.id)}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div
                    className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${
                      p.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-black)]'
                    }`}
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    {p.brand}
                  </div>
                  <button
                    onClick={() => router.push(`/product/${p.id}`)}
                    className="text-sm leading-tight text-left hover:text-[var(--autobacs-orange)] transition-all"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                  >
                    {p.name}
                  </button>
                </div>

                {/* Prix */}
                <CompareCell highlight={isBestPrice}>
                  <div className="flex flex-col">
                    {p.promoPrice != null ? (
                      <>
                        <span
                          className="text-xl text-[var(--autobacs-orange)]"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                        >
                          {p.promoPrice.toFixed(2)} €
                        </span>
                        <span className="text-xs text-[var(--autobacs-text-muted)] line-through">
                          {p.price.toFixed(2)} €
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-xl text-[var(--autobacs-orange)]"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                      >
                        {p.price.toFixed(2)} €
                      </span>
                    )}
                    {isBestPrice && (
                      <span className="mt-1 text-[10px] uppercase tracking-wider text-[var(--status-green)] font-bold flex items-center gap-1">
                        <Check size={12} /> Meilleur prix
                      </span>
                    )}
                    {(() => {
                      const lp = getLoyaltyPrice(p);
                      if (lp == null) return null;
                      return (
                        <span
                          className="mt-1 text-[10px] uppercase tracking-wider text-[var(--autobacs-orange)] font-bold"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                        >
                          Card · {lp.toFixed(2)} €
                        </span>
                      );
                    })()}
                  </div>
                </CompareCell>

                {/* Réf / EAN */}
                <CompareCell>
                  <span className="font-mono text-xs">{p.reference}</span>
                </CompareCell>
                <CompareCell>
                  <span className="font-mono text-xs">{p.barcode}</span>
                </CompareCell>

                {/* Stock */}
                <CompareCell>
                  {stock.status === 'in-stock' && (
                    <span className="text-[var(--status-green)] text-xs font-bold">
                      ✓ {stock.quantity} en stock
                    </span>
                  )}
                  {stock.status === 'last-unit' && (
                    <span className="text-[var(--status-amber)] text-xs font-bold">
                      {stock.quantity} dernière{stock.quantity > 1 ? 's' : ''}
                    </span>
                  )}
                  {stock.status === 'on-order' && (
                    <span className="text-blue-400 text-xs font-bold">Sur commande</span>
                  )}
                  {stock.status === 'unavailable' && (
                    <span className="text-[var(--status-red)] text-xs font-bold">Indisponible</span>
                  )}
                </CompareCell>

                {/* Description */}
                <CompareCell>
                  <p className="text-xs text-[var(--autobacs-text-muted)] leading-snug line-clamp-4">
                    {p.description}
                  </p>
                </CompareCell>

                {/* Specs (une ligne par label, "-" si le produit n'a pas la valeur) */}
                {specLabels.map((lbl) => {
                  const found = p.specs.find((s) => s.label === lbl);
                  return (
                    <CompareCell key={lbl}>
                      {found ? (
                        <span className="text-sm font-medium">{found.value}</span>
                      ) : (
                        <span className="text-xs text-[var(--autobacs-text-muted)]">—</span>
                      )}
                    </CompareCell>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </KioskLayout>
  );
}

function CompareRowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 py-2 text-[10px] uppercase tracking-wider text-[var(--autobacs-text-muted)] border-b border-[var(--autobacs-border)] min-h-[48px] flex items-center"
      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
    >
      {children}
    </div>
  );
}

function CompareCell({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 border-b border-[var(--autobacs-border)] min-h-[48px] flex items-center ${
        highlight ? 'bg-[var(--autobacs-orange)]/10' : ''
      }`}
    >
      {children}
    </div>
  );
}
