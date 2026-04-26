'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useKiosk } from '@/context/KioskContext';
import { stores } from '@/data/mockData';
import { MapPin, ChevronDown, Search } from 'lucide-react';
import { PromoTicker } from './PromoTicker';
import { ArticleSearch } from './ArticleSearch';
import IdleScreen from './IdleScreen';
import CompareBar from './CompareBar';

interface KioskLayoutProps {
  children: ReactNode;
  screenName?: string;
}

export function KioskLayout({ children, screenName }: KioskLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resetAll, storeId, setStoreId } = useKiosk();
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const currentStore = stores.find((s) => s.id === storeId);

  // Paths for dot navigation
  const paths = ['/', '/plate-entry', '/categories', '/subcriteria', '/results'];
  const currentStep = (() => {
    if (pathname === '/') return 0;
    if (pathname === '/plate-entry') return 1;
    if (pathname === '/categories') return 2;
    if (pathname === '/subcriteria') return 3;
    if (pathname.startsWith('/results') || pathname.startsWith('/product') || pathname.startsWith('/unavailable')) return 4;
    return -1;
  })();

  // Live clock state
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 30_000);
    return () => clearInterval(t);
  }, []);

  const handleFinish = () => {
    resetAll();
    router.push('/');
  };

  // Timer d'inactivité géré par le composant IdleScreen (voir plus bas)

  // Wake Lock — empêcher la mise en veille de la tablette
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch { /* Wake Lock non supporté ou refusé */ }
    };

    requestWakeLock();

    // Ré-acquérir le Wake Lock si l'onglet redevient visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      wakeLock?.release();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Kiosk protections: block context menu, drag, multi-touch zoom
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('dragstart', prevent);

    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('dragstart', prevent);
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--autobacs-dark-bg)] overflow-hidden">
      {/* Promo Ticker */}
      <PromoTicker />

      {/* Header */}
      <header className="relative z-30 flex items-center gap-4 px-4 lg:px-8 py-4 border-b border-[var(--autobacs-border)]">
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/autobacs-logo.svg"
            alt="Autobacs"
            className="h-10"
          />
        </div>

        <div className="flex-1 min-w-0 flex justify-center">
          {screenName && (
            <h2
              className="text-base lg:text-lg text-[var(--autobacs-text-muted)] uppercase tracking-wide truncate text-center"
              style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
            >
              {screenName}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-2 lg:gap-4 text-sm flex-shrink-0">
          {/* Recherche directe */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            <Search size={16} className="text-[var(--autobacs-orange)]" />
            <span className="hidden md:inline text-xs uppercase tracking-wider text-[var(--autobacs-black)]">Rechercher</span>
          </button>

          {/* Sélecteur de magasin */}
          <div className="relative z-50">
            <button
              onClick={() => setStoreMenuOpen(!storeMenuOpen)}
              className="relative z-50 flex items-center gap-2 px-4 py-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] transition-all"
            >
              <MapPin size={16} className="text-[var(--autobacs-orange)]" />
              <span className="text-[var(--autobacs-black)]" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}>
                {currentStore?.shortName || 'Magasin'}
              </span>
              <ChevronDown size={14} className="text-[var(--autobacs-text-muted)]" />
            </button>

            {storeMenuOpen && (
              <>
                {/* Overlay pour fermer le menu en cliquant dehors */}
                <div className="fixed inset-0 z-40" onClick={() => setStoreMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-64 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] shadow-2xl z-50 max-h-64 overflow-auto">
                  {stores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => {
                        setStoreId(store.id);
                        setStoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[var(--autobacs-orange)]/10 transition-all border-b border-[var(--autobacs-border)] last:border-b-0 ${
                        store.id === storeId ? 'bg-[var(--autobacs-orange)]/10' : ''
                      }`}
                    >
                      <MapPin size={14} className={`flex-shrink-0 ${store.id === storeId ? 'text-[var(--autobacs-orange)]' : 'text-[var(--autobacs-text-muted)]'}`} />
                      <span className="text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: store.id === storeId ? 700 : 400 }}>
                        {store.shortName}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <span className="text-[var(--autobacs-black)] font-mono">{currentTime}</span>
          <button
            onClick={handleFinish}
            className="px-5 py-2 bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] hover:border-[var(--autobacs-orange)] hover:text-[var(--autobacs-orange)] text-[var(--autobacs-text-muted)] uppercase tracking-wide transition-all"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.85rem' }}
          >
            Terminé
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main key={pathname} className="flex-1 overflow-auto page-enter">{children}</main>

      {/* Footer - Dot Navigation */}
      <footer className="flex items-center justify-center py-4 border-t border-[var(--autobacs-border)]">
        <div className="flex gap-2">
          {paths.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep ? 'bg-[var(--autobacs-orange)] w-6' : 'bg-[var(--autobacs-border)]'
              }`}
            />
          ))}
        </div>
      </footer>

      {/* Barre flottante du comparateur */}
      <CompareBar />

      {/* Modal de recherche d'articles */}
      {searchOpen && <ArticleSearch onClose={() => setSearchOpen(false)} />}

      {/* Écran d'inactivité — s'affiche après 90s sans touche */}
      <IdleScreen
        centre={currentStore?.shortName || 'Autobacs'}
        onWake={() => {
          resetAll();
          router.push('/');
        }}
      />
    </div>
  );
}
