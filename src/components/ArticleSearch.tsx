'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { categories, products, searchProducts, getProductImage, getCategoryImage, type Product } from '@/data/mockData';
import { X, Search, Keyboard, Delete, ArrowLeft } from 'lucide-react';

interface Props {
  onClose: () => void;
}

type View = 'categories' | 'products' | 'keyboard';

const KEYBOARD_ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'],
  ['Y', 'Z', '0', '1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', ' '],
];

export function ArticleSearch({ onClose }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const categoryProducts: Product[] = useMemo(() => {
    if (!selectedCategoryId) return [];
    return products.filter((p) => p.categoryId === selectedCategoryId).slice(0, 20);
  }, [selectedCategoryId]);

  const searchResults: Product[] = useMemo(() => {
    if (query.trim().length < 1) return [];
    return searchProducts(query, { limit: 12 });
  }, [query]);

  const handleProductClick = (productId: string) => {
    onClose();
    router.push(`/product/${productId}`);
  };

  const handleKeyPress = (key: string) => {
    if (query.length < 20) setQuery(query + key);
  };

  const handleDeleteChar = () => setQuery(query.slice(0, -1));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-8 lg:pt-16"
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.94)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] shadow-2xl w-full max-w-4xl flex flex-col"
        style={{ animation: 'scaleIn 0.3s ease-out', maxHeight: '88vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--autobacs-border)]">
          {view !== 'categories' && (
            <button
              onClick={() => {
                setView('categories');
                setSelectedCategoryId(null);
                setQuery('');
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wider"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              <ArrowLeft size={14} />
              Retour
            </button>
          )}

          <div className="flex-1 flex items-center gap-2">
            <Search size={18} className="text-[var(--autobacs-orange)]" />
            <span
              className="text-base md:text-lg"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              {view === 'categories' && 'PARCOURIR LE CATALOGUE'}
              {view === 'products' && categories.find((c) => c.id === selectedCategoryId)?.name.toUpperCase()}
              {view === 'keyboard' && 'RECHERCHE TEXTUELLE'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--autobacs-border)] hover:bg-[var(--autobacs-orange)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {/* ── Catégories ── */}
          {view === 'categories' && (
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setView('products');
                    }}
                    className="bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-3 flex flex-col items-center gap-2 transition-all"
                    style={{ minHeight: '120px' }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--autobacs-card-bg)] flex items-center justify-center p-2">
                      <img src={getCategoryImage(cat.id)} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                    <span
                      className="text-xs md:text-sm uppercase tracking-wide text-center leading-tight"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                    >
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Bouton clavier en bas */}
              <button
                onClick={() => setView('keyboard')}
                className="mt-5 w-full flex items-center justify-center gap-2 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] py-3 transition-all uppercase tracking-wide"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
              >
                <Keyboard size={18} className="text-[var(--autobacs-orange)]" />
                <span className="text-sm">Rechercher par nom ou référence</span>
              </button>
            </div>
          )}

          {/* ── Produits d'une catégorie ── */}
          {view === 'products' && (
            <div className="divide-y divide-[var(--autobacs-border)]">
              {categoryProducts.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[var(--autobacs-text-muted)]">
                  Aucun produit dans cette catégorie
                </div>
              ) : (
                categoryProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProductClick(p.id)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--autobacs-orange)]/10 transition-all text-left"
                  >
                    <div className="w-14 h-14 flex-shrink-0 overflow-hidden bg-[var(--autobacs-dark-bg)] flex items-center justify-center p-1.5">
                      <img src={getProductImage(p.id)} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          p.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-black)]'
                        }`}
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                      >
                        {p.brand}
                      </div>
                      <div
                        className="text-sm truncate"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                      >
                        {p.name}
                      </div>
                      <div className="text-[10px] text-[var(--autobacs-text-muted)] truncate">
                        {p.specTagline}
                      </div>
                    </div>
                    <div
                      className="text-lg text-[var(--autobacs-orange)] flex-shrink-0"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                    >
                      {p.price.toFixed(2)} €
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* ── Recherche clavier ── */}
          {view === 'keyboard' && (
            <div className="flex flex-col h-full">
              {/* Input display */}
              <div className="px-5 py-4 border-b border-[var(--autobacs-border)] bg-[var(--autobacs-dark-bg)]">
                <div className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] px-4 py-3 flex items-center gap-3">
                  <Search size={18} className="text-[var(--autobacs-orange)] flex-shrink-0" />
                  <span
                    className="flex-1 text-lg text-[var(--autobacs-black)]"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                  >
                    {query || <span className="text-[var(--autobacs-text-muted)] font-normal">Tapez pour rechercher…</span>}
                  </span>
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--autobacs-border)]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Résultats */}
              <div className="flex-1 overflow-auto">
                {query.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-xs text-[var(--autobacs-text-muted)] mb-3">Suggestions rapides :</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['BOSCH', 'H7', 'FILTRE', 'BATTERIE', 'PLAQUETTES', '5W-30'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="px-3 py-1.5 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] text-xs uppercase tracking-wider transition-all"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-[var(--autobacs-text-muted)]">
                    Aucun produit trouvé pour « {query} »
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--autobacs-border)]">
                    {searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleProductClick(p.id)}
                        className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--autobacs-orange)]/10 transition-all text-left"
                      >
                        <div className="w-10 h-10 flex-shrink-0 overflow-hidden bg-[var(--autobacs-dark-bg)] flex items-center justify-center p-1">
                          <img src={getProductImage(p.id)} alt={p.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--autobacs-orange)]">
                            {p.brand}
                          </div>
                          <div
                            className="text-sm truncate"
                            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                          >
                            {p.name}
                          </div>
                        </div>
                        <div
                          className="text-base text-[var(--autobacs-orange)] flex-shrink-0"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                        >
                          {p.price.toFixed(2)} €
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clavier virtuel */}
              <div className="p-3 border-t border-[var(--autobacs-border)] bg-[var(--autobacs-dark-bg)]">
                <div className="flex flex-col gap-1.5">
                  {KEYBOARD_ROWS.map((row, i) => (
                    <div key={i} className="flex gap-1.5 justify-center">
                      {row.map((key) => (
                        <button
                          key={key}
                          onClick={() => handleKeyPress(key)}
                          className={`${
                            key === ' ' ? 'w-48' : 'w-10 md:w-12'
                          } h-10 md:h-11 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] transition-all text-sm md:text-base font-bold`}
                          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                        >
                          {key === ' ' ? '_' : key}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-center mt-1">
                    <button
                      onClick={handleDeleteChar}
                      className="w-32 h-10 md:h-11 transition-all flex items-center justify-center gap-2 text-white border border-[var(--autobacs-orange-dark)]"
                      style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, var(--autobacs-orange-dark) 0%, #8A3A14 100%)',
                      }}
                    >
                      <Delete size={18} />
                      <span className="text-sm uppercase">Effacer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
