import 'server-only';
import { selectPublicRows } from '@/lib/public-content';

export type SiteRuntimeConfig = {
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

const clean = (value: unknown) => String(value ?? '').trim();
const url = (value: string) => value.replace(/\/$/, '');
const objectValue = (value: unknown) => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};

export async function getSiteRuntimeConfig(): Promise<SiteRuntimeConfig> {
  const [settingRows, socialRows] = await Promise.all([
    selectPublicRows('site_settings?select=key,value'),
    selectPublicRows('social_links?select=platform,url,is_active,position&is_active=eq.true&order=position.asc'),
  ]);
  const settings = new Map<string, unknown>((settingRows || []).map((row: any) => [String(row.key || ''), row.value]));
  const siteConfig = objectValue(settings.get('siteConfig'));
  const contact = objectValue(settings.get('contactInfo'));
  const agency = objectValue(settings.get('agencyInfo'));
  const seo = objectValue(settings.get('seoConfig'));
  const images = objectValue(settings.get('siteImages'));

  const siteUrl = url(clean(seo.siteUrl) || clean(process.env.SITE_URL) || clean(process.env.NEXT_PUBLIC_SITE_URL) || 'https://www.perfectmodels.online');
  const siteName = clean(seo.siteName) || clean(siteConfig.name) || clean(agency.name) || 'Perfect Models Management';
  const shortName = clean(seo.shortName) || clean(siteConfig.shortName) || 'PMM';
  const description = clean(seo.description) || clean(agency.description) || clean(objectValue(agency.about).p1) || 'Agence de management, casting, formation et production de talents au Gabon.';
  const keywords = Array.isArray(seo.keywords) ? seo.keywords.map(clean).filter(Boolean) : [];
  const logo = clean(siteConfig.logo) || '/logopmm.jpg';
  const defaultImage = clean(seo.defaultImage) || clean(images.hero) || '/opengraph-image';
  const email = clean(contact.email) || clean(process.env.BUSINESS_EMAIL);
  const phone = clean(contact.phone) || clean(process.env.BUSINESS_PHONE);
  const address = clean(contact.address);
  const city = clean(seo.city) || clean(contact.city) || 'Libreville';
  const region = clean(seo.region) || clean(contact.region) || 'Estuaire';
  const countryCode = clean(seo.countryCode) || 'GA';
  const foundingDate = clean(seo.foundingDate) || clean(agency.foundingDate) || '2021';
  const socialLinks = (socialRows || []).map((row: any) => clean(row.url)).filter((value) => /^https?:\/\//i.test(value));
  const latitude = Number(seo.latitude);
  const longitude = Number(seo.longitude);
  const geo = Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : undefined;

  return { siteUrl, siteName, shortName, locale: clean(seo.locale) || 'fr_GA', language: clean(seo.language) || 'fr-GA', description, keywords, logo, defaultImage, email, phone, address, city, region, countryCode, foundingDate, socialLinks, geo };
}

export function absoluteRuntimeUrl(config: SiteRuntimeConfig, value = '/') {
  if (/^https?:\/\//i.test(value)) return value;
  return `${config.siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

export function buildOrganizationJsonLd(config: SiteRuntimeConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'ProfessionalService', 'LocalBusiness'],
    '@id': `${config.siteUrl}/#organization`,
    name: config.siteName,
    alternateName: config.shortName,
    url: config.siteUrl,
    logo: absoluteRuntimeUrl(config, config.logo),
    image: absoluteRuntimeUrl(config, config.defaultImage),
    ...(config.email ? { email: config.email } : {}),
    ...(config.phone ? { telephone: config.phone } : {}),
    ...(config.foundingDate ? { foundingDate: config.foundingDate } : {}),
    ...(config.description ? { description: config.description } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(config.address ? { streetAddress: config.address } : {}),
      addressLocality: config.city,
      addressRegion: config.region,
      addressCountry: config.countryCode,
    },
    ...(config.geo ? { geo: { '@type': 'GeoCoordinates', latitude: config.geo.latitude, longitude: config.geo.longitude } } : {}),
    ...(config.socialLinks.length ? { sameAs: config.socialLinks } : {}),
  };
}

export function buildWebsiteJsonLd(config: SiteRuntimeConfig) {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${config.siteUrl}/#website`, url: config.siteUrl,
    name: config.siteName, alternateName: config.shortName, inLanguage: config.language,
    publisher: { '@id': `${config.siteUrl}/#organization` },
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${config.siteUrl}/blog?search={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  };
}
