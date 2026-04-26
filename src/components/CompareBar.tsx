'use client';

import { useRouter } from 'next/navigation';
import { useKiosk } from '@/context/KioskContext';
import { products } from '@/data/mockData';
import { Scale, X } from 'lucide-react';

/**
 * Barre flottante bas-droite qui montre combien de produits sont sélectionnés
 * pour comparaison. Invisible tant qu'aucun produit n'est dans le panier.
 */
export default function CompareBar() {
  const router = useRouter();
  const { compareIds, toggleCompare, clearCompare } = useKiosk();

  if (compareIds.length === 0) return null;

  const selected = compareIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div
      className="fixed bottom-4 right-4 z-40 w-80 bg-[var(--autobacs-card-bg)] border-2 border-[var(--autobacs-orange)] shadow-2xl"
      style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--autobacs-orange)] text-white">
        <div className="flex items-center gap-2">
          <Scale size={16} />
          <span className="text-sm font-bold uppercase tracking-wider">
            Comparateur · {compareIds.length}
          </span>
        </div>
        <button
          onClick={clearCompare}
          className="text-white/80 hover:text-white text-xs uppercase tracking-wider"
          aria-label="Vider le comparateur"
        >
          Vider
        </button>
      </div>
      <ul className="max-h-48 overflow-auto">
        {selected.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-2 px-3 py-2 border-b border-[var(--autobacs-border)] last:border-b-0"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--autobacs-orange)] uppercase tracking-wider font-bold">
                {p.brand}
              </div>
              <div className="text-sm truncate font-bold">{p.name}</div>
            </div>
            <button
              onClick={() => toggleCompare(p.id)}
              className="w-6 h-6 flex items-center justify-center text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-orange)]"
              aria-label={`Retirer ${p.name}`}
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => router.push('/compare')}
        disabled={compareIds.length < 2}
        className="w-full py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] disabled:bg-[var(--autobacs-border)] disabled:text-[var(--autobacs-text-muted)] text-white font-bold uppercase tracking-wider transition-all"
      >
        {compareIds.length < 2 ? 'Ajoutez au moins 2 produits' : 'Comparer maintenant'}
      </button>
    </div>
  );
}
