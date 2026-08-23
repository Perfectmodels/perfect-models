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

type RuntimeConfig = {
  siteUrl: string;
  siteName: string;
  shortName: string;
  locale: string;
  language: string;
  description: string;
  keywords: string[];
  logo: string;
  defaultImage: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  countryCode: string;
  foundingDate: string;
  socialLinks: string[];
  geo?: { latitude: number; longitude: number };
};

const SEO: React.FC<SEOProps> = ({ title, description, keywords, image, type = 'website', noIndex = false, canonicalUrl, schema }) => {
  const { pathname } = useLocation();
  const [runtime, setRuntime] = React.useState<RuntimeConfig | null>(null);

  React.useEffect(() => {
    let active = true;
    fetch('/api/site-runtime', { cache: 'no-store', credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : null)
      .then((value) => { if (active && value) setRuntime(value); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    if (!runtime) return;
    const baseUrl = runtime.siteUrl.replace(/\/$/, '');
    const toAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value) ? value : `${baseUrl}${value.startsWith('/') ? value : `/${value}`}`;
    const normalizedPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
    const canonical = canonicalUrl ? toAbsoluteUrl(canonicalUrl) : `${baseUrl}${normalizedPath}`;
    const resolvedDescription = description || runtime.description;
    const resolvedKeywords = keywords || runtime.keywords.join(', ');
    const resolvedImage = toAbsoluteUrl(image || runtime.defaultImage);
    const fullTitle = title ? `${title} | ${runtime.siteName}` : runtime.siteName;

    document.title = fullTitle;
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      if (!content) return;
      let element = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) { element = document.createElement('meta'); element.setAttribute(attr, name); document.head.appendChild(element); }
      element.setAttribute('content', content);
    };
    const setLink = (rel: string, href: string) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) { element = document.createElement('link'); element.rel = rel; document.head.appendChild(element); }
      element.href = href;
    };

    setMeta('description', resolvedDescription);
    setMeta('keywords', resolvedKeywords);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('author', runtime.siteName);
    setMeta('language', runtime.language);
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', resolvedDescription, 'property');
    setMeta('og:image', resolvedImage, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('og:type', type === 'profile' ? 'profile' : type === 'article' ? 'article' : 'website', 'property');
    setMeta('og:site_name', runtime.siteName, 'property');
    setMeta('og:locale', runtime.locale, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', resolvedDescription);
    setMeta('twitter:image', resolvedImage);
    setLink('canonical', canonical);

    const defaultSchema: Record<string, unknown> = {
      '@context': 'https://schema.org', '@type': 'Organization', '@id': `${baseUrl}/#organization`, name: runtime.siteName,
      alternateName: runtime.shortName, url: baseUrl, logo: toAbsoluteUrl(runtime.logo), image: resolvedImage,
      ...(runtime.email ? { email: runtime.email } : {}), ...(runtime.phone ? { telephone: runtime.phone } : {}),
      ...(runtime.foundingDate ? { foundingDate: runtime.foundingDate } : {}),
      address: { '@type': 'PostalAddress', ...(runtime.address ? { streetAddress: runtime.address } : {}), addressLocality: runtime.city, addressRegion: runtime.region, addressCountry: runtime.countryCode },
      ...(runtime.geo ? { geo: { '@type': 'GeoCoordinates', latitude: runtime.geo.latitude, longitude: runtime.geo.longitude } } : {}),
      ...(runtime.socialLinks.length ? { sameAs: runtime.socialLinks } : {}),
    };
    const schemaId = 'page-structured-data';
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) { script = document.createElement('script'); script.id = schemaId; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(schema || defaultSchema);
    return () => { document.getElementById(schemaId)?.remove(); };
  }, [canonicalUrl, description, image, keywords, noIndex, pathname, runtime, schema, title, type]);

  return null;
};

export default SEO;
