import type { Metadata } from 'next';
import LegacyRoute from '@/app/_legacy/LegacyRoute';
import JsonLd from '@/components/JsonLd';
import { getArticleBySlug } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const path = `/magazine/${slug}`;

  if (!article) {
    return buildPageMetadata({
      title: 'Article du magazine PMM',
      description: 'Article du magazine mode de Perfect Models Management.',
      path,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: article.title,
    description: article.excerpt,
    path,
    keywords: [article.category, ...(article.tags ?? [])],
    image: article.imageUrl,
    type: 'article',
    category: article.category,
    publishedTime: article.date,
    authors: [article.author || SITE_NAME],
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const path = `/magazine/${slug}`;

  const schema = article
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': `${absoluteUrl(path)}#article`,
          headline: article.title,
          description: article.excerpt,
          image: article.imageUrl ? [absoluteUrl(article.imageUrl)] : undefined,
          datePublished: article.date,
          dateModified: article.date,
          author: { '@type': 'Person', name: article.author || SITE_NAME },
          publisher: { '@id': `${SITE_URL}/#organization` },
          mainEntityOfPage: absoluteUrl(path),
          articleSection: article.category,
          keywords: article.tags?.join(', '),
          inLanguage: 'fr-GA',
        },
        breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Magazine', path: '/magazine' },
          { name: article.title, path },
        ]),
      ]
    : null;

  return (
    <>
      {schema && <JsonLd data={schema} />}
      <LegacyRoute component="ArticleDetail" />
    </>
  );
}
