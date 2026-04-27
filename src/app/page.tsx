'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KioskLayout } from '@/components/KioskLayout';
import SplashScreen from '@/components/SplashScreen';
import { VehicleIdentification } from '@/components/VehicleIdentification';
import { categories, promoCards, stores, products, getCategoryImage, getProductImage } from '@/data/mockData';
import { useKiosk } from '@/context/KioskContext';
import { Delete, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SivVehicle } from '@/lib/siv';

const LETTERS_LAYOUT = [
  ['A', 'B', 'C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V', 'W', 'X'],
  ['Y', 'Z'],
];

const NUMBERS_LAYOUT = [
  ['0', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9'],
];

// Taille fluide des touches du clavier — s'adapte à la hauteur ET la largeur
// Min 32px (très petit écran), max 60px (desktop large), idéal ~5.5 % de la
// hauteur viewport (cap par 7 % de la largeur pour ne pas exploser en paysage).
const KEY_STYLE: React.CSSProperties = {
  width: 'clamp(32px, min(5.5vh, 7vw), 60px)',
  height: 'clamp(32px, min(5.5vh, 7vw), 60px)',
  fontFamily: 'Barlow Condensed, sans-serif',
};

const ACTION_STYLE: React.CSSProperties = {
  height: 'clamp(38px, 6vh, 60px)',
  fontFamily: 'Barlow Condensed, sans-serif',
};

export default function HomePage() {
  const router = useRouter();
  const {
    plate: globalPlate,
    vehicle: globalVehicle,
    recentlyViewed,
    setPlate: setGlobalPlate,
    setVehicle,
    setSelectedCategory,
    setSelectedSubcriteria,
    storeId,
  } = useKiosk();

  const recentProducts = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);
  const currentStoreName = stores.find((s) => s.id === storeId)?.shortName || 'Autobacs';
  const [showLoading, setShowLoading] = useState(true);
  // Pré-rempli avec la plaque déjà identifiée (sans les tirets)
  const [plate, setPlate] = useState(() => globalPlate.replace(/-/g, ''));
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [searchPlate, setSearchPlate] = useState('');
  const PROMOS_VISIBLE = 3; // nombre de promos visibles simultanément dans le rail latéral
  const [promoPage, setPromoPage] = useState(0);
  const [promoPaused, setPromoPaused] = useState(false);

  // Rotation : avance d'1 promo toutes les 3,5 s (défilement fluide à travers les 9)
  useEffect(() => {
    if (promoPaused || promoCards.length <= PROMOS_VISIBLE) return;
    const t = setInterval(
      () => setPromoPage((p) => (p + 1) % promoCards.length),
      3500
    );
    return () => clearInterval(t);
  }, [promoPaused]);

  // Fenêtre glissante : 3 promos à partir de promoPage avec wrap
  const visiblePromos = Array.from({ length: PROMOS_VISIBLE }, (_, i) =>
    promoCards[(promoPage + i) % promoCards.length]
  );

  // On ne reset plus automatiquement à l'arrivée sur l'accueil : le client peut
  // revenir ici pour chercher d'autres pièces sans perdre son véhicule.
  // Les seuls points de reset sont "Terminé" et l'IdleScreen (cf. KioskLayout).
  // En revanche, on nettoie les sélections de navigation (catégorie / sous-critère)
  // pour repartir d'un état propre sur l'accueil.
  useEffect(() => {
    setSelectedCategory(null);
    setSelectedSubcriteria(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadingComplete = useCallback(() => setShowLoading(false), []);

  const formatPlate = (input: string) => {
    const cleaned = input.replace(/[^A-Z0-9]/g, '');
    const parts = [];
    if (cleaned.length > 0) parts.push(cleaned.slice(0, 2));
    if (cleaned.length > 2) parts.push(cleaned.slice(2, 5));
    if (cleaned.length > 5) parts.push(cleaned.slice(5, 7));
    return parts.join('-');
  };

  const handleKeyPress = (key: string) => {
    if (plate.length < 7) setPlate(plate + key);
  };

  const handleDelete = () => setPlate(plate.slice(0, -1));

  const handleSearch = () => {
    if (plate.length >= 6) {
      const formatted = formatPlate(plate);
      setSearchPlate(formatted);
      setIsIdentifying(true);
    }
  };

  // useCallback : références stables, sinon le carousel promo qui re-render toutes
  // les 3,5 s recrée ces fonctions → la modale d'identification se relance en boucle
  // et bloque les clics.
  const handleIdentificationSuccess = useCallback((v: SivVehicle) => {
    setGlobalPlate(v.plate);
    setVehicle({
      plate: v.plate,
      model: v.model,
      brand: v.brand,
      fuelType: v.fuelType,
      year: v.year,
      version: v.version,
      power: v.power,
      engine: v.engine,
      logoUrl: v.logoUrl,
      kType: v.kType,
      vin: v.vin,
    });
    setIsIdentifying(false);
    router.push('/vehicle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIdentificationFailure = useCallback(() => {
    setIsIdentifying(false);
    router.push('/categories');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIdentificationCancel = useCallback(() => {
    setIsIdentifying(false);
  }, []);

  const handlePromoClick = (promo: { categoryId: string; productId?: string }) => {
    setSelectedCategory(promo.categoryId);
    if (promo.productId) {
      router.push(`/product/${promo.productId}`);
    } else {
      router.push('/subcriteria');
    }
  };

  const handleQuickCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    router.push('/subcriteria');
  };

  if (showLoading) return <SplashScreen onDone={handleLoadingComplete} centre={currentStoreName} />;

  const identificationModal = isIdentifying ? (
    <VehicleIdentification
      plate={searchPlate}
      onSuccess={handleIdentificationSuccess}
      onFailure={handleIdentificationFailure}
      onCancel={handleIdentificationCancel}
    />
  ) : null;

  // Toutes les catégories accessibles directement
  const quickCategories = categories;

  const currentPromo = promoCards[promoPage % promoCards.length];

  return (
    <KioskLayout>
      <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-6 px-4 lg:px-10 py-2 lg:py-6 items-center">
        {/* ══════════ LEFT : Plate keyboard — fallback scroll si vraiment trop court ══════════ */}
        <div className="flex flex-col items-center justify-center min-h-0 overflow-y-auto max-h-full w-full">
          {/* Headline */}
          <div className="text-center mb-2 md:mb-3 lg:mb-6">
            <h1
              className="text-xl md:text-3xl lg:text-5xl mb-0.5 md:mb-1 lg:mb-2 tracking-tight"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
            >
              TROUVEZ VOS{' '}
              <span className="text-[var(--autobacs-orange)]">PIÈCES</span>
            </h1>
            <p className="text-xs md:text-sm lg:text-base text-[var(--autobacs-text-muted)]">
              {globalVehicle
                ? 'Poursuivez votre recherche ou changez de véhicule'
                : 'Entrez votre plaque pour identifier votre véhicule'}
            </p>
          </div>

          {/* Véhicule déjà identifié — bandeau récap */}
          {globalVehicle && (
            <div className="mb-3 w-full max-w-[400px] flex items-center gap-3 px-4 py-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-orange)]">
              <div className="flex-1 min-w-0">
                <div
                  className="text-[10px] uppercase tracking-wider text-[var(--autobacs-orange)] font-bold"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  Véhicule identifié
                </div>
                <div
                  className="text-sm truncate"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  {globalVehicle.brand} {globalVehicle.model}
                  {globalVehicle.year ? ` · ${globalVehicle.year}` : ''}
                  {' · '}
                  <span className="tracking-wider">{globalVehicle.plate}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setGlobalPlate('');
                  setVehicle(null);
                  setPlate('');
                }}
                className="flex-shrink-0 text-xs uppercase tracking-wider text-[var(--autobacs-text-muted)] hover:text-[var(--autobacs-orange)] transition-all"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
              >
                Changer
              </button>
            </div>
          )}

          {/* License Plate Input — style plaque FR */}
          <div
            className="mb-3 lg:mb-4 flex items-stretch overflow-hidden shadow-xl w-full max-w-[400px]"
            style={{ height: 70, borderRadius: 6, border: '3px solid #1A1A1A' }}
          >
            {/* Bande bleue gauche — EU */}
            <div
              className="flex flex-col items-center justify-center"
              style={{ width: 40, backgroundColor: '#003399' }}
            >
              <div className="flex flex-wrap justify-center gap-[2px] mb-1" style={{ width: 20 }}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="rounded-full" style={{ width: 3, height: 3, backgroundColor: '#FFCC00' }} />
                ))}
              </div>
              <span className="text-white text-[11px] font-bold leading-none">F</span>
            </div>

            {/* Zone plaque blanche */}
            <div
              className="flex-1 flex items-center justify-between px-3"
              style={{ backgroundColor: '#F2F2F2' }}
            >
              <span
                className="flex-1 text-black text-center"
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 900,
                  fontSize: plate.length > 0 ? 42 : 28,
                  letterSpacing: plate.length > 0 ? '0.15em' : '0.08em',
                  opacity: plate.length > 0 ? 1 : 0.3,
                }}
              >
                {formatPlate(plate) || 'AB - 123 - CD'}
              </span>
              {plate.length > 0 && (
                <button
                  onClick={() => setPlate('')}
                  style={{
                    flexShrink: 0,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <line x1="1" y1="1" x2="11" y2="11" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="11" y1="1" x2="1" y2="11" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Bande bleue droite — département */}
            <div
              className="flex flex-col items-center justify-center"
              style={{ width: 40, backgroundColor: '#003399' }}
            >
              <span className="text-white text-[9px] font-bold leading-none mb-0.5">IDF</span>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <rect width="5.3" height="12" fill="#003399" />
                <rect x="5.3" width="5.3" height="12" fill="white" />
                <rect x="10.6" width="5.3" height="12" fill="#EF4444" />
              </svg>
            </div>
          </div>

          {/* Keyboard — Lettres */}
          <div className="flex flex-col gap-1 md:gap-2">
            {LETTERS_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 md:gap-2 justify-center">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] active:bg-[var(--autobacs-orange-dark)] transition-all text-base md:text-lg lg:text-xl font-bold flex items-center justify-center flex-shrink-0"
                    style={KEY_STYLE}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}

            {/* Séparateur */}
            <div className="w-full h-px bg-[var(--autobacs-border)] my-1" />

            {/* Chiffres */}
            {NUMBERS_LAYOUT.map((row, rowIndex) => (
              <div key={`num-${rowIndex}`} className="flex gap-1 md:gap-2 justify-center">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange)] active:bg-[var(--autobacs-orange-dark)] transition-all text-base md:text-lg lg:text-xl font-bold flex items-center justify-center flex-shrink-0"
                    style={KEY_STYLE}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}

            {/* Search + Delete */}
            <div className="flex gap-2 md:gap-3 justify-center mt-1">
              <button
                onClick={handleSearch}
                disabled={plate.length < 6}
                className="flex-1 max-w-[280px] bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] disabled:bg-[var(--autobacs-border)] disabled:text-[var(--autobacs-text-muted)] transition-all text-base md:text-lg lg:text-xl font-bold flex items-center justify-center gap-2 md:gap-3"
                style={ACTION_STYLE}
              >
                <Search size={20} />
                RECHERCHER
              </button>
              <button
                onClick={handleDelete}
                className="w-[54px] md:w-[64px] lg:w-[80px] transition-all flex items-center justify-center text-white border border-[var(--autobacs-orange-dark)]"
                style={{
                  ...ACTION_STYLE,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--autobacs-orange-dark) 0%, #8A3A14 100%)',
                }}
              >
                <Delete size={20} />
              </button>
            </div>
          </div>

        </div>

        {/* ══════════ RIGHT : Promos + Quick categories (grand écran seulement) ══════════ */}
        <div className="hidden lg:flex flex-col gap-4 justify-center min-h-0 max-h-full overflow-y-auto">
          {/* Promo carousel */}
          <div
            onMouseEnter={() => setPromoPaused(true)}
            onMouseLeave={() => setPromoPaused(false)}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[var(--autobacs-text-muted)] uppercase tracking-wider">
                Promotions du moment
              </p>
              {promoCards.length > PROMOS_VISIBLE && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPromoPage((p) => (p - 1 + promoCards.length) % promoCards.length)}
                    className="w-7 h-7 flex items-center justify-center bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all"
                    aria-label="Promo précédente"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex gap-1.5">
                    {promoCards.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPromoPage(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === promoPage ? 'w-5 bg-[var(--autobacs-orange)]' : 'w-1.5 bg-[var(--autobacs-border)]'
                        }`}
                        aria-label={`Promo ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setPromoPage((p) => (p + 1) % promoCards.length)}
                    className="w-7 h-7 flex items-center justify-center bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all"
                    aria-label="Promo suivante"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
            <div key={promoPage} className="space-y-3 page-enter">
              {visiblePromos.map((promo) => (
                <button
                  key={promo.id}
                  onClick={() => handlePromoClick(promo)}
                  className="w-full flex items-center gap-4 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-3 transition-all text-left"
                >
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-[var(--autobacs-dark-bg)] flex items-center justify-center p-2">
                    <img src={getCategoryImage(promo.categoryId)} alt={promo.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[var(--autobacs-orange)] uppercase tracking-wider font-bold">
                      {promo.category}
                    </div>
                    <div
                      className="text-base truncate"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                    >
                      {promo.title}
                    </div>
                    <div
                      className="text-xl text-[var(--autobacs-orange)]"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                    >
                      {promo.price}
                    </div>
                  </div>
                  <div
                    className="px-3 py-1 bg-[var(--autobacs-orange)] text-white text-sm font-bold"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                  >
                    {promo.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Vus récemment — visible uniquement si historique non vide */}
          {recentProducts.length > 0 && (
            <div>
              <p className="text-xs text-[var(--autobacs-text-muted)] uppercase tracking-wider mb-2">
                Vus récemment
              </p>
              <div className="grid grid-cols-2 gap-2">
                {recentProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/product/${p.id}`)}
                    className="flex items-center gap-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-2 transition-all text-left group"
                    style={{ minHeight: '52px' }}
                  >
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-[var(--autobacs-border)] bg-[var(--autobacs-dark-bg)] p-0.5">
                      <img src={getProductImage(p.id)} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[9px] uppercase tracking-wider font-bold ${
                          p.brand === 'AUTOBACS' ? 'text-[var(--autobacs-orange)]' : ''
                        }`}
                        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                      >
                        {p.brand}
                      </div>
                      <div
                        className="text-xs truncate"
                        style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                      >
                        {p.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick category shortcuts — toutes les catégories */}
          <div>
            <p className="text-xs text-[var(--autobacs-text-muted)] uppercase tracking-wider mb-2">
              Accès direct par catégorie
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleQuickCategory(cat.id)}
                  className="flex items-center gap-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-2 transition-all text-left group"
                  style={{ minHeight: '52px' }}
                >
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-[var(--autobacs-border)] bg-[var(--autobacs-dark-bg)] group-hover:border-[var(--autobacs-orange)] group-hover:bg-[var(--autobacs-orange)]/10 transition-all p-1.5">
                    <img
                      src={getCategoryImage(cat.id)}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span
                    className="text-xs uppercase tracking-wide leading-tight"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                  >
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM : Bandeau promo (visible quand le bloc latéral est masqué) ══════════ */}
      <div
        className="lg:hidden flex-shrink-0 border-t border-[var(--autobacs-border)] px-4 py-3 bg-[var(--autobacs-card-bg)]"
        onMouseEnter={() => setPromoPaused(true)}
        onMouseLeave={() => setPromoPaused(false)}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-[var(--autobacs-text-muted)] uppercase tracking-wider">
            Promotions du moment
          </p>
          <div className="flex gap-1.5">
            {promoCards.map((_, i) => (
              <button
                key={i}
                onClick={() => setPromoPage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === promoPage % promoCards.length ? 'w-5 bg-[var(--autobacs-orange)]' : 'w-1.5 bg-[var(--autobacs-border)]'
                }`}
                aria-label={`Promo ${i + 1}`}
              />
            ))}
          </div>
        </div>
        {currentPromo && (
          <button
            key={currentPromo.id}
            onClick={() => handlePromoClick(currentPromo)}
            className="w-full flex items-center gap-3 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] p-2 transition-all text-left page-enter"
          >
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[var(--autobacs-dark-bg)] p-1.5">
              <img src={getCategoryImage(currentPromo.categoryId)} alt={currentPromo.title} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-[var(--autobacs-orange)] uppercase tracking-wider font-bold">
                {currentPromo.category}
              </div>
              <div
                className="text-sm truncate"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
              >
                {currentPromo.title}
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <span
                className="text-lg text-[var(--autobacs-orange)]"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
              >
                {currentPromo.price}
              </span>
              <span
                className="px-2 py-0.5 bg-[var(--autobacs-orange)] text-white text-[10px] font-bold"
                style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
              >
                {currentPromo.badge}
              </span>
            </div>
          </button>
        )}
      </div>
      </div>
      {identificationModal}
    </KioskLayout>
  );
}
