import type { Metadata } from 'next';
import LegacyRoute from '@/app/_legacy/LegacyRoute';
import JsonLd from '@/components/JsonLd';
import { getModelById } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ id: string }> };
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const model = await getModelById(id);
  const path = `/mannequins/${id}`;

  if (!model) {
    return buildPageMetadata({
      title: 'Profil mannequin PMM',
      description: 'Profil mannequin de Perfect Models Management.',
      path,
      noIndex: true,
    });
  }

  const categories = model.categories ?? [];
  return buildPageMetadata({
    title: `${model.name} — mannequin professionnel au Gabon`,
    description:
      model.experience ||
      `Découvrez le profil de ${model.name}, mannequin Perfect Models Management à ${model.location || 'Libreville'}, Gabon.`,
    path,
    keywords: [model.name, ...categories, `${model.gender === 'Homme' ? 'mannequin homme' : 'mannequin femme'} Gabon`],
    image: model.imageUrl,
    type: 'profile',
    category: 'Mannequins',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const model = await getModelById(id);
  const path = `/mannequins/${id}`;

  const schema = model
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': `${absoluteUrl(path)}#profile`,
          url: absoluteUrl(path),
          name: `${model.name} — Perfect Models Management`,
          inLanguage: 'fr-GA',
          mainEntity: {
            '@type': 'Person',
            '@id': `${absoluteUrl(path)}#person`,
            name: model.name,
            image: absoluteUrl(model.imageUrl),
            jobTitle: 'Mannequin professionnel',
            gender: model.gender,
            homeLocation: {
              '@type': 'Place',
              name: model.location || 'Libreville, Gabon',
            },
            knowsAbout: model.categories ?? [],
            description: model.experience || model.journey,
            worksFor: { '@id': `${SITE_URL}/#organization` },
          },
        },
        breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Mannequins', path: '/mannequins' },
          { name: model.name, path },
        ]),
      ]
    : null;

  return (
    <>
      {schema && <JsonLd data={schema} />}
      <LegacyRoute component="ModelDetail" />
    </>
  );
}
