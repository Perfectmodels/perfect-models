import type { Metadata } from 'next';
import HomeExperience from '@/components/public/HomeExperience';
import { getFashionDayEvents, getPublicArticles, getPublicModels, getPublicServices } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const revalidate = 300;
export const metadata: Metadata = buildPageMetadata(MARKETING_PAGES.home);

export default async function Page() {
  const [models, services, events, articles] = await Promise.all([
    getPublicModels(),
    getPublicServices(),
    getFashionDayEvents(),
    getPublicArticles(),
  ]);

  return (
    <HomeExperience
      models={models.slice(0, 18)}
      services={services.slice(0, 10)}
      events={events}
      articles={articles.slice(0, 8)}
    />
  );
}
