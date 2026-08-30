import type { Metadata } from 'next';
import HomeExperienceLive from '@/components/public/HomeExperienceLive';
import { getFashionDayEvents, getPublicArticles, getPublicModels, getPublicServices } from '@/lib/public-content';
import { getPublicSiteImages } from '@/lib/site-images';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildPageMetadata(MARKETING_PAGES.home);

export default async function Page() {
  const [models, services, events, articles, siteImages] = await Promise.all([
    getPublicModels(),
    getPublicServices(),
    getFashionDayEvents(),
    getPublicArticles(),
    getPublicSiteImages(),
  ]);

  return (
    <HomeExperienceLive
      models={models.slice(0, 18)}
      services={services.slice(0, 10)}
      events={events}
      articles={articles.slice(0, 8)}
      siteImages={siteImages}
    />
  );
}
