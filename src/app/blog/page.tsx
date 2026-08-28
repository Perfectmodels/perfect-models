import Link from 'next/link';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';
import { getPublicArticles } from '@/lib/public-content';

export const metadata = buildPageMetadata(MARKETING_PAGES.blog);
export const revalidate = 60;

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const articles = await getPublicArticles();
  const [featured, ...rest] = articles;

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="relative isolate overflow-hidden bg-pm-dark px-5 pb-20 pt-24 text-pm-ivory sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 xl:px-16">
        <div aria-hidden="true" className="absolute -right-[3vw] top-1/2 -z-10 -translate-y-1/2 font-playfair text-[27vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">JOURNAL</div>
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
          <div><p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold-light sm:text-[9px]">Perfect Models Management</p><p className="mt-8 max-w-sm text-sm leading-7 text-white/45">Actualités, coulisses, casting, mode et projets : le journal de l’agence et de ses talents.</p></div>
          <div><p className="text-[8px] font-black uppercase tracking-[.34em] text-white/35 sm:text-[9px]">Journal PMM</p><h1 className="mt-5 max-w-5xl font-playfair text-[clamp(4.2rem,9vw,9.3rem)] font-semibold leading-[.78] tracking-[-.065em]">La mode en mouvement.<br /><em className="font-normal text-pm-gold-light">Nos histoires en images.</em></h1></div>
        </div>
      </section>

      {featured ? (
        <section className="bg-pm-ivory px-5 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]">
            <Link href={`/blog/${encodeURIComponent(featured.slug)}`} className="group grid gap-8 border-b border-pm-ink/15 pb-16 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <div className="aspect-[16/10] overflow-hidden bg-pm-sand">{featured.imageUrl ? <img src={featured.imageUrl} alt={featured.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center"><img src="/logopmm.jpg" alt="" className="w-28 opacity-50" /></div>}</div>
              <div className="lg:pb-2">
                <p className="text-[8px] font-black uppercase tracking-[.3em] text-pm-wine">À la une · {featured.category || 'Journal'} · {formatDate(featured.date)}</p>
                <h2 className="mt-5 font-playfair text-4xl font-semibold leading-[.98] tracking-[-.035em] sm:text-6xl">{featured.title}</h2>
                {featured.excerpt && <p className="mt-6 max-w-xl text-sm leading-7 text-pm-ink/52 sm:text-base">{featured.excerpt}</p>}
                <span className="mt-8 inline-flex border-b border-pm-ink pb-2 text-[8px] font-black uppercase tracking-[.25em] transition group-hover:text-pm-wine">Lire l’article ↗</span>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      <section className="bg-pm-ivory px-5 pb-24 sm:px-8 sm:pb-28 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1550px]">
          {articles.length === 0 ? (
            <div className="border-y border-pm-ink/15 py-20 text-center"><p className="font-playfair text-4xl font-semibold text-pm-ink/60">Le journal se prépare.</p><p className="mt-4 text-sm text-pm-ink/42">Les publications validées apparaîtront ici.</p></div>
          ) : rest.length > 0 ? (
            <>
              <div className="flex items-end justify-between border-b border-pm-ink/15 pb-7"><div><p className="text-[8px] font-black uppercase tracking-[.34em] text-pm-wine">Dernières publications</p><h2 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">À découvrir.</h2></div><p className="text-[8px] font-black uppercase tracking-[.24em] text-pm-ink/35">{articles.length} article{articles.length > 1 ? 's' : ''}</p></div>
              <div className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((article, index) => (
                  <Link key={article.slug} href={`/blog/${encodeURIComponent(article.slug)}`} className={`group block ${index % 3 === 1 ? 'lg:pt-10' : ''}`}>
                    <div className="aspect-[4/4.6] overflow-hidden bg-pm-sand">{article.imageUrl ? <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center"><span className="font-playfair text-5xl text-pm-ink/15">PMM</span></div>}</div>
                    <p className="mt-5 text-[8px] font-black uppercase tracking-[.27em] text-pm-wine">{article.category || 'Journal'} · {formatDate(article.date)}</p>
                    <h3 className="mt-3 font-playfair text-2xl font-semibold leading-tight sm:text-3xl">{article.title}</h3>
                    {article.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-pm-ink/48">{article.excerpt}</p>}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
