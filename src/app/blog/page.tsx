import Link from 'next/link';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';
import { getPublicArticles } from '@/lib/public-content';

export const metadata = buildPageMetadata(MARKETING_PAGES.blog);
export const revalidate = 60;

export default async function BlogPage() {
  const articles = await getPublicArticles();
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="border-b border-white/10 px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Perfect Models Management</p>
          <h1 className="font-playfair text-5xl font-black md:text-7xl">Blog & Magazine</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/60">Actualités, coulisses, mode, casting et projets de Perfect Models Management.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        {articles.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[.03] px-6 py-24 text-center text-white/45">Aucune publication pour le moment.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(article => (
              <Link key={article.slug} href={`/blog/${encodeURIComponent(article.slug)}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-[#D4AF37]/45">
                <div className="aspect-[16/10] overflow-hidden bg-white/[.03]">{article.imageUrl ? <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center text-white/20">PMM</div>}</div>
                <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[.25em] text-[#D4AF37]">{article.category || 'Magazine'}</p>
                  <h2 className="mt-3 font-playfair text-2xl font-bold leading-tight">{article.title}</h2>
                  {article.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/50">{article.excerpt}</p>}
                  <div className="mt-5 flex items-center justify-between text-xs text-white/35"><span>{article.author || 'Perfect Models Management'}</span><span>{article.date ? new Date(article.date).toLocaleDateString('fr-FR') : ''}</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
