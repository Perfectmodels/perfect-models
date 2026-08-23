import type { Metadata } from 'next';

export const SITE_URL = 'https://www.perfectmodels.online';
export const SITE_NAME = 'Perfect Models Management';
export const SITE_SHORT_NAME = 'PMM';
export const SITE_LOCALE = 'fr_GA';
export const DEFAULT_DESCRIPTION =
  'Agence de mannequins, référence de la mode, du stylisme, du mannequinat et de la culture à Libreville, Gabon : booking, casting, formation, créateurs, défilés et événements avec Perfect Models Management.';

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
  const openGraph: Record<string, unknown> = {
    type,
    locale: SITE_LOCALE,
    url: canonical,
    siteName: SITE_NAME,
    title,
    description,
  };

  if (absoluteImage) {
    openGraph.images = [{ url: absoluteImage, alt: `${title} — ${SITE_NAME}` }];
  }
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
      ...(absoluteImage ? { images: [absoluteImage] } : {}),
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
  telephone: '+24100000000',
  foundingDate: '2021',
  description: DEFAULT_DESCRIPTION,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Libreville',
    addressLocality: 'Libreville',
    addressRegion: 'Estuaire',
    addressCountry: 'GA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 0.3901,
    longitude: 9.4544,
  },
  areaServed: [
    { '@type': 'City', name: 'Libreville' },
    { '@type': 'Country', name: 'Gabon' },
  ],
  knowsAbout: [
    'Mode et Stylisme',
    'Mannequinat et Castings',
    'Culture Gabonaise et Événements',
    'Haute Couture et Créateurs de Mode',
    'Booking de mannequins professionnels',
    'Formation de mannequins',
    'Production et Défilés de mode',
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
      urlTemplate: `${SITE_URL}/magazine?search={search_term_string}`,
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
    title: 'Mode, Stylisme, Mannequinat & Culture à Libreville, Gabon',
    description:
      'Perfect Models Management, agence leader de mannequins, stylisme et culture à Libreville, Gabon : découvrez nos talents, castings, défilés, formations et créateurs de mode.',
    path: '/',
    keywords: ['mode Gabon', 'stylisme Libreville', 'mannequinat Gabon', 'culture gabonaise', 'agence mannequin Libreville'],
  },
  agency: {
    title: 'Maison de la Mode, du Stylisme et de la Culture au Gabon',
    description:
      'Découvrez Perfect Models Management à Libreville : notre vision du mannequinat, du stylisme, de la culture gabonaise et notre promotion des créateurs locaux.',
    path: '/agence',
    keywords: ['mode et culture Gabon', 'stylisme Libreville', 'créateurs de mode Gabon', 'agence mannequinat Libreville'],
  },
  models: {
    title: 'Mannequins professionnels, Stylisme & Portfolios au Gabon',
    description:
      'Découvrez le book des mannequins professionnels de Perfect Models Management à Libreville : profils pour défilés de mode, shootings, stylisme, publicités et campagnes.',
    path: '/mannequins',
    keywords: ['mannequins professionnels Gabon', 'modèles photo Libreville', 'défilé de mode Gabon', 'stylisme photo'],
  },
  magazine: {
    title: 'Focus Model 241 — Magazine de la Mode, du Stylisme et de la Culture au Gabon',
    description:
      'Toute l’actualité de la mode gabonaise, du stylisme, de la culture et du mannequinat : portraits de talents, créateurs, événements, coulisses et tendances à Libreville.',
    path: '/magazine',
    keywords: ['magazine mode Gabon', 'culture et stylisme Gabon', 'actualité mode gabonaise', 'créateurs gabonais'],
  },
  services: {
    title: 'Services Mode, Booking, Casting & Stylisme à Libreville, Gabon',
    description:
      'Booking de mannequins, organisation de défilés, casting professionnel, direction artistique, conseils stylisme et formation mannequins avec PMM au Gabon.',
    path: '/services',
    keywords: ['booking mannequin Gabon', 'casting professionnel Libreville', 'stylisme et défilé Gabon'],
  },
  fashionDay: {
    title: 'Perfect Fashion Day : Le Grand Événement de la Mode et de la Culture au Gabon',
    description:
      'Découvrez le Perfect Fashion Day à Libreville : défilés de mode, créateurs, stylistes, mannequins et temps forts culturels organisés par Perfect Models Management.',
    path: '/fashion-day',
    keywords: ['Perfect Fashion Day', 'défilé de mode Libreville', 'événement culturel et mode Gabon'],
  },
  casting: {
    title: 'Casting Mannequins & Talents de la Mode au Gabon — Rejoindre PMM',
    description:
      'Participez aux castings mannequins de Perfect Models Management à Libreville et devenez un visage de la mode, du stylisme et de la culture gabonaise.',
    path: '/casting',
    keywords: ['casting mannequin Libreville', 'devenir mannequin Gabon', 'rejoindre agence mode Gabon'],
  },
  gallery: {
    title: 'Galerie Photos : Défilés de Mode, Stylisme & Shootings au Gabon',
    description:
      'Explorez la galerie photo exclusive de Perfect Models Management : défilés de haute couture, shootings mode, créateurs et événements culturels au Gabon.',
    path: '/galerie',
    keywords: ['shooting mode Gabon', 'photos défilé Libreville', 'galerie mannequins Gabon'],
  },
  contact: {
    title: 'Contact & Booking Agence de Mode et Mannequinat à Libreville',
    description:
      'Contactez Perfect Models Management à Libreville pour tout booking mannequin, partenariat créateur, projet stylisme ou production événementielle au Gabon.',
    path: '/contact',
    keywords: ['contact agence mode Gabon', 'booking mannequin Libreville', 'agence stylisme Gabon'],
  },
} as const;
