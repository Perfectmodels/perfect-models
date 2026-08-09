import type { Metadata, Viewport } from 'next';
import '../index.css';
import ClientShell from './ClientShell';

export const metadata: Metadata = {
  metadataBase: new URL('https://perfectmodels.online'),
  title: {
    default: 'Perfect Models Management | Agence de Mannequins à Libreville, Gabon',
    template: '%s | Perfect Models Management',
  },
  description:
    'Perfect Models Management accompagne mannequins, marques et créateurs au Gabon : booking, casting, formation, production mode et événements.',
  keywords: [
    'agence mannequin Libreville',
    'mannequin Gabon',
    'Perfect Models Management',
    'PMM',
    'casting mannequin Gabon',
    'booking mannequin',
    'mode gabonaise',
    'Perfect Fashion Day',
  ],
  authors: [{ name: 'Perfect Models Management' }],
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.svg',
    apple: '/logopmm.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_GA',
    url: 'https://perfectmodels.online',
    siteName: 'Perfect Models Management',
    title: 'Perfect Models Management | Agence de Mannequins à Libreville, Gabon',
    description: 'Découvrez nos talents, castings, services et événements mode à Libreville.',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perfect Models Management | Libreville, Gabon',
    description: 'Agence de mannequins, booking, casting et production mode au Gabon.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600;1,700;1,900&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <noscript>JavaScript est nécessaire pour utiliser le site Perfect Models Management.</noscript>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
