'use client';

import { promoTickerItems } from '@/data/mockData';

export function PromoTicker() {
  // Duplication pour un défilement infini sans saccade
  const items = [...promoTickerItems, ...promoTickerItems];

  return (
    <div className="relative w-full bg-[var(--autobacs-orange)] text-white overflow-hidden border-b border-[var(--autobacs-orange-dark)]">
      <div className="ticker-track flex whitespace-nowrap py-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="mx-12 text-sm uppercase tracking-wider"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
          >
            {item}
          </span>
        ))}
      </div>
      <style jsx>{`
        .ticker-track {
          animation: ticker 40s linear infinite;
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
