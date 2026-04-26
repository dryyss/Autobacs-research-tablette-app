import type { Metadata, Viewport } from 'next';
import { KioskProvider } from '@/context/KioskContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Autobacs — Recherche Produit',
  description: 'Borne de recherche produit Autobacs France',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Autobacs',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <KioskProvider>
          {children}
        </KioskProvider>
      </body>
    </html>
  );
}
