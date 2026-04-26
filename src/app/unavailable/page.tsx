'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { KioskLayout } from '@/components/KioskLayout';
import {
  products,
  getOtherStoresWithStock,
  getAvailableEquivalentsInStore,
  getProductStock,
  getProductImage,
} from '@/data/mockData';
import { useKiosk } from '@/context/KioskContext';
import { MapPin, Car, AlertCircle, ShoppingCart, ArrowLeft, Check } from 'lucide-react';

function UnavailableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { plate, vehicle, storeId } = useKiosk();

  const productId = searchParams.get('productId');
  const product = products.find((p) => p.id === productId);

  if (!product) return null;

  const stock = getProductStock(product.id, storeId);
  const isOnOrder = stock.status === 'on-order';
  const equivalents = getAvailableEquivalentsInStore(product.id, storeId);
  const otherStores = getOtherStoresWithStock(product.id, storeId);

  const handleEquivalentClick = (eqId: string) => {
    router.push(`/product/${eqId}`);
  };

  return (
    <KioskLayout screenName="Disponibilité produit">
      <div className="h-full flex flex-col px-3 sm:px-6 md:px-8 py-3 sm:py-5 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push('/results')}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-black)] transition-all uppercase tracking-wide"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <ArrowLeft size={18} />
            Résultats
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

        {/* Product header */}
        <div className="text-center mb-4">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 mb-2 ${
              isOnOrder ? 'bg-blue-600' : 'bg-[var(--status-red)]'
            }`}
          >
            <AlertCircle size={18} />
            <span
              className="text-sm uppercase tracking-wide"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              {isOnOrder ? 'Sur commande' : 'Non disponible ici'}
            </span>
          </div>
          <h1 className="text-2xl" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}>
            {product.name}
          </h1>
          <p className="text-sm text-[var(--autobacs-text-muted)]">
            {product.brand} · Réf. {product.reference} · {product.price.toFixed(2)} €
          </p>
        </div>

        {/* 3 sections */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 min-h-0 overflow-auto">
          {/* ══ Section 1 : Equivalents ══ */}
          <div className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] p-4 flex flex-col overflow-hidden">
            <h2
              className="text-sm mb-3 uppercase tracking-wide text-[var(--autobacs-orange)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              Équivalents disponibles ici
            </h2>
            {equivalents.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-[var(--autobacs-text-muted)] text-center italic">
                  Aucun équivalent en stock dans ce centre
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-auto">
                {equivalents.map((eq) => {
                  const eqStock = getProductStock(eq.id, storeId);
                  return (
                    <button
                      key={eq.id}
                      onClick={() => handleEquivalentClick(eq.id)}
                      className="w-full text-left bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-3 transition-all flex gap-3"
                    >
                      <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
                        <img src={getProductImage(eq.id)} alt={eq.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            eq.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-black)]'
                          }`}
                        >
                          {eq.brand}
                        </div>
                        <div
                          className="text-sm truncate"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                        >
                          {eq.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-[10px] text-[var(--status-green)]">
                            <Check size={10} />
                            <span>{eqStock.quantity} en stock</span>
                          </div>
                          <div
                            className="text-sm ml-auto text-[var(--autobacs-orange)]"
                            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                          >
                            {eq.price.toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ══ Section 2 : Other stores ══ */}
          <div className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] p-4 flex flex-col overflow-hidden">
            <h2
              className="text-sm mb-3 uppercase tracking-wide text-[var(--autobacs-orange)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              Autres centres avec stock
            </h2>
            {otherStores.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-[var(--autobacs-text-muted)] text-center italic">
                  Rupture complète réseau
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-2 overflow-auto">
                {otherStores.slice(0, 6).map((store, idx) => (
                  <div
                    key={store.id}
                    className={`bg-[var(--autobacs-dark-bg)] border p-3 flex items-start gap-2 ${
                      idx === 0 ? 'border-[var(--autobacs-orange)]' : 'border-[var(--autobacs-border)]'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                        store.quantity >= 3 ? 'bg-[var(--status-green)]' : 'bg-[var(--status-amber)]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="text-sm truncate"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                        >
                          {store.shortName}
                        </div>
                        {idx === 0 && (
                          <span
                            className="text-[9px] uppercase tracking-wider text-[var(--autobacs-orange)] font-bold flex-shrink-0"
                            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                          >
                            ★ Le plus proche
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[var(--autobacs-text-muted)] truncate">
                        {store.city} ({store.postalCode})
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-[var(--status-green)] font-bold">
                          {store.quantity} en stock
                        </span>
                        <span
                          className="text-[10px] text-[var(--autobacs-orange)] font-bold"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                        >
                          {store.distanceKm} km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══ Section 3 : Commander ══ */}
          <div className="bg-[var(--autobacs-card-bg)] border-2 border-[var(--autobacs-orange)] p-4 flex flex-col">
            <h2
              className="text-sm mb-3 uppercase tracking-wide text-[var(--autobacs-orange)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              Commander en ligne
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart size={48} className="text-[var(--autobacs-orange)] mb-3" />
              <h3
                className="text-xl mb-2"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
              >
                Commandez en ligne
              </h3>
              <p className="text-xs text-[var(--autobacs-text-muted)] mb-4 leading-relaxed">
                Depuis votre téléphone, ou directement auprès de nos vendeurs à l’accueil du magasin.
              </p>
              <div className="text-3xl text-[var(--autobacs-orange)] mb-4" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}>
                {product.price.toFixed(2)} €
              </div>
              <button
                className="w-full px-4 py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: '1rem', fontWeight: 700, minHeight: '60px' }}
              >
                <ShoppingCart size={20} />
                COMMANDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

export default function UnavailablePage() {
  return (
    <Suspense>
      <UnavailableContent />
    </Suspense>
  );
}
