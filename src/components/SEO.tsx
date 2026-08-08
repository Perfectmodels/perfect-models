import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'event';
  noIndex?: boolean;
  canonicalUrl?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = 'Perfect Models Management';
const RAW_BASE_URL = import.meta.env.VITE_SITE_URL?.trim() || 'https://perfectmodels.online';
const BASE_URL = RAW_BASE_URL.replace(/\/$/, '');
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION =
  "Agence de mannequins à Libreville, Gabon. Découvrez les talents de Perfect Models Management, nos castings, nos événements mode et nos services professionnels.";
const DEFAULT_KEYWORDS =
  'agence mannequin Libreville, mannequin Gabon, Perfect Models Management, PMM, casting mannequin Gabon, booking mannequin, mode gabonaise, Perfect Fashion Day';

const toAbsoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  return `${BASE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  canonicalUrl,
  schema,
}) => {
  const { pathname } = useLocation();

  const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
  const canonical = canonicalUrl ? toAbsoluteUrl(canonicalUrl) : `${BASE_URL}${normalizedPath}`;
  const absoluteImage = toAbsoluteUrl(image);
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Agence de Mannequins à Libreville, Gabon`;

  React.useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('author', SITE_NAME);
    setMeta('language', 'fr');

    const verificationToken = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
    if (verificationToken) setMeta('google-site-verification', verificationToken);

    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', absoluteImage, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:type', type === 'profile' ? 'profile' : type === 'article' ? 'article' : 'website', 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setMeta('og:locale', 'fr_GA', 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', absoluteImage);

    setLink('canonical', canonical);

    const businessPhone = import.meta.env.VITE_BUSINESS_PHONE?.trim();
    const businessEmail = import.meta.env.VITE_BUSINESS_EMAIL?.trim() || 'contact@perfectmodels.online';

    const defaultSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: 'PMM',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      image: absoluteImage,
      email: businessEmail,
      foundingDate: '2021',
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
      sameAs: [
        'https://www.facebook.com/PerfectModels241',
        'https://www.instagram.com/perfectmodelsmanagement_/',
        'https://www.youtube.com/@perfectmodelsmanagement6013',
      ],
      ...(businessPhone ? { telephone: businessPhone } : {}),
    };

    const schemaId = 'page-structured-data';
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema || defaultSchema);

    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, [absoluteImage, canonical, description, fullTitle, keywords, noIndex, schema, type]);

  return null;
};

export default SEO;
