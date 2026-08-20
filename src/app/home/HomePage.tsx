'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Model = { id: string; name: string; imageUrl?: string; height?: string; gender?: string };
type Service = { slug: string; name: string; description?: string; imageUrl?: string };
type Event = { edition: number; theme: string; date: string; location?: string; description?: string; coverImageUrl?: string };
type Article = { slug: string; title: string; imageUrl?: string; category?: string; date: string };

type Props = { models: Model[]; services: Service[]; events: Event[]; articles: Article[] };

const fallback = 'https://ui-avatars.com/api/?name=Perfect+Models&size=1200&background=0A0A0A&color=D4AF37&bold=true&format=png';

export default function HomePage({ models, services, events, articles }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const featuredModels = models.slice(0, 4);
  const latestEvent = [...events].sort((a, b) => Number(b.edition) - Number(a.edition))[0];
  const upcoming = [...events].filter((event) => new Date(event.date).getTime() > now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const featuredArticles = articles.slice(0, 3);

  return (
    <main className="min-h-screen overflow-hidden bg-pm-dark text-pm-off-white">
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img src={latestEvent?.coverImageUrl || featuredModels[0]?.imageUrl || fallback} alt="Perfect Models Management" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-pm-dark via-transparent to-black/40" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8 lg:px-10 lg:pb-28">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-pm-gold">Perfect Models Management · Libreville, Gabon</p>
          <h1 className="mt-5 max-w-5xl font-playfair text-6xl font-black italic leading-[0.88] text-white sm:text-8xl lg:text-[8.5rem]">Révéler les talents.<br /><span className="text-pm-gold">Créer les images.</span></h1>
          <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">Management, casting, production et image : une structure dédiée aux talents et aux projets qui font avancer la mode gabonaise.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/mannequins" className="rounded-full bg-pm-gold px-7 py-4 text-center text-xs font-black uppercase tracking-[0.22em] text-black transition hover:bg-white">Découvrir nos talents</Link>
            <Link href="/galerie" className="rounded-full border border-white/25 px-7 py-4 text-center text-xs font-black uppercase tracking-[0.22em] text-white transition hover:border-pm-gold hover:text-pm-gold">Voir la galerie</Link>
          </div>
        </div>
        {(upcoming || latestEvent) && <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/50 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10"><div><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">{upcoming ? 'Prochain rendez-vous' : 'À la une'}</p><p className="mt-1 text-sm font-semibold text-white">Perfect Fashion Day — Édition {(upcoming || latestEvent)?.edition} · {(upcoming || latestEvent)?.theme}</p></div><Link href="/fashion-day" className="text-[10px] font-black uppercase tracking-[0.25em] text-pm-gold hover:text-white">Découvrir →</Link></div></div>}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <Header eyebrow="À la une" title="Les histoires qui font Perfect Models." />
        <div className="grid gap-5 lg:grid-cols-[1.45fr_.55fr]">
          <Link href="/fashion-day" className="group relative min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black">
            <img src={latestEvent?.coverImageUrl || featuredModels[0]?.imageUrl || fallback} alt={latestEvent?.theme || 'Perfect Fashion Day'} className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute bottom-0 p-7 sm:p-10"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Perfect Fashion Day · Édition {latestEvent?.edition || 2}</p><h2 className="mt-3 max-w-3xl font-playfair text-4xl font-black italic sm:text-6xl">{latestEvent?.theme || 'L’Art de se Révéler'}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{latestEvent?.description || 'Mode, scénographie, création et talents réunis dans une expérience signature.'}</p></div>
          </Link>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <Link href="/mannequins" className="group rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-pm-gold/40"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Talents</p><p className="mt-4 font-playfair text-3xl font-black">Des visages, des parcours, des possibilités.</p><span className="mt-8 inline-block text-[10px] font-black uppercase tracking-[0.25em] text-white/40 group-hover:text-pm-gold">Voir les mannequins →</span></Link>
            <Link href="/contact?subject=booking" className="group rounded-2xl border border-pm-gold/20 bg-pm-gold/[0.06] p-7 transition hover:bg-pm-gold/10"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Professionnels</p><p className="mt-4 font-playfair text-3xl font-black">Un casting, une campagne ou un défilé ?</p><span className="mt-8 inline-block text-[10px] font-black uppercase tracking-[0.25em] text-pm-gold">Parler à l’agence →</span></Link>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><Header eyebrow="Visages de Perfect Models" title="Nos talents." description="Des profils pour le runway, l’éditorial, la publicité, le e-commerce et les productions événementielles." /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{featuredModels.map((model) => <Link key={model.id} href={`/mannequins/${model.id}`} className="group relative aspect-[3/4] overflow-hidden bg-black"><img src={model.imageUrl || fallback} alt={model.name} className="h-full w-full object-cover grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0" /><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" /><div className="absolute bottom-0 w-full p-5"><p className="font-playfair text-2xl font-black">{model.name}</p><p className="mt-2 text-[9px] font-black uppercase tracking-[0.25em] text-pm-gold">{model.height || 'Model'} {model.gender ? `· ${model.gender}` : ''}</p></div></Link>)}</div><div className="mt-10 text-center"><Link href="/mannequins" className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold hover:text-white">Tous les talents →</Link></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><Header eyebrow="Notre savoir-faire" title="Une structure, quatre expertises." /><div className="grid gap-3 md:grid-cols-2">{services.slice(0, 4).map((service, index) => <Link href={`/services/${service.slug}`} key={service.slug} className="group min-h-[230px] rounded-2xl border border-white/10 bg-white/[0.025] p-7 transition hover:border-pm-gold/30 sm:p-9"><span className="text-xs font-black text-pm-gold/50">0{index + 1}</span><h3 className="mt-8 font-playfair text-3xl font-black">{service.name}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-white/40">{service.description}</p><span className="mt-7 inline-block text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-pm-gold">Découvrir →</span></Link>)}</div></section>

      <section className="border-y border-white/5 bg-black/30 py-20 sm:py-28"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><Header eyebrow="L’événement signature" title="Perfect Fashion Day." /><Link href="/fashion-day" className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold">Explorer toutes les éditions →</Link></div><div className="rounded-2xl border border-pm-gold/20 bg-pm-gold/[0.05] p-8 sm:p-10"><p className="text-[10px] font-black uppercase tracking-[0.35em] text-pm-gold">Édition {latestEvent?.edition || 2}</p><p className="mt-3 font-playfair text-4xl font-black italic sm:text-6xl">{latestEvent?.theme || 'L’Art de se Révéler'}</p><div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/50"><span>{latestEvent ? new Date(latestEvent.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '31 janvier 2026'}</span><span>{latestEvent?.location || 'Libreville, Gabon'}</span></div></div></div></div></section>

      {featuredArticles.length > 0 && <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><Header eyebrow="Magazine" title="Dernières histoires." /><div className="grid gap-5 md:grid-cols-3">{featuredArticles.map((article) => <Link href={`/magazine/${article.slug}`} key={article.slug} className="group"><div className="aspect-[4/5] overflow-hidden bg-black"><img src={article.imageUrl || fallback} alt={article.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><p className="mt-5 text-[9px] font-black uppercase tracking-[0.3em] text-pm-gold">{article.category || 'Magazine'}</p><h3 className="mt-2 font-playfair text-2xl font-bold transition group-hover:text-pm-gold">{article.title}</h3></Link>)}</div><div className="mt-10 text-center"><Link href="/magazine" className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold">Voir le magazine →</Link></div></section>}

      <section className="border-t border-white/10 bg-black py-20 text-center sm:py-28"><div className="mx-auto max-w-4xl px-5"><p className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold">Perfect Models Management</p><h2 className="mt-4 font-playfair text-5xl font-black italic sm:text-7xl">Votre prochain projet commence ici.</h2><p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/40">Booking, casting, campagne, shooting, défilé ou collaboration : construisons une présence mémorable.</p><Link href="/contact" className="mt-9 inline-flex rounded-full bg-pm-gold px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-black transition hover:bg-white">Parler à l’agence</Link></div></section>
    </main>
  );
}

function Header({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="mb-10 sm:mb-14"><p className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold">{eyebrow}</p><h2 className="mt-2 font-playfair text-4xl font-black italic text-white sm:text-6xl">{title}</h2>{description && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">{description}</p>}</div>;
}
