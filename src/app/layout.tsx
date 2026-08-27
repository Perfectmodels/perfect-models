import type { Metadata, Viewport } from 'next';
import '../index.css';
import ClientShell from './ClientShell';
import JsonLd from '@/components/JsonLd';
import { absoluteRuntimeUrl, buildOrganizationJsonLd, buildWebsiteJsonLd, getSiteRuntimeConfig } from '@/lib/site-runtime';
import { getPublicAppState } from '@/lib/public-app-state';

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteRuntimeConfig();
  const title = `${config.siteName} | Agence de mannequins`;
  const canonical = config.siteUrl;
  return {
    metadataBase: new URL(config.siteUrl),
    applicationName: config.siteName,
    title: { default: title, template: `%s | ${config.siteName}` },
    description: config.description || undefined,
    keywords: config.keywords,
    authors: [{ name: config.siteName, url: config.siteUrl }],
    creator: config.siteName,
    publisher: config.siteName,
    referrer: 'origin-when-cross-origin',
    alternates: {
      canonical,
      languages: { 'fr-GA': canonical, fr: canonical, 'x-default': canonical },
      types: { 'application/rss+xml': absoluteRuntimeUrl(config, '/rss.xml') },
    },
    manifest: '/manifest.webmanifest',
    icons: { icon: config.logo, apple: '/icons/icon-192.webp' },
    formatDetection: { email: false, address: false, telephone: false },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: {
      type: 'website', locale: config.locale, url: config.siteUrl, siteName: config.siteName, title,
      description: config.description || undefined,
      images: config.defaultImage ? [{ url: absoluteRuntimeUrl(config, config.defaultImage) }] : undefined,
    },
    twitter: {
      card: 'summary_large_image', title, description: config.description || undefined,
      images: config.defaultImage ? [absoluteRuntimeUrl(config, config.defaultImage)] : undefined,
    },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    other: {
      'geo.region': config.countryCode,
      'geo.placename': config.city,
      'content-language': config.language,
      ...(config.geo ? { 'geo.position': `${config.geo.latitude};${config.geo.longitude}`, ICBM: `${config.geo.latitude}, ${config.geo.longitude}` } : {}),
    },
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0A0A0A', colorScheme: 'dark' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [config, initialData] = await Promise.all([getSiteRuntimeConfig(), getPublicAppState()]);
  return (
    <html lang={config.language}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600;1,700;1,900&family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <JsonLd data={[buildOrganizationJsonLd(config), buildWebsiteJsonLd(config)]} />
        <noscript>JavaScript est nécessaire pour les fonctions interactives de ce site.</noscript>
        <ClientShell initialData={initialData}>{children}</ClientShell>
      </body>
    </html>
  );
}
