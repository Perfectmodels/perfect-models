import 'server-only';

import { getCollection } from './app-data';
import { getFashionDayEvents, getPublicArticles, getPublicModels, getPublicServices } from './public-content';

const SERVER_RENDER_COLLECTIONS = [
  'siteConfig',
  'navLinks',
  'socialLinks',
  'agencyTimeline',
  'agencyInfo',
  'modelDistinctions',
  'agencyServices',
  'agencyAchievements',
  'agencyPartners',
  'models',
  'fashionDayEvents',
  'testimonials',
  'articles',
  'contactInfo',
  'siteImages',
  'newsItems',
  'faqData',
  'gallery',
  'galleryAlbums',
] as const;

export async function getPublicAppState(): Promise<Record<string, unknown>> {
  const [models, agencyServices, fashionDayEvents, articles] = await Promise.all([
    getPublicModels(),
    getPublicServices(),
    getFashionDayEvents(),
    getPublicArticles(),
  ]);

  const normalized: Record<string, unknown> = {
    models,
    agencyServices,
    fashionDayEvents,
    articles,
  };

  const entries = await Promise.all(
    SERVER_RENDER_COLLECTIONS.map(async (key) => {
      if (Object.prototype.hasOwnProperty.call(normalized, key)) {
        return [key, normalized[key]] as const;
      }
      try {
        return [key, await getCollection(key)] as const;
      } catch (error) {
        console.error(`[public-app-state] lecture ${key} impossible`, error);
        return [key, null] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}
