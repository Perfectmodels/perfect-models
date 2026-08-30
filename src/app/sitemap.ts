import type { MetadataRoute } from 'next';
import { getPublicArticles, getPublicModels, getPublicServices } from '@/lib/public-content';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

const staticRoutes = [
  ['/', 1, 'daily'],
  ['/agence', 0.8, 'weekly'],
  ['/mannequins', 0.95, 'daily'],
  ['/blog', 0.9, 'daily'],
  ['/services', 0.9, 'weekly'],
  ['/fashion-day', 0.85, 'weekly'],
  ['/casting', 0.8, 'weekly'],
  ['/galerie', 0.7, 'weekly'],
  ['/contact', 0.6, 'monthly'],
  ['/privacy-policy', 0.2, 'yearly'],
  ['/terms-of-use', 0.2, 'yearly'],
] as const;

const validDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, models, services] = await Promise.all([
    getPublicArticles(),
    getPublicModels(),
    getPublicServices(),
  ]);
  const now = new Date();

  return [
    ...staticRoutes.map(([path, priority, changeFrequency]) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`,
      lastModified: validDate(article.date) || now,
      changeFrequency: 'weekly' as const,
      priority: article.isFeatured ? 0.85 : 0.75,
    })),
    ...models.map((model) => ({
      url: `${SITE_URL}/mannequins/${encodeURIComponent(model.id)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: `${SITE_URL}/services/${encodeURIComponent(service.slug)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
