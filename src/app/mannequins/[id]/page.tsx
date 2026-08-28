import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ModelPortfolio from '@/components/models/ModelPortfolio';
import { getPublicModels, getModelById } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const model = await getModelById(id);
  const path = `/mannequins/${id}`;
  if (!model) return buildPageMetadata({ title: 'Profil mannequin PMM', description: 'Profil mannequin de Perfect Models Management.', path, noIndex: true });
  return buildPageMetadata({
    title: `${model.name} — mannequin professionnel au Gabon`,
    description: model.experience || `Découvrez le profil de ${model.name}, mannequin Perfect Models Management à ${model.location || 'Libreville'}, Gabon.`,
    path,
    keywords: [model.name, ...(model.categories || []), `${model.gender === 'Homme' ? 'mannequin homme' : 'mannequin femme'} Gabon`],
    image: model.imageUrl,
    type: 'profile',
    category: 'Mannequins',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const model = await getModelById(id);
  if (!model) {
    return <main className="min-h-screen bg-pm-dark px-5 pb-24 pt-36 text-center text-white"><h1 className="font-playfair text-5xl font-semibold">Profil introuvable</h1><Link href="/mannequins" className="mt-7 inline-flex min-h-11 items-center border-b border-pm-gold px-2 pb-2 text-xs font-extrabold uppercase tracking-[.12em] text-pm-gold">← Voir les talents</Link></main>;
  }

  const models = await getPublicModels();
  const similar = models.filter((candidate) => candidate.id !== model.id && (candidate.gender === model.gender || candidate.categories?.some((cat) => model.categories?.includes(cat)))).slice(0, 4);
  const portfolio = [model.imageUrl, ...(model.portfolioImages || [])].filter(Boolean).filter((src, index, arr) => arr.indexOf(src) === index);
  const path = `/mannequins/${id}`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': `${absoluteUrl(path)}#profile`, url: absoluteUrl(path), name: `${model.name} — Perfect Models Management`, inLanguage: 'fr-GA', mainEntity: { '@type': 'Person', '@id': `${absoluteUrl(path)}#person`, name: model.name, image: absoluteUrl(model.imageUrl), jobTitle: 'Mannequin professionnel', gender: model.gender, homeLocation: { '@type': 'Place', name: model.location || 'Libreville, Gabon' }, knowsAbout: model.categories || [], description: model.experience || model.journey, worksFor: { '@id': `${SITE_URL}/#organization` } } },
    breadcrumbJsonLd([{ name: 'Accueil', path: '/' }, { name: 'Mannequins', path: '/mannequins' }, { name: model.name, path }]),
  ];

  const measurements = [
    ['Hauteur', model.height],
    ['Poitrine', model.measurements?.chest],
    ['Tour de taille', model.measurements?.waist],
    ['Hanches', model.measurements?.hips],
    ['Pointure', model.measurements?.shoeSize],
  ];

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <JsonLd data={schema} />

      <section className="relative isolate overflow-hidden bg-pm-dark text-pm-ivory">
        <div aria-hidden="true" className="absolute -right-[3vw] bottom-[-2vw] -z-10 font-playfair text-[24vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">MODEL</div>
        <div className="mx-auto grid min-h-[calc(100svh-78px)] max-w-[1550px] gap-0 px-5 sm:px-8 lg:grid-cols-[.86fr_1.14fr] lg:px-12 xl:px-16">
          <div className="relative min-h-[520px] overflow-hidden border-x border-white/10 lg:min-h-full">
            {model.imageUrl ? <Image src={model.imageUrl} alt={model.name} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /> : <div className="absolute inset-0 grid place-items-center bg-pm-ink"><span className="font-playfair text-8xl text-white/10">PMM</span></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
            <p className="absolute bottom-6 left-6 text-xs font-extrabold uppercase tracking-[.12em] text-white/70">Perfect Models Management</p>
          </div>
          <div className="flex flex-col justify-between py-10 lg:py-16 lg:pl-14 xl:pl-20">
            <Link href="/mannequins" className="inline-flex min-h-11 w-fit items-center text-xs font-extrabold uppercase tracking-[.12em] text-white/55 transition hover:text-pm-gold-light">← Tous les talents</Link>
            <div className="py-16 lg:py-10">
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-pm-gold-light">PMM · {model.level || 'Talent'}</p>
              <h1 className="mt-5 max-w-3xl font-playfair text-[clamp(4.2rem,8vw,8.5rem)] font-semibold leading-[.78] tracking-[-.06em]">{model.name}</h1>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[.12em] text-white/55">{model.gender} · {model.location || 'Libreville, Gabon'}</p>
              {(model.categories || []).length > 0 && <div className="mt-7 flex flex-wrap gap-2">{(model.categories || []).map((cat) => <span key={cat} className="rounded-full border border-pm-gold/40 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-pm-gold-light">{cat}</span>)}</div>}
              <div className="mt-10"><Link href={`/contact?subject=Booking%20mannequin%20${encodeURIComponent(model.name)}`} className="pmm-button pmm-button--light">Demander un booking ↗</Link></div>
            </div>
            <div className="grid grid-cols-2 border-t border-white/12 pt-5 text-[10px] font-extrabold uppercase tracking-[.1em] text-white/45"><span>{model.height || 'Hauteur à confirmer'}</span><span className="text-right">Représenté par PMM</span></div>
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-14 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="flex items-center gap-4 text-xs font-extrabold uppercase tracking-[.14em] text-pm-wine"><span>01</span><span className="h-px w-10 bg-pm-wine/35" /><span>Profil</span></div>
            <h2 className="mt-8 font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-6xl">Le parcours.</h2>
            <p className="mt-7 max-w-3xl whitespace-pre-line text-base leading-8 text-pm-ink/65">{model.journey || model.experience || 'Profil en cours de mise à jour.'}</p>
            {model.experience && model.journey && <div className="mt-9 border-l border-pm-wine/40 pl-6"><p className="text-xs font-extrabold uppercase tracking-[.12em] text-pm-wine">Expérience</p><p className="mt-3 max-w-2xl text-sm leading-7 text-pm-ink/60">{model.experience}</p></div>}
          </div>

          <div>
            <div className="flex items-center gap-4 text-xs font-extrabold uppercase tracking-[.14em] text-pm-wine"><span>02</span><span className="h-px w-10 bg-pm-wine/35" /><span>Mensurations</span></div>
            <div className="mt-8 border-t border-pm-ink/15">
              {measurements.map(([measurementLabel, value]) => <div key={measurementLabel} className="flex items-end justify-between gap-6 border-b border-pm-ink/15 py-4"><p className="text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/50">{measurementLabel}</p><p className="font-playfair text-2xl">{value || '—'}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pm-ink px-5 py-20 text-pm-ivory sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1550px]">
          <div className="grid gap-8 border-b border-white/12 pb-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end"><div className="flex items-center gap-4 text-xs font-extrabold uppercase tracking-[.14em] text-pm-gold"><span>03</span><span className="h-px w-10 bg-pm-gold/35" /><span>Portfolio</span></div><h2 className="font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-7xl">En images.</h2></div>
          <div className="mt-10"><ModelPortfolio name={model.name} images={portfolio} /></div>
        </div>
      </section>

      {model.distinctions?.length ? (
        <section className="bg-pm-sand px-5 py-20 sm:px-8 sm:py-24 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]"><div className="flex items-center gap-4 text-xs font-extrabold uppercase tracking-[.14em] text-pm-wine"><span>04</span><span className="h-px w-10 bg-pm-wine/35" /><span>Carrière</span></div><h2 className="mt-7 font-playfair text-5xl font-semibold sm:text-6xl">Distinctions & expériences.</h2><div className="mt-10 divide-y divide-pm-ink/15 border-t border-pm-ink/15">{model.distinctions.map((item, index) => <div key={item.name} className="grid gap-3 py-6 sm:grid-cols-[4rem_.8fr_1.2fr] sm:items-start"><span className="font-playfair text-2xl italic text-pm-gold-deep">0{index + 1}</span><h3 className="font-playfair text-2xl font-semibold">{item.name}</h3><p className="text-sm leading-7 text-pm-ink/60">{item.titles.join(' · ')}</p></div>)}</div></div>
        </section>
      ) : null}

      {similar.length > 0 && (
        <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-24 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]"><div className="flex items-end justify-between gap-6 border-b border-pm-ink/15 pb-7"><div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-pm-wine">Découvrir</p><h2 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">Autres talents.</h2></div><Link href="/mannequins" className="hidden min-h-11 items-center border-b border-pm-ink px-2 pb-2 text-xs font-extrabold uppercase tracking-[.1em] sm:inline-flex">Tous les profils ↗</Link></div><div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-4 sm:gap-x-5">{similar.map((item, index) => <Link key={item.id} href={`/mannequins/${item.id}`} className={`group ${index % 2 ? 'sm:pt-8' : ''}`}><div className="relative aspect-[3/4.15] overflow-hidden rounded-xl bg-pm-sand">{item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-playfair text-5xl text-pm-ink/15">PMM</div>}</div><p className="mt-4 font-playfair text-xl font-semibold sm:text-2xl">{item.name}</p><p className="mt-1 text-xs font-extrabold uppercase tracking-[.1em] text-pm-wine">{item.categories?.[0] || 'Model'}</p></Link>)}</div></div>
        </section>
      )}
    </main>
  );
}
