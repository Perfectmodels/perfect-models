import type { Metadata, Viewport } from 'next';
import '../index.css';
import ClientShell from './ClientShell';
import JsonLd from '@/components/JsonLd';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from '@/lib/seo';
import { Analytics } from '@vercel/analytics/next';

const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Agence de mannequins à Libreville, Gabon | Perfect Models Management',
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'Mode, mannequinat et événementiel',
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fr-GA': SITE_URL,
      fr: SITE_URL,
      'x-default': SITE_URL,
    },
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.svg',
    apple: '/icons/icon-192.webp',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_GA',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Agence de mannequins à Libreville, Gabon | Perfect Models Management',
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Perfect Models Management | Agence de mannequins au Gabon',
    description: DEFAULT_DESCRIPTION,
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  other: {
    'geo.region': 'GA-1',
    'geo.placename': 'Libreville',
    'content-language': 'fr-GA',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-GA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600;1,700;1,900&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        <noscript>JavaScript est nécessaire pour utiliser le site Perfect Models Management.</noscript>
        <ClientShell>{children}</ClientShell>
        <Analytics />
      </body>
    </html>
  );
}
