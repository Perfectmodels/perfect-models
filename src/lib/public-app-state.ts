import 'server-only';

import { getCollection } from './app-data';

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

const toArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).filter(Boolean);
  return [];
};

function publicModels(value: unknown) {
  return toArray(value)
    .filter((model) => model?.isPublic === true)
    .map((model) => ({
      id: model.id,
      name: model.name,
      age: model.age,
      height: model.height,
      gender: model.gender,
      location: model.location,
      imageUrl: model.imageUrl,
      portfolioImages: Array.isArray(model.portfolioImages) ? model.portfolioImages : [],
      isPublic: true,
      level: model.level,
      distinctions: Array.isArray(model.distinctions) ? model.distinctions : [],
      measurements: model.measurements,
      categories: Array.isArray(model.categories) ? model.categories : [],
      experience: model.experience,
      journey: model.journey,
      fashionDayEditions: Array.isArray(model.fashionDayEditions) ? model.fashionDayEditions : undefined,
    }));
}

function sanitizeCollection(key: string, value: unknown) {
  if (key === 'models') return publicModels(value);
  return value;
}

export async function getPublicAppState(): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    SERVER_RENDER_COLLECTIONS.map(async (key) => {
      try {
        return [key, sanitizeCollection(key, await getCollection(key))] as const;
      } catch {
        return [key, null] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}
