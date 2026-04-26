'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2500;
    const interval = 16;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setFadeOut(true);
          setTimeout(onComplete, 600);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--autobacs-dark-bg)]"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {/* Logo container */}
      <div className="relative w-80 h-56 mb-10">
        {/* Grey logo (background — always visible) */}
        <img
          src="/autobacs-logo.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          style={{ filter: 'brightness(0) invert(0.3)' }}
        />
        {/* Orange logo (foreground — revealed left to right via clip-path) */}
        <img
          src="/autobacs-logo.svg"
          alt="Autobacs"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            clipPath: `inset(0 ${100 - progress}% 0 0)`,
          }}
        />
      </div>

      {/* Progress bar */}
      <div className="w-72 h-0.5 bg-[var(--autobacs-border)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--autobacs-orange)] rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Subtle text */}
      <p
        className="mt-6 text-sm text-[var(--autobacs-text-muted)] uppercase tracking-[0.3em]"
        style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
      >
        Chargement
      </p>
    </div>
  );
}
