import Link from 'next/link';
import { getPublicAppState } from '@/lib/public-app-state';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.agency);
export const revalidate = 60;

export default async function Page() {
  const data = await getPublicAppState();
  const agency = (data.agencyInfo || { about: { p1: '', p2: '' }, values: [] }) as { about: { p1?: string; p2?: string }; values?: Array<{ name: string; description: string }> };
  const timeline = Array.isArray(data.agencyTimeline) ? data.agencyTimeline as Array<{ year: string; event: string }> : [];
  const image = ((data.siteImages || {}) as Record<string, string>).agencyHistory;

  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 bg-black px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><p className="text-[9px] font-black uppercase tracking-[.4em] text-pm-gold">Perfect Models Management · Depuis 2021</p><h1 className="mt-5 max-w-5xl font-playfair text-6xl font-black italic leading-[.88] sm:text-8xl">L’agence</h1><p className="mt-7 max-w-3xl text-lg leading-9 text-white/45">Management de talents, casting, formation et production mode au Gabon.</p></div></section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div>{image ? <img src={image} alt="Perfect Models Management" className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] bg-white/[.03]" />}</div>
        <div className="flex flex-col justify-center"><p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold">Notre vision</p><h2 className="mt-4 font-playfair text-4xl font-bold italic sm:text-5xl">Révéler, structurer et propulser les talents.</h2><div className="mt-8 space-y-6 text-base leading-8 text-white/50">{agency.about?.p1 && <p>{agency.about.p1}</p>}{agency.about?.p2 && <p>{agency.about.p2}</p>}</div>{agency.values?.length ? <div className="mt-10 grid gap-4 sm:grid-cols-3">{agency.values.map((value) => <article key={value.name} className="border border-white/10 p-4"><h3 className="text-[9px] font-black uppercase tracking-[.2em] text-pm-gold">{value.name}</h3><p className="mt-3 text-xs leading-6 text-white/40">{value.description}</p></article>)}</div> : null}</div>
      </section>
      {timeline.length > 0 && <section className="border-y border-white/10 bg-black/25 px-5 py-16 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold">Notre parcours</p><div className="mt-8 grid gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">{timeline.map((item) => <article key={`${item.year}-${item.event}`} className="bg-pm-dark p-6"><span className="font-playfair text-4xl font-bold text-pm-gold/40">{item.year}</span><p className="mt-5 text-sm leading-7 text-white/55">{item.event}</p></article>)}</div></div></section>}
      <section className="px-5 py-20 text-center sm:px-8 lg:px-10"><h2 className="font-playfair text-4xl font-bold sm:text-6xl">Travailler avec PMM</h2><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/contact" className="bg-pm-gold px-6 py-4 text-[10px] font-black uppercase tracking-[.2em] text-black">Contacter l’agence</Link><Link href="/mannequins" className="border border-white/15 px-6 py-4 text-[10px] font-black uppercase tracking-[.2em] text-white">Voir les talents</Link></div></section>
    </main>
  );
}
