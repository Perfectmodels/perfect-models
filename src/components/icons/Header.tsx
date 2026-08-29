'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export const Breadcrumb: React.FC = () => {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return null;
  const crumbs = segments.map((segment, index) => ({ label: segment.replace(/-/g, ' '), path: `/${segments.slice(0, index + 1).join('/')}` }));
  return (
    <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1700px] items-center gap-2 px-5 py-3 text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/35 sm:px-8 lg:px-12 xl:px-16">
      <Link href="/" className="rounded-full bg-pm-peach/70 px-3 py-1.5 text-pm-wine transition hover:bg-pm-peach">Accueil</Link>
      {crumbs.map((crumb, index) => <React.Fragment key={crumb.path}><span>/</span>{index === crumbs.length - 1 ? <span className="truncate text-pm-ink/60">{crumb.label}</span> : <Link href={crumb.path} className="transition hover:text-pm-coral">{crumb.label}</Link>}</React.Fragment>)}
    </nav>
  );
};

const NAV_LINKS = [
  { path: '/agence', label: 'Agence' },
  { path: '/mannequins', label: 'Talents' },
  { path: '/services', label: 'Expertises' },
  { path: '/fashion-day', label: 'Fashion Day' },
  { path: '/blog', label: 'Journal' },
  { path: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', key); };
  }, [menuOpen]);

  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return <>
    <div className="brand-gradient h-1.5 w-full" />
    <header className={`sticky top-0 z-50 border-b transition duration-500 ${scrolled ? 'border-pm-ink/10 bg-pm-ivory/88 shadow-[0_18px_55px_rgba(91,46,37,.1)] backdrop-blur-2xl' : 'border-pm-ink/8 bg-pm-ivory/95'}`}>
      <div className="mx-auto flex h-[82px] max-w-[1700px] items-center px-5 sm:px-8 lg:px-12 xl:px-16">
        <Link href="/" className="group flex shrink-0 items-center gap-3.5" aria-label="Perfect Models Management — Accueil">
          <span className="relative h-12 w-12 overflow-hidden rounded-[1.1rem] border border-pm-wine/10 bg-white shadow-[0_8px_25px_rgba(125,31,77,.12)]"><Image src="/logopmm.jpg" alt="" fill sizes="48px" className="object-cover transition duration-500 group-hover:scale-105" /></span>
          <span className="hidden leading-none sm:block"><span className="block font-playfair text-[20px] font-semibold tracking-[-.02em] text-pm-ink">Perfect Models</span><span className="mt-1.5 block text-[7px] font-black uppercase tracking-[.3em] text-pm-wine/58">Management · Gabon</span></span>
        </Link>

        <nav className="ml-auto hidden items-center rounded-full border border-pm-ink/8 bg-white/70 px-2 py-1.5 shadow-sm xl:flex">
          {NAV_LINKS.map((link) => <Link key={link.path} href={link.path} className={`rounded-full px-3.5 py-2.5 text-[8px] font-black uppercase tracking-[.17em] transition ${active(link.path) ? 'bg-pm-wine text-white shadow-sm' : 'text-pm-ink/52 hover:bg-pm-peach hover:text-pm-wine'}`}>{link.label}</Link>)}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-5">
          <Link href="/login" className="hidden px-3 py-2 text-[8px] font-black uppercase tracking-[.18em] text-pm-ink/42 hover:text-pm-wine sm:block">Espace privé</Link>
          <Link href="/contact?subject=booking" className="hidden rounded-full border border-pm-wine/18 bg-pm-peach/65 px-4 py-3 text-[8px] font-black uppercase tracking-[.18em] text-pm-wine transition hover:bg-pm-gold-light lg:inline-flex">Booking</Link>
          <Link href="/casting-formulaire" className="hidden rounded-full bg-pm-coral px-4 py-3 text-[8px] font-black uppercase tracking-[.18em] text-white shadow-[0_10px_28px_rgba(242,95,75,.2)] transition hover:bg-pm-berry lg:inline-flex">Candidater ↗</Link>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-1 grid h-11 w-11 place-items-center rounded-full border border-pm-ink/12 bg-white xl:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}><span className="relative block h-4 w-5"><span className={`absolute left-0 top-1 h-px w-5 bg-pm-ink transition ${menuOpen ? 'translate-y-1 rotate-45' : ''}`} /><span className={`absolute bottom-1 left-0 h-px bg-pm-ink transition ${menuOpen ? 'w-5 -translate-y-1 -rotate-45' : 'w-3'}`} /></span></button>
        </div>
      </div>
    </header>

    <AnimatePresence>
      {menuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .22 }} className="fixed inset-0 z-40 overflow-y-auto bg-pm-ivory px-6 pb-10 pt-28 xl:hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(255,200,87,.55),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(189,230,208,.55),transparent_32%),radial-gradient(circle_at_80%_78%,rgba(230,76,120,.25),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-[calc(100svh-9rem)] max-w-3xl flex-col justify-center">
          <div className="mb-8 flex items-center gap-3 rounded-[1.4rem] bg-pm-wine p-4 text-white shadow-lg"><span className="relative h-14 w-14 overflow-hidden rounded-xl bg-white"><Image src="/logopmm.jpg" alt="" fill sizes="56px" className="object-cover" /></span><div><p className="font-playfair text-2xl font-semibold">Perfect Models Management</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.22em] text-pm-gold-light">Talent · Image · Culture</p></div></div>
          <nav className="grid gap-2 sm:grid-cols-2">{NAV_LINKS.map((link, index) => <motion.div key={link.path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}><Link href={link.path} className={`flex items-end justify-between rounded-[1.3rem] p-5 ${active(link.path) ? 'bg-pm-wine text-white' : index % 4 === 0 ? 'bg-pm-peach' : index % 4 === 1 ? 'bg-pm-mint' : index % 4 === 2 ? 'bg-pm-lilac' : 'bg-pm-gold-light/70'}`}><span className="font-playfair text-3xl font-semibold">{link.label}</span><span className="text-[8px] font-black uppercase tracking-[.2em] opacity-45">0{index + 1}</span></Link></motion.div>)}</nav>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><Link href="/casting-formulaire" className="pmm-button border-pm-coral bg-pm-coral text-white">Candidater ↗</Link><Link href="/contact?subject=booking" className="pmm-button border-pm-ink/15 bg-white text-pm-ink">Booking</Link></div>
          <Link href="/login" className="mt-6 text-[8px] font-black uppercase tracking-[.25em] text-pm-wine/60">Espace privé ↗</Link>
        </div>
      </motion.div>}
    </AnimatePresence>
  </>;
}
