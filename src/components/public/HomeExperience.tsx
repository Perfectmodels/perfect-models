'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

type Model = {
  id: string;
  name: string;
  imageUrl?: string;
  portfolioImages?: string[];
  height?: string;
  gender?: string;
  location?: string;
  level?: string;
};

type Service = { slug: string; title: string; description?: string; category?: string };
type Event = { edition: number; theme: string; date: string; location?: string; description?: string; coverImageUrl?: string; galleryImages?: string[] };
type Article = { slug: string; title: string; imageUrl?: string; category?: string; date: string; excerpt?: string };
type Props = { models: Model[]; services: Service[]; events: Event[]; articles: Article[] };

type HeroSlide = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  href: string;
  cta: string;
};

const FALLBACK_IMAGE = '/images/grace-elsa.jpg';
const HERO_COPY: HeroSlide[] = [
  { eyebrow: 'Perfect Models Management · Libreville', title: 'Le talent ne demande pas la permission.', accent: 'Il se révèle.', description: 'Une maison gabonaise dédiée au management, à la formation et au développement d’images fortes.', href: '/mannequins', cta: 'Découvrir nos talents' },
  { eyebrow: 'Casting · Développement · Carrière', title: 'Des silhouettes. Des trajectoires.', accent: 'Une signature.', description: 'Nous transformons le potentiel en présence professionnelle, du premier casting aux grandes scènes.', href: '/casting-formulaire', cta: 'Rejoindre l’agence' },
  { eyebrow: 'Mode · Image · Production', title: 'Le Gabon comme scène.', accent: 'Le monde comme horizon.', description: 'Une vision contemporaine de la mode africaine, construite depuis Libreville et pensée pour circuler.', href: '/services', cta: 'Voir nos expertises' },
  { eyebrow: 'PMM Campus', title: 'Former aujourd’hui les visages', accent: 'de demain.', description: 'Posture, discipline, image, culture mode et préparation métier : la progression fait partie du management.', href: '/formations', cta: 'Explorer la formation' },
  { eyebrow: 'Perfect Fashion Day', title: 'Quand les talents rencontrent', accent: 'la création.', description: 'Notre rendez-vous signature réunit mannequins, créateurs, partenaires et nouvelles visions de la mode.', href: '/fashion-day', cta: 'Découvrir Fashion Day' },
];

const serviceColors = ['bg-pm-peach', 'bg-pm-mint', 'bg-pm-lilac', 'bg-pm-sky', 'bg-pm-gold-light/65', 'bg-pm-coral-soft/65'];

function formatDate(value?: string) {
  if (!value) return 'Date à venir';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function uniqueImages(models: Model[], events: Event[], articles: Article[]) {
  return Array.from(new Set([
    ...models.flatMap((model) => [model.imageUrl, ...(model.portfolioImages || [])]),
    ...events.flatMap((event) => [event.coverImageUrl, ...(event.galleryImages || [])]),
    ...articles.map((article) => article.imageUrl),
  ].filter((value): value is string => Boolean(value))));
}

export default function HomeExperience({ models, services, events, articles }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const images = useMemo(() => uniqueImages(models, events, articles), [models, events, articles]);
  const pool = images.length ? images : [FALLBACK_IMAGE];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || HERO_COPY.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % HERO_COPY.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  const go = (delta: number) => setActive((current) => (current + delta + HERO_COPY.length) % HERO_COPY.length);
  const imageAt = (offset: number) => pool[(active + offset) % pool.length] || FALLBACK_IMAGE;
  const slide = HERO_COPY[active];
  const latestEvent = [...events].sort((a, b) => Number(b.edition) - Number(a.edition))[0];
  const eventImage = latestEvent?.coverImageUrl || latestEvent?.galleryImages?.[0] || pool[3] || FALLBACK_IMAGE;
  const featuredModels = models.slice(0, 8);
  const featuredArticles = articles.slice(0, 4);

  return (
    <main className="overflow-hidden bg-pm-ivory text-pm-ink">
      <section
        className="relative isolate overflow-hidden bg-pm-ivory"
        aria-roledescription="carrousel"
        aria-label="Perfect Models Management"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onKeyDown={(event) => { if (event.key === 'ArrowLeft') go(-1); if (event.key === 'ArrowRight') go(1); }}
      >
        <div aria-hidden="true" className="absolute -left-32 top-6 h-80 w-80 rounded-full bg-pm-peach/70 blur-3xl" />
        <div aria-hidden="true" className="absolute right-[18%] top-0 h-72 w-72 rounded-full bg-pm-mint/60 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-pm-lilac/55 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100svh-102px)] max-w-[1700px] gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-12 lg:py-16 xl:px-16">
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-pm-wine/12 bg-white/75 px-4 py-2 shadow-sm backdrop-blur-md">
              <span className="h-2.5 w-2.5 rounded-full bg-pm-coral" />
              <p className="text-[9px] font-black uppercase tracking-[.24em] text-pm-wine">{slide.eyebrow}</p>
            </div>
            <h1 className="mt-7 font-playfair text-[clamp(4.1rem,7.3vw,8.3rem)] font-semibold leading-[.8] tracking-[-.058em] text-pm-ink">
              {slide.title}<br /><em className="font-normal text-pm-wine">{slide.accent}</em>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-pm-ink/62 sm:text-lg">{slide.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={slide.href} className="inline-flex min-h-12 items-center justify-center rounded-full bg-pm-wine px-6 py-3 text-sm font-extrabold text-white shadow-[0_15px_35px_rgba(125,31,77,.2)] transition hover:-translate-y-0.5 hover:bg-pm-berry">{slide.cta} <span className="ml-2">↗</span></Link>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-pm-ink/15 bg-white/70 px-6 py-3 text-sm font-bold backdrop-blur-sm transition hover:border-pm-coral hover:bg-pm-peach">Parler à l’agence</Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-3">
              {[['Talents', models.length], ['Expertises', services.length], ['Histoires', articles.length]].map(([label, value], index) => (
                <div key={String(label)} className={`rounded-[1.3rem] p-4 ${index === 0 ? 'bg-pm-peach' : index === 1 ? 'bg-pm-mint' : 'bg-pm-gold-light/65'}`}>
                  <p className="font-playfair text-3xl font-semibold sm:text-4xl">{value}</p>
                  <p className="mt-1 text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/48">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative grid h-[520px] grid-cols-12 grid-rows-12 gap-3 sm:h-[620px] lg:h-[650px]">
            <div className="photo-card col-span-7 row-span-9 rotate-[-1.5deg]">
              <Image src={imageAt(0)} alt="Talent Perfect Models Management" fill priority sizes="(max-width: 1024px) 58vw, 35vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-20 text-white"><p className="text-[8px] font-black uppercase tracking-[.25em]">PMM · Libreville</p></div>
            </div>
            <div className="photo-card col-span-5 row-span-6 mt-8 rotate-[2deg]">
              <Image src={imageAt(1)} alt="Mode et image PMM" fill sizes="(max-width: 1024px) 42vw, 25vw" className="object-cover" />
            </div>
            <div className="photo-card col-span-5 row-span-6 -translate-y-3 rotate-[-1deg]">
              <Image src={imageAt(2)} alt="Univers créatif PMM" fill sizes="(max-width: 1024px) 42vw, 25vw" className="object-cover" />
            </div>
            <div className="col-span-7 row-span-3 flex items-end rounded-[1.6rem] bg-pm-coral p-5 text-white shadow-[0_18px_45px_rgba(242,95,75,.25)] lg:translate-x-6">
              <div className="flex w-full items-end justify-between gap-4"><div><p className="text-[8px] font-black uppercase tracking-[.24em] text-white/65">Maison de talents</p><p className="mt-2 font-playfair text-2xl font-semibold">Management · Mode · Production</p></div><span className="font-playfair text-5xl italic text-white/45">241</span></div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex max-w-[1700px] items-center justify-between gap-4 border-t border-pm-ink/10 px-5 py-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Univers précédent" className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12 bg-white"><ArrowLeft size={16} /></button>
            <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Reprendre le carrousel' : 'Mettre le carrousel en pause'} className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12 bg-white">{paused ? <Play size={15} /> : <Pause size={15} />}</button>
            <button type="button" onClick={() => go(1)} aria-label="Univers suivant" className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12 bg-white"><ArrowRight size={16} /></button>
          </div>
          <div className="flex flex-1 justify-center gap-1.5">{HERO_COPY.map((item, index) => <button key={item.title} type="button" onClick={() => setActive(index)} aria-label={`Afficher l’univers ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-12 bg-pm-wine' : 'w-4 bg-pm-ink/15'}`} />)}</div>
          <p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/35">0{active + 1} / 0{HERO_COPY.length}</p>
        </div>
      </section>

      <section className="brand-gradient overflow-hidden py-4 text-white">
        <div className="flex min-w-max items-center gap-8 px-5 text-[9px] font-black uppercase tracking-[.28em] sm:text-[10px]">
          {['Talents', 'Casting', 'Management', 'Fashion', 'Production', 'Formation', 'Editorial', 'Gabon', 'Perfect Fashion Day', 'Booking'].map((word) => <span key={word} className="inline-flex items-center gap-8"><span>{word}</span><span className="h-1.5 w-1.5 rounded-full bg-white/55" /></span>)}
        </div>
      </section>

      <section className="soft-section py-20 sm:py-28">
        <div className="relative mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.26em] text-pm-coral">Une maison, plusieurs regards</p>
              <h2 className="mt-5 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">La mode se raconte aussi <em className="font-normal text-pm-wine">par l’image.</em></h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-pm-ink/58">Le site devient une galerie vivante de nos talents, de nos productions, de nos événements et des histoires que l’agence construit au quotidien.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[['Repérer', 'Voir le potentiel'], ['Développer', 'Construire l’image'], ['Connecter', 'Créer l’opportunité']].map(([title, body], index) => <div key={title} className={`color-card ${index === 0 ? 'bg-pm-peach' : index === 1 ? 'bg-pm-mint' : 'bg-pm-lilac'}`}><p className="font-playfair text-3xl italic text-pm-wine">0{index + 1}</p><h3 className="mt-6 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm text-pm-ink/55">{body}</p></div>)}
              </div>
            </div>
            <div className="grid h-[520px] grid-cols-2 gap-3 sm:h-[620px] sm:grid-cols-3">
              {[0, 1, 2, 3, 4].map((index) => <div key={index} className={`photo-card relative ${index === 0 ? 'row-span-2 sm:col-span-2' : index === 3 ? 'sm:col-span-2' : ''}`}><Image src={pool[index % pool.length]} alt="Galerie Perfect Models Management" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" /></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pm-wine py-20 text-white sm:py-28">
        <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.25em] text-pm-gold-light">Roster officiel</p><h2 className="mt-4 font-playfair text-6xl font-semibold tracking-[-.05em] sm:text-8xl">Les visages <em className="font-normal text-pm-peach">PMM.</em></h2></div>
            <Link href="/mannequins" className="inline-flex rounded-full border border-white/25 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-[.15em] transition hover:bg-white hover:text-pm-wine">Voir tout le roster ↗</Link>
          </div>
          {featuredModels.length > 0 ? (
            <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
              {featuredModels.map((model, index) => (
                <Link key={model.id} href={`/mannequins/${model.id}`} className={`group ${index % 4 === 1 || index % 4 === 3 ? 'md:pt-10' : ''}`}>
                  <div className="relative aspect-[3/4.1] overflow-hidden rounded-[1.5rem] bg-white/10 shadow-[0_22px_55px_rgba(37,24,32,.2)]">
                    <Image src={model.imageUrl || model.portfolioImages?.[0] || FALLBACK_IMAGE} alt={model.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-16"><p className="font-playfair text-2xl font-semibold">{model.name}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.18em] text-white/60">{model.location || 'Libreville'}{model.height ? ` · ${model.height}` : ''}</p></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="mt-10 text-white/55">Les profils publiés apparaîtront ici.</p>}
        </div>
      </section>

      <section className="bg-pm-sun py-20 sm:py-28">
        <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
            <div><p className="text-[10px] font-black uppercase tracking-[.25em] text-pm-wine">Expertises</p><p className="mt-5 max-w-sm text-sm leading-7 text-pm-ink/60">Chaque service devient une porte d’entrée claire vers un besoin concret : talent, image, production, événement ou accompagnement.</p></div>
            <h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Une agence complète.<br /><em className="font-normal text-pm-wine">Une expérience cohérente.</em></h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service, index) => (
              <Link key={service.slug} href={`/services/${service.slug}`} className={`group color-card min-h-64 ${serviceColors[index % serviceColors.length]}`}>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between"><span className="font-playfair text-3xl italic text-pm-wine">0{index + 1}</span><span className="text-pm-wine transition group-hover:translate-x-1">↗</span></div>
                  <div><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine/65">{service.category || 'Expertise PMM'}</p><h3 className="mt-3 font-playfair text-3xl font-semibold leading-[.95]">{service.title}</h3><p className="mt-4 line-clamp-3 text-sm leading-6 text-pm-ink/58">{service.description}</p></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {latestEvent && (
        <section className="relative min-h-[720px] overflow-hidden bg-pm-ink text-white">
          <Image src={eventImage} alt={`Perfect Fashion Day — ${latestEvent.theme}`} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-pm-ink/92 via-pm-wine/58 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-pm-ink/75 via-transparent to-transparent" />
          <div className="relative mx-auto flex min-h-[720px] max-w-[1550px] items-end px-5 py-16 sm:px-8 lg:px-12 lg:py-20 xl:px-16">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full bg-pm-coral px-4 py-2 text-[9px] font-black uppercase tracking-[.22em]">Perfect Fashion Day · Édition {latestEvent.edition}</div>
              <h2 className="mt-6 font-playfair text-[clamp(4rem,8vw,8rem)] font-semibold leading-[.82] tracking-[-.055em]">{latestEvent.theme || 'Perfect Fashion Day'}</h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">{latestEvent.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-[.15em] text-white/65"><span>{formatDate(latestEvent.date)}</span><span>·</span><span>{latestEvent.location || 'Libreville, Gabon'}</span></div>
              <Link href="/fashion-day" className="mt-8 inline-flex rounded-full bg-pm-gold-light px-6 py-3 text-sm font-extrabold text-pm-ink">Explorer l’événement ↗</Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-pm-paper py-20 sm:py-28">
        <div className="mx-auto max-w-[1550px] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end"><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-pm-rose">Journal PMM</p><p className="mt-5 max-w-sm text-sm leading-7 text-pm-ink/55">Coulisses, portraits, mode, événements et actualités : la vie de l’agence racontée comme un magazine.</p></div><div className="flex items-end justify-between gap-5"><h2 className="font-playfair text-5xl font-semibold sm:text-7xl">À lire. <em className="font-normal text-pm-wine">À regarder.</em></h2><Link href="/blog" className="hidden text-xs font-black uppercase tracking-[.15em] text-pm-wine sm:block">Tout le journal ↗</Link></div></div>
          {featuredArticles.length > 0 && <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{featuredArticles.map((article, index) => <Link key={article.slug} href={`/blog/${article.slug}`} className={`group ${index === 1 || index === 3 ? 'lg:pt-10' : ''}`}><div className={`relative overflow-hidden rounded-[1.6rem] ${index % 2 ? 'aspect-[4/5]' : 'aspect-[4/4.5]'} ${index === 0 ? 'bg-pm-peach' : index === 1 ? 'bg-pm-mint' : index === 2 ? 'bg-pm-lilac' : 'bg-pm-sky'}`}>{article.imageUrl ? <Image src={article.imageUrl} alt={article.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /> : <div className="grid h-full place-items-center font-playfair text-6xl text-pm-wine/25">PMM</div>}</div><p className="mt-5 text-[8px] font-black uppercase tracking-[.2em] text-pm-rose">{article.category || 'Journal'} · {formatDate(article.date)}</p><h3 className="mt-3 font-playfair text-2xl font-semibold leading-[1.02]">{article.title}</h3></Link>)}</div>}
          <Link href="/blog" className="mt-8 inline-flex text-xs font-black uppercase tracking-[.15em] text-pm-wine sm:hidden">Tout le journal ↗</Link>
        </div>
      </section>

      <section className="brand-gradient py-20 text-white sm:py-24">
        <div className="mx-auto grid max-w-[1550px] gap-10 px-5 sm:px-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end lg:px-12 xl:px-16">
          <div><p className="text-[10px] font-black uppercase tracking-[.26em] text-white/70">Perfect Models Management</p><h2 className="mt-5 font-playfair text-5xl font-semibold leading-[.9] sm:text-7xl">Vous avez un talent, une marque ou <em className="font-normal text-pm-gold-light">une idée à mettre en scène ?</em></h2></div>
          <div className="grid gap-3"><Link href="/contact?subject=booking" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-pm-ink">Booker un talent ↗</Link><Link href="/casting-formulaire" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold">Rejoindre l’agence</Link></div>
        </div>
      </section>
    </main>
  );
}
