'use client';

import { useEffect, useState } from 'react';

interface HeroSlide {
  desktop: string;
  mobile: string;
  alt: string;
}

// Bannières officielles du site autobacs.fr (catalogue Proximis)
const SLIDES: HeroSlide[] = [
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/c92c72e75b8e983551d4f0552b4a98c5c913281d_ip2_home_anniversaire.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/652f102c423eb8e5e42808636d170a7c83ad315a_ip2_mobile_anniversaire.jpg',
    alt: 'Anniversaire Autobacs — 25 ans en France',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/db6758e211fe7a480639faf4df870ba36a85d7cf_ip2_home_pneus.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/a1cf93f2798f2893034b5f7fc0d6d57f337376a6_ip2_mobile_pneus.jpg',
    alt: 'Promotion pneus',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/d98d5c081cae57d118df0582a7a409414c4b29c1_ip2_home_vidange.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/8415d05b002a8d2d03e11a3c580176ec2810fe58_ip2_mobile_vidange.jpg',
    alt: 'Promotion vidange atelier',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/9811497e7cf3f24130742f6f74d2643883bdf641_ip2_home_barre.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/fd8c7410f8532fd527a7d8697cce26feb4c35ae1_ip2_mobile_barre.jpg',
    alt: 'Promotion barres de toit',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/9a357b47def1c237e59d5444b5da49e10a24884d_ip2_home_beg.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/bd3709297e9231970f18035502ea5e9751f57551_ip2_mobile_beg.jpg',
    alt: 'Promotion balais essuie-glace',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/31a3dc57c3421f0feba5c160a7dd0653634532ff_ip2_home_jmf.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/13cd4813553409964cba99f80474b037b4b043b5_ip2_mobile_jmf.jpg',
    alt: 'Japan Motor Festival by Autobacs',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/4e3a1ccf4c0b9df24e3b030d3e88b30612ecabc9_ip2_home_tapis.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/376cf90a7fd4cd770c5c54bfb2f1980fe4f20749_ip2_mobile_tapis.jpg',
    alt: 'Promotion tapis aluminium',
  },
  {
    desktop: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/2560/425/088c416acd1cb52f6de4e9165688c960743eddc2_ip2_home_meguiars.jpg',
    mobile: 'https://autobacs-autobacs-fr-storage.omn.proximis.com/Imagestorage/imagesSynchro/768/589/0511591672cc2d8fb2d1d3893942952dec5888cd_ip2_mobile_meguiars.jpg',
    alt: 'Promotion produits Meguiar\'s',
  },
];

interface HeroCarouselProps {
  intervalMs?: number;
  heightClass?: string; // ex. 'h-32 md:h-40 lg:h-48'
}

export default function HeroCarousel({ intervalMs = 5000, heightClass }: HeroCarouselProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs]);

  // Par défaut : aspect ratio 6/1 (proportion réelle des bannières desktop 2560×425)
  // → la bannière est affichée en entier, sans recadrage, peu importe la largeur.
  const sizing = heightClass || 'aspect-[6/1] max-h-[180px] mb-4';

  return (
    <div
      className={`relative w-full overflow-hidden bg-[var(--autobacs-dark-bg)] flex-shrink-0 ${sizing}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <picture
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        >
          <source media="(min-width: 768px)" srcSet={slide.desktop} />
          <img
            src={slide.mobile}
            alt={slide.alt}
            className="w-full h-full object-contain"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </picture>
      ))}

      {/* Dots — bas centré */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
            }`}
            aria-label={`Diapositive ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
