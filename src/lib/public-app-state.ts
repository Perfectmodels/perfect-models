import 'server-only';

import { getFashionDayEvents, getPublicArticles, getPublicModels, getPublicServices } from './public-content';
import { privilegedSupabaseSelect } from './supabase-backend';

async function rows(path: string): Promise<any[]> {
  try {
    const result = await privilegedSupabaseSelect(path);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error(`[public-app-state] lecture Supabase impossible: ${path}`, error);
    return [];
  }
}

async function settings() {
  const result = await rows('site_settings?select=key,value');
  return Object.fromEntries(result.map((item) => [String(item.key), item.value]));
}

export async function getPublicAppState(): Promise<Record<string, unknown>> {
  const [models, agencyServices, fashionDayEvents, articles, navRows, socialRows, timelineRows, siteSettings] = await Promise.all([
    getPublicModels(),
    getPublicServices(),
    getFashionDayEvents(),
    getPublicArticles(),
    rows('navigation_items?select=label,path,in_footer,position,is_active&is_active=eq.true&order=position.asc'),
    rows('social_links?select=platform,url,position,is_active&is_active=eq.true&order=position.asc'),
    rows('agency_timeline?select=year,event,position&order=position.asc'),
    settings(),
  ]);

  const navLinks = navRows.map((item) => ({
    label: String(item.label || ''),
    path: String(item.path || ''),
    inFooter: Boolean(item.in_footer),
  })).filter((item) => item.label && item.path);

  const socialLinks = Object.fromEntries(
    socialRows
      .map((item) => [String(item.platform || '').toLowerCase(), String(item.url || '')] as const)
      .filter(([platform, url]) => platform && url),
  );

  const agencyTimeline = timelineRows
    .map((item) => ({ year: String(item.year || ''), event: String(item.event || '') }))
    .filter((item) => item.year && item.event);

  return {
    siteConfig: siteSettings.siteConfig || { logo: '/logo.svg' },
    navLinks,
    socialLinks,
    agencyTimeline,
    agencyInfo: siteSettings.agencyInfo || { about: { p1: '', p2: '' }, values: [] },
    agencyServices,
    models,
    fashionDayEvents,
    articles,
    contactInfo: siteSettings.contactInfo || { email: '', phone: '', address: '' },
    siteImages: siteSettings.siteImages || {},
    faqData: siteSettings.faqData || [],

    // These collections were seeded from the old static demo dataset and have no
    // verified normalized source yet. Public pages must stay empty instead of
    // presenting sample names, awards, clients or testimonials as real PMM data.
    modelDistinctions: [],
    agencyAchievements: [],
    agencyPartners: [],
    testimonials: [],
    newsItems: [],

    gallery: [],
    galleryAlbums: [],
  };
}
