import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { getArticleBySlug } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const path = `/blog/${slug}`;
  if (!article) return buildPageMetadata({ title: 'Article du Blog PMM', description: 'Publication du Blog de Perfect Models Management.', path, noIndex: true });
  return buildPageMetadata({ title: article.title, description: article.excerpt, path, keywords: [article.category, ...(article.tags ?? [])], image: article.imageUrl, type: 'article', category: article.category, publishedTime: article.date, authors: [article.author || SITE_NAME] });
}

function ArticleBlock({ block }: { block: any }) {
  const type = String(block?.type || 'paragraph');
  const text = String(block?.text || block?.content || '');
  if (type === 'heading' || type === 'heading2' || type === 'h2') return <h2 className="mt-10 font-playfair text-3xl font-black text-white">{text}</h2>;
  if (type === 'heading3' || type === 'h3') return <h3 className="mt-8 font-playfair text-2xl font-bold text-white">{text}</h3>;
  if (type === 'quote') return <blockquote className="my-8 border-l-2 border-[#D4AF37] pl-6 font-playfair text-xl italic text-white/75">{text}</blockquote>;
  if (type === 'image') {
    const src = String(block?.url || block?.src || block?.imageUrl || '');
    return src ? <figure className="my-8"><img src={src} alt={String(block?.alt || '')} className="w-full rounded-2xl object-cover" />{block?.caption && <figcaption className="mt-2 text-center text-xs text-white/35">{String(block.caption)}</figcaption>}</figure> : null;
  }
  if (type === 'video') {
    const url = String(block?.url || block?.src || '');
    return url ? <div className="my-8 aspect-video overflow-hidden rounded-2xl bg-black"><iframe src={url} title="Vidéo" className="h-full w-full" allowFullScreen /></div> : null;
  }
  if (type === 'list' && Array.isArray(block?.items)) return <ul className="my-6 list-disc space-y-2 pl-6 text-base leading-8 text-white/70">{block.items.map((item: unknown, index: number) => <li key={index}>{String(item)}</li>)}</ul>;
  return text ? <p className="my-5 text-base leading-8 text-white/70">{text}</p> : null;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const path = `/blog/${slug}`;
  const schema = [{
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
  }, breadcrumbJsonLd([{ name: 'Accueil', path: '/' }, { name: 'Blog', path: '/blog' }, { name: article.title, path }])];

  return <>
    <JsonLd data={schema} />
    <main className="min-h-screen bg-[#080808] text-white">
      <article className="mx-auto max-w-4xl px-6 pb-24 pt-28 md:px-10">
        <p className="text-[10px] font-black uppercase tracking-[.3em] text-[#D4AF37]">{article.category || 'Magazine'}</p>
        <h1 className="mt-4 font-playfair text-4xl font-black leading-tight md:text-6xl">{article.title}</h1>
        {article.excerpt && <p className="mt-6 text-lg leading-8 text-white/55">{article.excerpt}</p>}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/35"><span>{article.author || SITE_NAME}</span>{article.date && <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>}</div>
        {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="mt-10 aspect-[16/9] w-full rounded-3xl object-cover" />}
        <div className="mt-10">{(Array.isArray(article.content) ? article.content : []).map((block: any, index: number) => <ArticleBlock key={block?.id || index} block={block} />)}</div>
        {article.tags?.length ? <div className="mt-12 flex flex-wrap gap-2 border-t border-white/10 pt-8">{article.tags.map(tag => <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">#{tag}</span>)}</div> : null}
      </article>
    </main>
  </>;
}
