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
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  href: string;
  cta: string;
};

const FALLBACK_IMAGE = '/images/grace-elsa.jpg';
const HERO_COPY = [
  {
    eyebrow: 'Perfect Models Management · Libreville',
    title: 'Le talent ne demande pas la permission.',
    accent: 'Il se révèle.',
    description: 'Une maison gabonaise dédiée au management, à la formation et au développement d’images fortes.',
    href: '/mannequins',
    cta: 'Découvrir nos talents',
  },
  {
    eyebrow: 'Casting · Développement · Carrière',
    title: 'Des silhouettes. Des trajectoires.',
    accent: 'Une signature.',
    description: 'Nous transformons le potentiel en présence professionnelle, du premier casting aux grandes scènes.',
    href: '/casting-formulaire',
    cta: 'Rejoindre l’agence',
  },
  {
    eyebrow: 'Mode · Image · Production',
    title: 'Le Gabon comme scène.',
    accent: 'Le monde comme horizon.',
    description: 'Une vision contemporaine de la mode africaine, construite depuis Libreville et pensée pour circuler.',
    href: '/services',
    cta: 'Voir nos expertises',
  },
  {
    eyebrow: 'PMM Campus',
    title: 'Former aujourd’hui les visages',
    accent: 'de demain.',
    description: 'Posture, discipline, image, culture mode et préparation métier : la progression fait partie du management.',
    href: '/formations',
    cta: 'Explorer la formation',
  },
  {
    eyebrow: 'Perfect Fashion Day',
    title: 'Quand les talents rencontrent',
    accent: 'la création.',
    description: 'Notre rendez-vous signature réunit mannequins, créateurs, partenaires et nouvelles visions de la mode.',
    href: '/fashion-day',
    cta: 'Découvrir Fashion Day',
  },
] as const;

function formatDate(value?: string) {
  if (!value) return 'Date à venir';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function uniqueImages(models: Model[], events: Event[], articles: Article[]) {
  const candidates = [
    ...models.flatMap((model) => [model.imageUrl, ...(model.portfolioImages || [])]),
    ...events.flatMap((event) => [event.coverImageUrl, ...(event.galleryImages || [])]),
    ...articles.map((article) => article.imageUrl),
  ].filter((value): value is string => Boolean(value));
  return Array.from(new Set(candidates));
}

export default function HomeExperience({ models, services, events, articles }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const images = useMemo(() => uniqueImages(models, events, articles), [models, events, articles]);
  const slides = useMemo<HeroSlide[]>(() => HERO_COPY.map((copy, index) => ({
    ...copy,
    image: images[index] || images[index % Math.max(images.length, 1)] || FALLBACK_IMAGE,
  })), [images]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, slides.length]);

  const latestEvent = [...events].sort((a, b) => Number(b.edition) - Number(a.edition))[0];
  const featuredModels = models.slice(0, 6);
  const featuredArticles = articles.slice(0, 3);
  const go = (delta: number) => setActive((current) => (current + delta + slides.length) % slides.length);

  return (
    <main className="overflow-hidden bg-pm-ivory text-pm-ink">
      <section
        className="relative min-h-[calc(100svh-102px)] overflow-hidden bg-pm-ink text-white"
        aria-roledescription="carrousel"
        aria-label="Perfect Models Management"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') go(-1);
          if (event.key === 'ArrowRight') go(1);
        }}
      >
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={`${slide.title}-${slide.image}`}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === active ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
              aria-hidden={index !== active}
            >
              <Image
                src={slide.image}
                alt={index === active ? `Univers Perfect Models Management — ${slide.title}` : ''}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#20171c]/95 via-[#2a1d23]/68 to-[#2a1d23]/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#20171c]/72 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        <div className="relative z-20 mx-auto flex min-h-[calc(100svh-102px)] max-w-[1700px] items-end px-5 pb-14 pt-24 sm:px-8 sm:pb-16 lg:items-center lg:px-12 lg:py-20 xl:px-16">
          <div className="w-full max-w-5xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[.25em] text-pm-gold-light sm:text-xs">{slides[active].eyebrow}</p>
            <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(3.7rem,8vw,8.8rem)] font-semibold leading-[.82] tracking-[-.055em]">
              {slides[active].title}<br />
              <em className="font-normal text-pm-peach">{slides[active].accent}</em>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{slides[active].description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={slides[active].href} className="inline-flex min-h-12 items-center justify-center rounded-full bg-pm-coral px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#e55f43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {slides[active].cta} <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-pm-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Parler à l’agence
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-white/20 bg-black/25 p-2 backdrop-blur-md sm:bottom-8 sm:right-8">
          <button type="button" onClick={() => go(-1)} aria-label="Image précédente" className="grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ArrowLeft size={18} /></button>
          <div className="flex items-center gap-1.5 px-1" aria-label={`Image ${active + 1} sur ${slides.length}`}>
            {slides.map((slide, index) => (
              <button key={slide.title} type="button" onClick={() => setActive(index)} aria-label={`Afficher l’image ${index + 1}`} aria-current={index === active ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${index === active ? 'w-8 bg-pm-gold-light' : 'w-2.5 bg-white/45 hover:bg-white/75'}`} />
            ))}
          </div>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Reprendre le carrousel' : 'Mettre le carrousel en pause'} className="grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{paused ? <Play size={17} /> : <Pause size={17} />}</button>
          <button type="button" onClick={() => go(1)} aria-label="Image suivante" className="grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><ArrowRight size={18} /></button>
        </div>
      </section>

      <section className="bg-pm-paper py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[.55fr_1.45fr] lg:px-12">
          <div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-pm-coral">Notre manifeste</p></div>
          <div>
            <h2 className="max-w-6xl font-playfair text-5xl font-semibold leading-[.92] tracking-[-.045em] sm:text-7xl">Une agence ne devrait pas seulement gérer des profils. <em className="font-normal text-pm-wine">Elle doit construire des trajectoires.</em></h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ['Repérer', 'Identifier la singularité, l’énergie et le potentiel professionnel.'],
                ['Développer', 'Former, cadrer l’image, renforcer la posture et la discipline.'],
                ['Connecter', 'Créer des opportunités avec marques, créateurs, événements et productions.'],
              ].map(([title, body], index) => <article key={title} className={`rounded-[1.8rem] p-7 ${index === 0 ? 'bg-pm-peach' : index === 1 ? 'bg-pm-sage' : 'bg-pm-gold-light/45'}`}><span className="font-playfair text-3xl italic text-pm-wine">0{index + 1}</span><h3 className="mt-8 text-lg font-extrabold">{title}</h3><p className="mt-3 text-sm leading-7 text-pm-ink/62">{body}</p></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5ebdd] py-20 sm:py-28">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-pm-coral">Roster réel · Supabase</p><h2 className="mt-4 font-playfair text-6xl font-semibold tracking-[-.05em] sm:text-8xl">Nos talents.</h2></div><Link href="/mannequins" className="text-sm font-extrabold underline decoration-pm-coral underline-offset-8">Voir tout le roster ↗</Link></div>
          {featuredModels.length ? <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">{featuredModels.map((model, index) => <Link key={model.id} href={`/mannequins/${model.id}`} className="group"><div className={`relative overflow-hidden rounded-[1.6rem] bg-pm-sage ${index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}><Image src={model.imageUrl || model.portfolioImages?.[0] || FALLBACK_IMAGE} alt={model.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]" /></div><div className="mt-4 flex items-start justify-between gap-4"><div><h3 className="font-playfair text-2xl font-semibold">{model.name}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[.12em] text-pm-ink/45">{model.location || 'Libreville'}{model.height ? ` · ${model.height}` : ''}</p></div><span aria-hidden="true" className="text-pm-coral">↗</span></div></Link>)}</div> : <div className="mt-10 rounded-[1.8rem] bg-white p-8 text-pm-ink/55">Aucun mannequin n’est actuellement publié.</div>}
        </div>
      </section>

      <section className="bg-pm-sage py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:px-12">
          <div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-pm-teal">Expertises</p><h2 className="mt-4 font-playfair text-5xl font-semibold leading-[.95] sm:text-7xl">Tout ce qu’une présence professionnelle exige.</h2></div>
          <div className="border-t border-pm-ink/15">{services.slice(0, 7).map((service, index) => <Link key={service.slug} href={`/services/${service.slug}`} className="grid gap-2 border-b border-pm-ink/15 py-6 transition hover:bg-white/25 sm:grid-cols-[3rem_1fr_1.2fr_auto] sm:items-center sm:px-4"><span className="font-playfair text-2xl italic text-pm-wine">0{index + 1}</span><strong className="font-playfair text-2xl font-semibold">{service.title}</strong><span className="text-sm leading-6 text-pm-ink/58">{service.description}</span><span aria-hidden="true" className="text-pm-coral">↗</span></Link>)}</div>
        </div>
      </section>

      {latestEvent && <section className="grid bg-pm-wine text-white lg:grid-cols-2"><div className="relative min-h-[440px] lg:min-h-[680px]"><Image src={latestEvent.coverImageUrl || latestEvent.galleryImages?.[0] || images[1] || FALLBACK_IMAGE} alt={latestEvent.theme || 'Perfect Fashion Day'} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-16"><p className="text-xs font-extrabold uppercase tracking-[.22em] text-pm-gold-light">Perfect Fashion Day · Édition {latestEvent.edition}</p><h2 className="mt-6 font-playfair text-6xl font-semibold leading-[.88] sm:text-8xl">{latestEvent.theme || 'Notre événement signature.'}</h2><p className="mt-6 max-w-xl text-base leading-8 text-white/72">{latestEvent.description}</p><div className="mt-8 flex flex-wrap gap-5 text-sm font-bold text-white/75"><span>{formatDate(latestEvent.date)}</span><span>{latestEvent.location || 'Libreville, Gabon'}</span></div><Link href="/fashion-day" className="mt-9 inline-flex w-fit rounded-full bg-pm-gold-light px-6 py-3 text-sm font-extrabold text-pm-ink">Découvrir l’événement ↗</Link></div></section>}

      {featuredArticles.length > 0 && <section className="bg-pm-paper py-20 sm:py-28"><div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[.22em] text-pm-coral">Journal</p><h2 className="mt-4 font-playfair text-6xl font-semibold sm:text-8xl">Actualités de la maison.</h2></div><Link href="/blog" className="hidden text-sm font-extrabold underline decoration-pm-coral underline-offset-8 sm:block">Tout lire ↗</Link></div><div className="mt-12 grid gap-6 md:grid-cols-3">{featuredArticles.map((article) => <Link key={article.slug} href={`/blog/${article.slug}`} className="group rounded-[1.8rem] bg-pm-ivory p-3"><div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-pm-peach"><Image src={article.imageUrl || images[0] || FALLBACK_IMAGE} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]" /></div><div className="p-4"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-pm-coral">{article.category || 'Magazine'} · {formatDate(article.date)}</p><h3 className="mt-3 font-playfair text-3xl font-semibold leading-tight">{article.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-pm-ink/55">{article.excerpt}</p></div></Link>)}</div></div></section>}

      <section className="bg-pm-coral px-5 py-20 text-center text-white sm:py-28"><div className="mx-auto max-w-5xl"><p className="text-xs font-extrabold uppercase tracking-[.25em] text-white/70">Perfect Models Management</p><h2 className="mt-5 font-playfair text-6xl font-semibold leading-[.9] sm:text-8xl">Votre prochaine étape peut commencer ici.</h2><div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/casting-formulaire" className="rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-pm-coral">Postuler à l’agence</Link><Link href="/contact" className="rounded-full border border-white/45 px-7 py-3.5 text-sm font-extrabold text-white">Nous contacter</Link></div></div></section>
    </main>
  );
}
