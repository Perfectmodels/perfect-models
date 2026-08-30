import type { Metadata } from 'next';

export const SITE_URL = 'https://www.perfectmodels.online';
export const SITE_NAME = 'Perfect Models Management';
export const SITE_SHORT_NAME = 'PMM';
export const SITE_LOCALE = 'fr_GA';
export const DEFAULT_DESCRIPTION =
  'Agence de mannequins à Libreville, Gabon : booking de talents, castings, modèles photo, publicité, défilés, formation et productions de mode avec Perfect Models Management.';

export const SOCIAL_LINKS = [
  'https://www.facebook.com/perfectmodels.ga/',
  'https://www.instagram.com/perfectmodels.ga/',
  'https://www.tiktok.com/@perfectmodels.ga',
  'https://www.youtube.com/@perfectmodelsga',
  'https://whatsapp.com/channel/0029VbATGBK0wajp1ACtN82S',
];

export const DEFAULT_KEYWORDS = [
  'agence mannequin Libreville',
  'agence de mannequinat Gabon',
  'mode gabonaise',
  'culture et mode Gabon',
  'stylisme Gabon',
  'styliste gabonais',
  'haute couture Gabon',
  'créateur de mode Gabon',
  'mannequinat Gabon',
  'mannequin professionnel Gabon',
  'booking mannequin Libreville',
  'casting mannequin Gabon',
  'formation mannequin Libreville',
  'événements culturels Libreville',
  'défilé de mode Gabon',
  'Focus Model 241',
  'Perfect Models Management',
  'Perfect Fashion Day',
];

type OpenGraphType = 'website' | 'article' | 'profile';

export interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
  image?: string;
  type?: OpenGraphType;
  noIndex?: boolean;
  category?: string;
  publishedTime?: string;
  authors?: string[];
}

export function absoluteUrl(value = '/') {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

export function buildSharePreviewUrl({
  title,
  description,
  path,
  image,
  type = 'website',
  category,
}: Pick<PageMetadataInput, 'title' | 'description' | 'path' | 'image' | 'type' | 'category'>) {
  const params = new URLSearchParams({
    title,
    description,
    path,
    type,
  });
  if (category) params.set('category', category);
  if (image) params.set('image', absoluteUrl(image));
  return `${SITE_URL}/api/og-preview?${params.toString()}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  type = 'website',
  noIndex = false,
  category,
  publishedTime,
  authors,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const absoluteImage = image ? absoluteUrl(image) : undefined;
  const previewImage = buildSharePreviewUrl({ title, description, path, image, type, category });
  const socialImages = [
    {
      url: previewImage,
      width: 1200,
      height: 630,
      type: 'image/png',
      alt: `${title} — ${SITE_NAME}`,
    },
    ...(absoluteImage ? [{ url: absoluteImage, alt: title }] : []),
  ];
  const openGraph: Record<string, unknown> = {
    type,
    locale: SITE_LOCALE,
    url: canonical,
    siteName: SITE_NAME,
    title,
    description,
    images: socialImages,
  };

  if (type === 'article' && publishedTime) openGraph.publishedTime = publishedTime;
  if (type === 'article' && authors?.length) openGraph.authors = authors;

  return {
    title,
    description,
    keywords: [...DEFAULT_KEYWORDS, ...keywords],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category,
    alternates: {
      canonical,
      languages: {
        'fr-GA': canonical,
        fr: canonical,
        'x-default': canonical,
      },
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
          index: true,
          follow: true,
          nocache: false,
          googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: openGraph as Metadata['openGraph'],
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImage],
    },
    other: {
      'geo.region': 'GA-1',
      'geo.placename': 'Libreville',
      'geo.position': '0.3901;9.4544',
      'ICBM': '0.3901, 9.4544',
      'content-language': 'fr-GA',
    },
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService', 'LocalBusiness'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: [SITE_SHORT_NAME, 'Focus Model 241', 'PMM Gabon'],
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  image: `${SITE_URL}/opengraph-image`,
  email: 'contact@perfectmodels.online',
  foundingDate: '2021',
  description: DEFAULT_DESCRIPTION,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Libreville',
    addressRegion: 'Estuaire',
    addressCountry: 'GA',
  },
  areaServed: [
    { '@type': 'City', name: 'Libreville' },
    { '@type': 'Country', name: 'Gabon' },
  ],
  knowsAbout: [
    'Mannequinat professionnel',
    'Casting de mannequins',
    'Booking de mannequins professionnels',
    'Modèles photo et campagnes publicitaires',
    'Formation de mannequins',
    'Production et défilés de mode',
    'Mode et stylisme au Gabon',
  ],
  sameAs: SOCIAL_LINKS,
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: SITE_SHORT_NAME,
  inLanguage: 'fr-GA',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const MARKETING_PAGES = {
  home: {
    title: 'Agence de mannequins à Libreville, Gabon',
    description:
      'Perfect Models Management est une agence de mannequins à Libreville : booking, casting, modèles photo, publicité, défilés et talents professionnels au Gabon.',
    path: '/',
    keywords: ['agence mannequin Libreville', 'agence mannequin Gabon', 'mannequins professionnels Gabon', 'booking mannequin Libreville'],
  },
  agency: {
    title: 'Agence de mannequinat à Libreville, Gabon',
    description:
      'Découvrez Perfect Models Management, agence de mannequinat basée à Libreville : management de talents, casting, booking, formation et productions de mode au Gabon.',
    path: '/agence',
    keywords: ['agence mannequin Libreville', 'agence de mannequinat Gabon', 'management talents Gabon', 'agence mode Libreville'],
  },
  models: {
    title: 'Mannequins professionnels au Gabon — Booking à Libreville',
    description:
      'Découvrez les mannequins professionnels représentés par Perfect Models Management à Libreville : portfolios, mensurations, spécialités et demandes de booking.',
    path: '/mannequins',
    keywords: ['mannequins professionnels Gabon', 'mannequin professionnel Libreville', 'modèles photo Libreville', 'booking mannequin Gabon'],
  },
  magazine: {
    title: 'Mannequinat au Gabon — Conseils, castings & actualités',
    description:
      'Conseils pour mannequins, castings, portraits de talents, coulisses, événements et actualités du mannequinat et de la mode au Gabon avec Perfect Models Management.',
    path: '/blog',
    keywords: ['mannequinat Gabon', 'casting mannequin Gabon', 'conseils mannequin', 'actualité mode Gabon'],
  },
  services: {
    title: 'Booking, casting & mannequins à Libreville, Gabon',
    description:
      'Booking de mannequins professionnels, casting, modèles photo, publicité, défilés, shootings et prestations événementielles avec Perfect Models Management à Libreville.',
    path: '/services',
    keywords: ['booking mannequin Libreville', 'casting professionnel Libreville', 'modèle photo Gabon', 'mannequin publicité Gabon'],
  },
  fashionDay: {
    title: 'Perfect Fashion Day — Défilé de mode à Libreville',
    description:
      'Découvrez le Perfect Fashion Day à Libreville : créateurs, stylistes, mannequins, défilés et temps forts culturels organisés par Perfect Models Management au Gabon.',
    path: '/fashion-day',
    keywords: ['Perfect Fashion Day', 'défilé de mode Libreville', 'événement mode Gabon', 'créateurs Gabon'],
  },
  casting: {
    title: 'Casting mannequin au Gabon — Candidatures à Libreville',
    description:
      'Candidatez aux castings Perfect Models Management à Libreville. Découvrez les critères, le processus de sélection et les démarches pour devenir mannequin au Gabon.',
    path: '/casting',
    keywords: ['casting mannequin Libreville', 'casting mannequin Gabon', 'devenir mannequin Gabon', 'agence casting Libreville'],
  },
  gallery: {
    title: 'Photos de mannequins & défilés au Gabon',
    description:
      'Explorez les shootings, portraits de mannequins, défilés et productions de Perfect Models Management à Libreville et au Gabon.',
    path: '/galerie',
    keywords: ['photos mannequins Gabon', 'shooting mode Libreville', 'photos défilé Libreville', 'portfolio mannequin Gabon'],
  },
  contact: {
    title: 'Booking mannequin à Libreville — Contact Perfect Models',
    description:
      'Contactez Perfect Models Management à Libreville pour un booking mannequin, un casting, un shooting, une campagne publicitaire, un défilé ou un partenariat au Gabon.',
    path: '/contact',
    keywords: ['booking mannequin Libreville', 'contact agence mannequin Gabon', 'casting Libreville', 'agence mannequin Gabon'],
  },
} as const;
