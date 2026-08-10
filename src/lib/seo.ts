import type { Metadata } from 'next';

export const SITE_URL = 'https://www.perfectmodels.online';
export const SITE_NAME = 'Perfect Models Management';
export const SITE_SHORT_NAME = 'PMM';
export const SITE_LOCALE = 'fr_GA';
export const DEFAULT_DESCRIPTION =
  'Agence de mannequins à Libreville, Gabon : booking, casting, formation, production mode, événements et accompagnement de talents avec Perfect Models Management.';

export const SOCIAL_LINKS = [
  'https://www.facebook.com/PerfectModels241',
  'https://www.instagram.com/perfectmodelsmanagement_/',
  'https://www.youtube.com/@perfectmodelsmanagement6013',
];

export const DEFAULT_KEYWORDS = [
  'agence mannequin Libreville',
  'agence mannequin Gabon',
  'mannequin professionnel Gabon',
  'booking mannequin Libreville',
  'casting mannequin Gabon',
  'formation mannequin Libreville',
  'mode gabonaise',
  'défilé de mode Gabon',
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
      'content-language': 'fr-GA',
    },
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: SITE_SHORT_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  image: `${SITE_URL}/opengraph-image`,
  email: 'contact@perfectmodels.online',
  foundingDate: '2021',
  description: DEFAULT_DESCRIPTION,
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
    'Mannequinat',
    'Casting',
    'Booking de mannequins',
    'Formation de mannequins',
    'Production de mode',
    'Défilés de mode',
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
      'Perfect Models Management, agence de mannequins à Libreville : découvrez nos talents, castings, bookings, formations, productions mode et événements au Gabon.',
    path: '/',
    keywords: ['agence de mannequins Libreville', 'talents mode Gabon', 'booking mannequin Gabon'],
  },
  agency: {
    title: 'Agence de mannequins au Gabon : notre vision',
    description:
      'Découvrez Perfect Models Management à Libreville, notre vision du mannequinat, notre accompagnement des talents et notre contribution à la mode gabonaise.',
    path: '/agence',
    keywords: ['agence mode Gabon', 'management mannequins Libreville', 'talents gabonais'],
  },
  models: {
    title: 'Mannequins professionnels à Libreville et au Gabon',
    description:
      'Découvrez le roster de mannequins Perfect Models Management : profils professionnels disponibles pour défilés, shootings, campagnes, publicités et événements.',
    path: '/mannequins',
    keywords: ['mannequins professionnels Gabon', 'modèles photo Libreville', 'mannequin défilé Gabon'],
  },
  magazine: {
    title: 'Magazine mode Gabon : actualités, talents et tendances',
    description:
      'Le magazine Perfect Models Management suit la mode gabonaise : portraits de talents, événements, tendances, créateurs, coulisses et conseils mannequinat.',
    path: '/magazine',
    keywords: ['magazine mode Gabon', 'actualité mode gabonaise', 'créateurs gabonais'],
  },
  services: {
    title: 'Booking, casting et services mannequins au Gabon',
    description:
      'Booking de mannequins, casting, défilés, shooting photo, publicité, figurants, formation et conseil image : les services PMM à Libreville et au Gabon.',
    path: '/services',
    keywords: ['booking mannequin Gabon', 'casting professionnel Libreville', 'agence événementielle mode Gabon'],
  },
  fashionDay: {
    title: 'Perfect Fashion Day : défilé et événement mode au Gabon',
    description:
      'Découvrez les éditions Perfect Fashion Day : créateurs, mannequins, artistes, partenaires, galeries et temps forts de l’événement mode de Perfect Models Management.',
    path: '/fashion-day',
    keywords: ['Perfect Fashion Day', 'défilé mode Libreville', 'événement mode Gabon'],
  },
  casting: {
    title: 'Casting mannequins au Gabon : rejoindre PMM',
    description:
      'Consultez les castings de Perfect Models Management à Libreville et les conditions pour rejoindre une agence de mannequins professionnelle au Gabon.',
    path: '/casting',
    keywords: ['casting mannequin Libreville', 'devenir mannequin Gabon', 'casting PMM'],
  },
  gallery: {
    title: 'Galerie mode : défilés, shootings et campagnes au Gabon',
    description:
      'Explorez les défilés, shootings, campagnes, backstages et collaborations de Perfect Models Management à Libreville et au Gabon.',
    path: '/galerie',
    keywords: ['shooting mode Gabon', 'photo mannequin Libreville', 'défilés Gabon'],
  },
  contact: {
    title: 'Contact et booking mannequins à Libreville',
    description:
      'Contactez Perfect Models Management pour un booking mannequin, un casting, une collaboration, un partenariat, une production ou une demande presse au Gabon.',
    path: '/contact',
    keywords: ['contact agence mannequin Gabon', 'réserver mannequin Libreville', 'booking PMM'],
  },
} as const;
