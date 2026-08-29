import Image from 'next/image';
import Link from 'next/link';
import VisualMasthead from '@/components/public/VisualMasthead';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';
import { getPublicArticles } from '@/lib/public-content';

export const metadata = buildPageMetadata({ ...MARKETING_PAGES.magazine, path: '/blog' });
export const revalidate = 60;

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const colors = ['bg-pm-peach', 'bg-pm-mint', 'bg-pm-lilac', 'bg-pm-sky', 'bg-pm-gold-light/70', 'bg-pm-coral-soft/65'];

export default async function BlogPage() {
  const articles = await getPublicArticles();
  const [featured, ...rest] = articles;
  const images = articles.map((article) => article.imageUrl).filter(Boolean).slice(0, 5);

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <VisualMasthead
        eyebrow="Le Journal · Perfect Models Management"
        title="La mode en mouvement."
        accent="Nos histoires en images."
        description="Actualités, coulisses, casting, portraits, créations et événements : un magazine vivant pour suivre la maison PMM et les talents qui la composent."
        images={images}
        tone="teal"
        primary={{ label: 'Lire la une', href: featured ? `/blog/${featured.slug}` : '#articles' }}
        secondary={{ label: 'Découvrir les talents', href: '/mannequins' }}
        meta={[`${articles.length} publications`, 'Mode', 'Talents', 'Coulisses']}
      />

      {featured && <section className="bg-pm-sun px-5 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1550px]"><Link href={`/blog/${encodeURIComponent(featured.slug)}`} className="group grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-pm-sand shadow-[0_28px_70px_rgba(91,46,37,.16)]">{featured.imageUrl ? <Image src={featured.imageUrl} alt={featured.title} fill sizes="(max-width:1024px) 100vw, 58vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-playfair text-7xl text-pm-wine/25">PMM</div>}<div className="absolute left-4 top-4 rounded-full bg-pm-coral px-4 py-2 text-[8px] font-black uppercase tracking-[.2em] text-white">À la une</div></div><div className="lg:pl-4"><p className="text-[9px] font-black uppercase tracking-[.24em] text-pm-wine">{featured.category || 'Journal'} · {formatDate(featured.date)}</p><h2 className="mt-5 font-playfair text-4xl font-semibold leading-[.95] tracking-[-.04em] sm:text-6xl">{featured.title}</h2>{featured.excerpt && <p className="mt-6 max-w-xl text-base leading-8 text-pm-ink/60">{featured.excerpt}</p>}<span className="mt-8 inline-flex rounded-full bg-pm-wine px-6 py-3 text-sm font-extrabold text-white">Lire l’article ↗</span></div></Link></div></section>}

      <section id="articles" className="soft-section px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="relative mx-auto max-w-[1550px]">
          {articles.length === 0 ? <div className="rounded-[2rem] bg-pm-peach py-20 text-center"><p className="font-playfair text-4xl font-semibold text-pm-ink/65">Le journal se prépare.</p><p className="mt-4 text-sm text-pm-ink/48">Les publications validées apparaîtront ici.</p></div> : rest.length > 0 ? <>
            <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.26em] text-pm-rose">Dernières publications</p><p className="mt-5 max-w-sm text-sm leading-7 text-pm-ink/50">Une lecture plus visuelle, conçue comme une page magazine où chaque article possède sa propre présence.</p></div><div className="flex items-end justify-between gap-5"><h2 className="font-playfair text-5xl font-semibold sm:text-7xl">À découvrir.</h2><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/35">{articles.length} article{articles.length > 1 ? 's' : ''}</p></div></div>
            <div className="mt-12 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{rest.map((article, index) => <Link key={article.slug} href={`/blog/${encodeURIComponent(article.slug)}`} className={`group block ${index % 3 === 1 ? 'lg:pt-12' : ''}`}><div className={`rounded-[1.7rem] p-2.5 shadow-[0_18px_50px_rgba(91,46,37,.08)] ${colors[index % colors.length]}`}><div className={`relative overflow-hidden rounded-[1.35rem] ${index % 2 ? 'aspect-[4/5]' : 'aspect-[4/4.5]'}`}>{article.imageUrl ? <Image src={article.imageUrl} alt={article.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-playfair text-6xl text-pm-wine/20">PMM</div>}</div></div><p className="mt-5 text-[8px] font-black uppercase tracking-[.22em] text-pm-rose">{article.category || 'Journal'} · {formatDate(article.date)}</p><h3 className="mt-3 font-playfair text-3xl font-semibold leading-[.98]">{article.title}</h3>{article.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-6 text-pm-ink/50">{article.excerpt}</p>}</Link>)}</div>
          </> : null}
        </div>
      </section>
    </main>
  );
}
