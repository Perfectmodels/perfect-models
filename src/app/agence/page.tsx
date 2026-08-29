import Image from 'next/image';
import Link from 'next/link';
import VisualMasthead from '@/components/public/VisualMasthead';
import { getPublicAppState } from '@/lib/public-app-state';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.agency);
export const revalidate = 60;

const valueColors = ['bg-pm-peach', 'bg-pm-mint', 'bg-pm-lilac', 'bg-pm-gold-light/65', 'bg-pm-sky', 'bg-pm-coral-soft/65'];

export default async function Page() {
  const data = await getPublicAppState();
  const agency = (data.agencyInfo || { about: { p1: '', p2: '' }, values: [] }) as { about: { p1?: string; p2?: string }; values?: Array<{ name: string; description: string }> };
  const timeline = Array.isArray(data.agencyTimeline) ? data.agencyTimeline as Array<{ year: string; event: string }> : [];
  const siteImages = (data.siteImages || {}) as Record<string, string>;
  const heroImages = Array.from(new Set([siteImages.agencyHistory, siteImages.hero, siteImages.about, siteImages.fashionDayBg, siteImages.castingBg].filter(Boolean)));
  const mainImage = heroImages[0] || '/images/grace-elsa.jpg';

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <VisualMasthead
        eyebrow="Perfect Models Management · Depuis 2021"
        title="Révéler le talent."
        accent="Construire la présence."
        description="Une agence gabonaise dédiée à la représentation, à la formation, au management et à la construction d’images fortes, avec une vision contemporaine de la mode africaine."
        images={heroImages}
        tone="wine"
        primary={{ label: 'Découvrir nos talents', href: '/mannequins' }}
        secondary={{ label: 'Collaborer avec PMM', href: '/contact' }}
        meta={['Management', 'Casting', 'Formation', 'Production']}
      />

      <section className="soft-section py-20 sm:py-28">
        <div className="relative mx-auto grid max-w-[1550px] gap-12 px-5 sm:px-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:px-12 xl:px-16">
          <div className="relative">
            <div className="rounded-[2rem] bg-pm-gold-light/70 p-3 shadow-[0_24px_65px_rgba(91,46,37,.1)] sm:p-4"><div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem]"><Image src={mainImage} alt="Perfect Models Management" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" /></div></div>
            <div className="absolute -bottom-5 -right-3 hidden rounded-[1.4rem] bg-pm-wine px-6 py-5 text-white shadow-xl sm:block"><p className="font-playfair text-4xl italic text-pm-gold-light">PMM</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.2em] text-white/62">Talent · Image · Culture</p></div>
          </div>
          <div className="lg:pl-8"><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-coral">Notre vision</p><h2 className="mt-6 max-w-3xl font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Une carrière ne se résume pas <em className="font-normal text-pm-wine">à une belle image.</em></h2><div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-pm-ink/60">{agency.about?.p1 ? <p>{agency.about.p1}</p> : <p>Perfect Models Management accompagne les talents dans leur développement professionnel, leur image et leur relation avec les marques, créateurs et productions.</p>}{agency.about?.p2 && <p>{agency.about.p2}</p>}</div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{['Talent', 'Image', 'Discipline', 'Opportunité'].map((item, index) => <div key={item} className={`rounded-[1.2rem] px-4 py-4 text-center text-[8px] font-black uppercase tracking-[.16em] ${index === 0 ? 'bg-pm-peach text-pm-wine' : index === 1 ? 'bg-pm-mint text-pm-teal' : index === 2 ? 'bg-pm-lilac text-pm-wine' : 'bg-pm-gold-light text-pm-ink'}`}>{item}</div>)}</div></div>
        </div>
      </section>

      {heroImages.length > 1 && <section className="bg-pm-ink px-5 py-8 sm:px-8 lg:px-12 xl:px-16"><div className="mx-auto grid max-w-[1550px] grid-cols-2 gap-3 md:grid-cols-4">{heroImages.slice(0, 4).map((image, index) => <div key={image} className={`relative overflow-hidden rounded-[1.5rem] ${index === 0 ? 'aspect-[4/5]' : index === 3 ? 'aspect-[4/5]' : 'aspect-square'}`}><Image src={image} alt="Univers Perfect Models Management" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" /></div>)}</div></section>}

      {agency.values?.length ? <section className="bg-pm-paper px-5 py-20 sm:px-8 sm:py-24 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1550px]"><div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-rose">Nos fondamentaux</p><p className="mt-5 max-w-sm text-sm leading-7 text-pm-ink/52">Des principes concrets qui guident le management, l’image et les relations professionnelles.</p></div><h2 className="font-playfair text-5xl font-semibold sm:text-7xl">Ce que nous <em className="font-normal text-pm-wine">défendons.</em></h2></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{agency.values.map((value, index) => <article key={value.name} className={`color-card min-h-64 ${valueColors[index % valueColors.length]}`}><span className="font-playfair text-3xl italic text-pm-wine">0{index + 1}</span><div className="mt-10"><h3 className="font-playfair text-3xl font-semibold">{value.name}</h3><p className="mt-4 text-sm leading-7 text-pm-ink/56">{value.description}</p></div></article>)}</div></div></section> : null}

      {timeline.length > 0 && <section className="bg-pm-teal px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12 xl:px-16"><div className="mx-auto max-w-[1550px]"><div className="grid gap-8 lg:grid-cols-[.6fr_1.4fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-peach">Notre parcours</p><p className="mt-5 max-w-sm text-sm leading-7 text-white/60">Une maison se construit étape après étape, projet après projet.</p></div><h2 className="font-playfair text-5xl font-semibold sm:text-7xl">Les étapes qui <em className="font-normal text-pm-gold-light">nous construisent.</em></h2></div><div className="mt-10 grid gap-3 md:grid-cols-2">{timeline.map((item, index) => <article key={`${item.year}-${item.event}`} className="rounded-[1.5rem] border border-white/12 bg-white/[.07] p-6 backdrop-blur-sm"><div className="flex items-center justify-between"><span className="font-playfair text-4xl font-semibold text-pm-gold-light">{item.year}</span><span className="text-[8px] font-black uppercase tracking-[.2em] text-white/35">0{index + 1}</span></div><p className="mt-5 text-sm leading-7 text-white/68 sm:text-base">{item.event}</p></article>)}</div></div></section>}

      <section className="brand-gradient px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12 xl:px-16"><div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-white/70">Collaborer avec PMM</p><p className="mt-5 max-w-sm text-sm leading-7 text-white/66">Marque, créateur, événement, production ou futur talent : notre équipe étudie chaque collaboration avec précision.</p></div><div><h2 className="font-playfair text-5xl font-semibold leading-[.9] sm:text-7xl">Une vision commune commence <em className="font-normal text-pm-gold-light">par une conversation.</em></h2><div className="mt-8 flex flex-wrap gap-3"><Link href="/contact" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-pm-ink">Contacter l’agence ↗</Link><Link href="/mannequins" className="inline-flex min-h-12 items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold">Découvrir les talents</Link></div></div></div></section>
    </main>
  );
}
