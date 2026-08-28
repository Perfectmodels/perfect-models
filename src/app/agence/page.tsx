import Link from 'next/link';
import { getPublicAppState } from '@/lib/public-app-state';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.agency);
export const revalidate = 60;

export default async function Page() {
  const data = await getPublicAppState();
  const agency = (data.agencyInfo || { about: { p1: '', p2: '' }, values: [] }) as {
    about: { p1?: string; p2?: string };
    values?: Array<{ name: string; description: string }>;
  };
  const timeline = Array.isArray(data.agencyTimeline) ? data.agencyTimeline as Array<{ year: string; event: string }> : [];
  const image = ((data.siteImages || {}) as Record<string, string>).agencyHistory;

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="relative isolate overflow-hidden bg-pm-dark px-5 pb-20 pt-24 text-pm-ivory sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 xl:px-16">
        <div aria-hidden="true" className="absolute -right-[5vw] top-1/2 -z-10 -translate-y-1/2 font-playfair text-[27vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">AGENCY</div>
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold-light sm:text-[9px]">Perfect Models Management · Depuis 2021</p>
            <p className="mt-8 max-w-sm text-sm leading-7 text-white/45">Une agence gabonaise dédiée à la représentation, à la formation et à la construction d’images fortes.</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.34em] text-white/35 sm:text-[9px]">L’agence</p>
            <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(4.2rem,9vw,9.4rem)] font-semibold leading-[.78] tracking-[-.065em]">Révéler le talent.<br /><em className="font-normal text-pm-gold-light">Construire la présence.</em></h1>
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative">
            {image ? (
              <div className="relative aspect-[4/5] overflow-hidden bg-pm-sand">
                <img src={image} alt="Perfect Models Management" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-6 pt-24"><p className="text-[8px] font-black uppercase tracking-[.3em] text-white/70">Libreville · Gabon</p></div>
              </div>
            ) : (
              <div className="grid aspect-[4/5] place-items-center bg-pm-sand"><img src="/logopmm.jpg" alt="Perfect Models Management" className="w-28 opacity-80 sm:w-36" /></div>
            )}
            <div className="absolute -bottom-6 -right-3 hidden border border-pm-ink/15 bg-pm-ivory px-7 py-5 sm:block"><p className="font-playfair text-4xl italic text-pm-wine">PMM</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.24em] text-pm-ink/40">Talent · Image · Culture</p></div>
          </div>

          <div className="lg:pl-8">
            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[.36em] text-pm-wine sm:text-[9px]"><span>01</span><span className="h-px w-10 bg-pm-wine/35" /><span>Notre vision</span></div>
            <h2 className="mt-8 max-w-3xl font-playfair text-5xl font-semibold leading-[.92] tracking-[-.045em] sm:text-7xl">Une carrière ne se résume pas<br /><em className="font-normal text-pm-wine">à une belle image.</em></h2>
            <div className="mt-9 max-w-3xl space-y-6 text-base leading-8 text-pm-ink/58">
              {agency.about?.p1 ? <p>{agency.about.p1}</p> : <p>Perfect Models Management accompagne les talents dans leur développement professionnel, leur image et leur relation avec les marques, créateurs et productions.</p>}
              {agency.about?.p2 && <p>{agency.about.p2}</p>}
            </div>
          </div>
        </div>
      </section>

      {agency.values?.length ? (
        <section className="border-y border-pm-ink/10 bg-pm-sand px-5 py-20 sm:px-8 sm:py-24 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]">
            <div className="grid gap-8 border-b border-pm-ink/15 pb-8 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
              <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[.36em] text-pm-wine sm:text-[9px]"><span>02</span><span className="h-px w-10 bg-pm-wine/35" /><span>Nos fondamentaux</span></div>
              <h2 className="font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-7xl">Ce que nous défendons.</h2>
            </div>
            <div className="mt-10 grid gap-px bg-pm-ink/15 md:grid-cols-3">
              {agency.values.map((value, index) => (
                <article key={value.name} className="bg-pm-sand p-7 sm:p-9">
                  <span className="font-playfair text-3xl italic text-pm-gold-deep">0{index + 1}</span>
                  <h3 className="mt-10 font-playfair text-3xl font-semibold">{value.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-pm-ink/52">{value.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {timeline.length > 0 && (
        <section className="bg-pm-wine px-5 py-20 text-pm-ivory sm:px-8 sm:py-28 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]">
            <div className="grid gap-8 border-b border-white/20 pb-8 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
              <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[.36em] text-pm-gold-light sm:text-[9px]"><span>03</span><span className="h-px w-10 bg-pm-gold-light/35" /><span>Notre parcours</span></div>
              <h2 className="font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-7xl">Les étapes qui nous construisent.</h2>
            </div>
            <div className="divide-y divide-white/20">
              {timeline.map((item, index) => (
                <article key={`${item.year}-${item.event}`} className="grid gap-5 py-7 sm:grid-cols-[4rem_.4fr_1.6fr] sm:items-start sm:py-9">
                  <span className="font-playfair text-2xl italic text-pm-gold-light">0{index + 1}</span>
                  <span className="font-playfair text-4xl font-semibold text-white/70">{item.year}</span>
                  <p className="max-w-3xl text-sm leading-7 text-white/58 sm:text-base">{item.event}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
          <div><p className="text-[8px] font-black uppercase tracking-[.38em] text-pm-wine">Collaborer avec PMM</p><p className="mt-7 max-w-sm text-sm leading-7 text-pm-ink/52">Marque, créateur, événement, production ou futur talent : notre équipe étudie chaque collaboration avec précision.</p></div>
          <div><h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Une vision commune<br /><em className="font-normal text-pm-wine">commence par une conversation.</em></h2><div className="mt-8 flex flex-wrap gap-3"><Link href="/contact" className="pmm-button border-pm-ink bg-pm-ink text-pm-ivory hover:border-pm-wine hover:bg-pm-wine">Contacter l’agence ↗</Link><Link href="/mannequins" className="pmm-button border-pm-ink/25 text-pm-ink hover:border-pm-wine hover:text-pm-wine">Découvrir les talents</Link></div></div>
        </div>
      </section>
    </main>
  );
}
