'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import { products, getProductStock, getOtherStoresWithStock, getProductImage, getLoyaltyPrice } from '@/data/mockData';
import { useKiosk } from '@/context/KioskContext';
import { Car, MapPin, ShoppingBag, ArrowLeft, Home, Clock, Navigation, Scale, ChevronLeft, ChevronRight } from 'lucide-react';
import Barcode from '@/components/Barcode';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const { plate, vehicle, storeId, compareIds, toggleCompare, trackViewed } = useKiosk();
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (productId) trackViewed(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const scrollCarousel = (dir: 'prev' | 'next') => {
    const el = carouselRef.current;
    if (!el) return;
    // Défile par la largeur visible (≈ 4 cartes sur md, 2 en dessous)
    const amount = el.clientWidth * 0.85 * (dir === 'next' ? 1 : -1);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return (
      <KioskLayout screenName="Produit introuvable">
        <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-xl text-[var(--autobacs-text-muted)]">Produit introuvable</p>
          <button
            onClick={() => router.push('/categories')}
            className="px-6 py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] text-white uppercase tracking-wide transition-all"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            Retour aux catégories
          </button>
        </div>
      </KioskLayout>
    );
  }

  const stock = getProductStock(product.id, storeId);

  const getStockDisplay = () => {
    switch (stock.status) {
      case 'in-stock':
        return { label: `EN STOCK · ${stock.quantity}`, color: 'var(--status-green)' };
      case 'last-unit':
        return { label: `DERNIÈRE${stock.quantity > 1 ? 'S' : ''} UNITÉ${stock.quantity > 1 ? 'S' : ''} · ${stock.quantity}`, color: 'var(--status-amber)' };
      case 'on-order':
        return { label: 'SUR COMMANDE', color: '#3B82F6' };
      default:
        return { label: 'INDISPONIBLE', color: 'var(--status-red)' };
    }
  };

  const stockDisplay = getStockDisplay();
  const available = stock.status === 'in-stock' || stock.status === 'last-unit';
  const onOrder = stock.status === 'on-order';
  // Top 3 autres centres avec stock, triés par proximité
  const nearestStores = !available ? getOtherStoresWithStock(product.id, storeId).slice(0, 3) : [];

  // Produits "aussi consultés" : même sous-catégorie, marque/variante différentes.
  // Seed stable sur le productId → le même produit affiche toujours les mêmes suggestions.
  const alsoViewed = products
    .filter((p) => p.id !== product.id && p.subcriteriaId === product.subcriteriaId)
    .slice(0, 8);

  return (
    <KioskLayout screenName="Fiche produit">
      <div className="h-full flex flex-col px-3 sm:px-6 md:px-8 py-3 sm:py-5 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/results')}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wide"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              <ArrowLeft size={18} />
              Résultats
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-orange)] transition-all uppercase tracking-wide border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              <Home size={18} />
              Accueil
            </button>
          </div>

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

        {/* Stock + location — banner en haut */}
        <div className="max-w-3xl mx-auto w-full bg-[var(--autobacs-card-bg)] border-2 border-[var(--autobacs-border)] p-3 flex items-center justify-between mb-4">
          <div
            className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: stockDisplay.color, fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            {stockDisplay.label}
          </div>
          {stock.aisle && (
            <div className="flex items-center gap-2 text-[var(--autobacs-text-muted)]">
              <MapPin size={18} className="text-[var(--autobacs-orange)]" />
              <span className="text-sm font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                {stock.aisle}
              </span>
            </div>
          )}
        </div>

        {/* Main content — mono colonne */}
        <div className="flex-1 max-w-3xl mx-auto w-full min-h-0">
          <div className="flex flex-col overflow-auto pr-2 h-full">
            {/* En-tête avec photo produit compacte + brand/nom/ref */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-3">
              <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto sm:mx-0 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] flex items-center justify-center p-3 sm:p-4">
                <img
                  src={getProductImage(product.id)}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm mb-1 uppercase tracking-wider font-bold ${
                    product.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-black)]'
                  }`}
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {product.brand}
                </div>
                <h1
                  className="text-3xl mb-1 leading-tight"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                >
                  {product.name}
                </h1>
                <div className="text-xs text-[var(--autobacs-text-muted)] uppercase tracking-wider flex flex-wrap gap-x-4 gap-y-1">
                  <span>Réf. {product.reference}</span>
                  <span>EAN {product.barcode}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[var(--autobacs-text-muted)] leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Price (avec promo si applicable) */}
            <div className="flex items-baseline gap-3 mb-2">
              {product.promoPrice != null ? (
                <>
                  <span
                    className="text-5xl text-[var(--autobacs-orange)]"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                  >
                    {product.promoPrice.toFixed(2)} €
                  </span>
                  <span
                    className="text-xl text-[var(--autobacs-text-muted)] line-through"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                  >
                    {product.price.toFixed(2)} €
                  </span>
                  <span
                    className="px-2 py-0.5 bg-[var(--autobacs-orange)] text-white text-xs font-bold"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    -{Math.round((1 - product.promoPrice / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span
                  className="text-5xl text-[var(--autobacs-orange)]"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                >
                  {product.price.toFixed(2)} €
                </span>
              )}
            </div>

            {/* Prix carte fidélité — affiché uniquement si pas déjà en promo */}
            {(() => {
              const loyaltyPrice = getLoyaltyPrice(product);
              if (loyaltyPrice == null) return null;
              return (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--autobacs-orange)]/10 border border-[var(--autobacs-orange)]/40 self-start">
                  <span
                    className="text-[10px] uppercase tracking-wider text-[var(--autobacs-orange)] font-bold"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    Autobacs Card
                  </span>
                  <span
                    className="text-base text-[var(--autobacs-orange)]"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                  >
                    {loyaltyPrice.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-[var(--autobacs-text-muted)]">
                    avec votre carte fidélité (−5 %)
                  </span>
                </div>
              );
            })()}

            {/* Expert advice block */}
            <div className="mb-4 bg-[var(--autobacs-card-bg)] border-l-4 border-[var(--autobacs-orange)] p-4">
              <div
                className="text-[10px] text-[var(--autobacs-orange)] uppercase tracking-wider font-bold mb-1"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                Conseil expert
              </div>
              <p className="text-sm italic leading-relaxed" style={{ fontFamily: 'Barlow, sans-serif' }}>
                {product.expertAdvice}
              </p>
            </div>

            {/* Specs */}
            <div className="mb-4">
              <h3
                className="text-sm mb-2 uppercase tracking-wide text-[var(--autobacs-text-muted)]"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
              >
                Caractéristiques techniques
              </h3>
              <div className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)]">
                {product.specs.map((spec, index) => (
                  <div
                    key={index}
                    className={`flex justify-between px-4 py-2 text-sm ${
                      index !== product.specs.length - 1 ? 'border-b border-[var(--autobacs-border)]' : ''
                    }`}
                  >
                    <span className="text-[var(--autobacs-text-muted)]">{spec.label}</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code-barres EAN-13 scannable en caisse */}
            <div className="mb-4 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] p-4 flex items-center gap-4">
              <div className="flex-shrink-0 bg-white p-2">
                <Barcode value={product.barcode} width={180} barHeight={52} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] uppercase tracking-wider text-[var(--autobacs-orange)] font-bold mb-1"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  Code-barres EAN-13
                </div>
                <p className="text-xs text-[var(--autobacs-text-muted)] leading-relaxed">
                  Présentez ce code en caisse ou scannez-le avec la douchette
                  pour passer directement au paiement.
                </p>
              </div>
            </div>

            {/* Bloc disponibilité — affiché uniquement si non disponible ici */}
            {!available && (
              <div className="mb-4 border border-[var(--autobacs-border)] bg-[var(--autobacs-card-bg)] p-4 space-y-3">
                <h3
                  className="text-sm uppercase tracking-wide text-[var(--autobacs-orange)]"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  {onOrder ? 'Disponible sur commande' : 'Indisponible dans ce centre'}
                </h3>

                {onOrder && (
                  <div className="flex items-center gap-2 text-sm text-[var(--autobacs-text-muted)]">
                    <Clock size={16} className="text-[var(--autobacs-orange)]" />
                    <span>Livraison en magasin sous 48-72h, retrait gratuit.</span>
                  </div>
                )}

                {nearestStores.length > 0 && (
                  <div>
                    <div
                      className="text-[11px] uppercase tracking-wider text-[var(--autobacs-text-muted)] mb-2"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                    >
                      Centres Autobacs les plus proches avec stock
                    </div>
                    <div className="space-y-1.5">
                      {nearestStores.map((s, i) => (
                        <div
                          key={s.id}
                          className={`flex items-center gap-3 px-3 py-2 bg-[var(--autobacs-dark-bg)] border ${
                            i === 0 ? 'border-[var(--autobacs-orange)]' : 'border-[var(--autobacs-border)]'
                          }`}
                        >
                          <Navigation size={14} className={i === 0 ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-text-muted)]'} />
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-sm truncate"
                              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                            >
                              {s.shortName}
                              {i === 0 && (
                                <span className="ml-2 text-[10px] text-[var(--autobacs-orange)] uppercase tracking-wider">★ Le + proche</span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--autobacs-text-muted)]">
                              {s.city} ({s.postalCode})
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className="text-sm text-[var(--autobacs-orange)]"
                              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                            >
                              {s.distanceKm} km
                            </div>
                            <div className="text-[10px] text-[var(--status-green)] font-bold">
                              {s.quantity} en stock
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto space-y-2 pt-2">
              {/* Bouton Comparer — disponible dans tous les cas */}
              {(() => {
                const isComparing = compareIds.includes(product.id);
                return (
                  <button
                    onClick={() => toggleCompare(product.id)}
                    className={`w-full px-6 py-4 flex items-center justify-center gap-3 transition-all ${
                      isComparing
                        ? 'bg-[var(--autobacs-orange)] text-white'
                        : 'border-2 border-[var(--autobacs-orange)] text-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] hover:text-[var(--autobacs-black)]'
                    }`}
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.25rem', fontWeight: 700, minHeight: '60px' }}
                  >
                    <Scale size={22} />
                    {isComparing ? 'RETIRER DU COMPARATEUR' : 'AJOUTER AU COMPARATEUR'}
                  </button>
                );
              })()}
              {available ? null : onOrder ? (
                <>
                  <button
                    className="w-full px-6 py-4 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] transition-all flex items-center justify-center gap-3"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.25rem', fontWeight: 700, minHeight: '60px' }}
                  >
                    <ShoppingBag size={22} />
                    COMMANDER (48-72H)
                  </button>
                  <button
                    onClick={() => router.push(`/unavailable?productId=${product.id}`)}
                    className="w-full px-6 py-4 border-2 border-[var(--autobacs-orange)] text-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] hover:text-[var(--autobacs-black)] transition-all flex items-center justify-center gap-3"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.25rem', fontWeight: 700, minHeight: '60px' }}
                  >
                    <MapPin size={22} />
                    VOIR LES ALTERNATIVES
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push(`/unavailable?productId=${product.id}`)}
                  className="w-full px-6 py-4 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] transition-all flex items-center justify-center gap-3"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1.25rem', fontWeight: 700, minHeight: '60px' }}
                >
                  <ShoppingBag size={22} />
                  VOIR LES ALTERNATIVES
                </button>
              )}
            </div>

            {/* Suggestions — carousel "aussi consultés" dans la même sous-catégorie */}
            {alsoViewed.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[var(--autobacs-border)]">
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-sm uppercase tracking-wide text-[var(--autobacs-text-muted)]"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                  >
                    Ces clients ont aussi consulté
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCarousel('prev')}
                      className="w-8 h-8 flex items-center justify-center bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:text-[var(--autobacs-orange)] transition-all"
                      aria-label="Précédent"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => scrollCarousel('next')}
                      className="w-8 h-8 flex items-center justify-center bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:text-[var(--autobacs-orange)] transition-all"
                      aria-label="Suivant"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div
                  ref={carouselRef}
                  className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {alsoViewed.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/product/${p.id}`)}
                      className="flex-shrink-0 w-1/2 md:w-1/4 snap-start flex flex-col bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-2 transition-all text-left"
                    >
                      <div className="w-full h-20 flex items-center justify-center bg-[var(--autobacs-dark-bg)] p-1 mb-2">
                        <img src={getProductImage(p.id)} alt={p.name} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div
                        className={`text-[9px] uppercase tracking-wider font-bold ${
                          p.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : ''
                        }`}
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                      >
                        {p.brand}
                      </div>
                      <div
                        className="text-xs leading-tight line-clamp-2 mb-1"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                      >
                        {p.name}
                      </div>
                      <div
                        className="mt-auto text-sm text-[var(--autobacs-orange)]"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                      >
                        {(p.promoPrice ?? p.price).toFixed(2)} €
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}
