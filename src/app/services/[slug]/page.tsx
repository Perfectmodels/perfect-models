import type { Metadata } from 'next';
import LegacyRoute from '@/app/_legacy/LegacyRoute';
import JsonLd from '@/components/JsonLd';
import { getServiceBySlug } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const path = `/services/${slug}`;

  if (!service) {
    return buildPageMetadata({
      title: 'Service Perfect Models Management',
      description: 'Service professionnel de Perfect Models Management à Libreville, Gabon.',
      path,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: service.title,
    description: service.description,
    path,
    keywords: [service.title, service.category, 'service mode Gabon', 'Perfect Models Management'],
    category: service.category,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const path = `/services/${slug}`;

  const schema = service
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `${absoluteUrl(path)}#service`,
          name: service.title,
          description: service.description,
          url: absoluteUrl(path),
          category: service.category,
          provider: { '@id': `${SITE_URL}/#organization` },
          areaServed: { '@type': 'Country', name: 'Gabon' },
          availableChannel: {
            '@type': 'ServiceChannel',
            serviceUrl: absoluteUrl(path),
          },
        },
        breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.title, path },
        ]),
      ]
    : null;

  return (
    <>
      {schema && <JsonLd data={schema} />}
      <LegacyRoute component="ServiceDetail" />
    </>
  );
}
