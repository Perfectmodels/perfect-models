import type { Metadata } from 'next';
import HomeExperience from '@/components/public/HomeExperience';
import JsonLd from '@/components/JsonLd';
import { getFashionDayEvents, getPublicArticles, getPublicModels, getPublicServices } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES, SITE_URL } from '@/lib/seo';

export const revalidate = 300;
export const metadata: Metadata = buildPageMetadata({
  ...MARKETING_PAGES.home,
  title: 'Perfect Models Management — Management, Mode & Production',
  description: 'Perfect Models Management révèle les talents, accompagne les mannequins et produit des projets mode à Libreville et au Gabon.',
});

export default async function Page() {
  const [models, services, events, articles] = await Promise.all([
    getPublicModels(),
    getPublicServices(),
    getFashionDayEvents(),
    getPublicArticles(),
  ]);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Perfect Models Management',
    alternateName: 'PMM',
    url: SITE_URL,
    foundingDate: '2021',
    address: { '@type': 'PostalAddress', addressLocality: 'Libreville', addressCountry: 'GA' },
  };

  return (
    <>
      <JsonLd data={organizationSchema} />
      <HomeExperience
        models={models.slice(0, 18)}
        services={services.slice(0, 10)}
        events={events}
        articles={articles.slice(0, 8)}
      />
    </>
  );
}
