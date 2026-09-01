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
  const crumbs = segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    path: `/${segments.slice(0, index + 1).join('/')}`,
  }));
  return (
    <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1700px] items-center gap-2 border-b border-black/10 px-5 py-3 text-[8px] font-black uppercase tracking-[.2em] text-black/35 sm:px-8 lg:px-12 xl:px-16">
      <Link href="/" className="text-pm-gold-deep transition hover:text-black">Accueil</Link>
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <span className="text-pm-gold/50">/</span>
          {index === crumbs.length - 1 ? <span className="truncate text-black/55">{crumb.label}</span> : <Link href={crumb.path} className="transition hover:text-pm-gold-deep">{crumb.label}</Link>}
        </React.Fragment>
      ))}
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', key);
    };
  }, [menuOpen]);

  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return <>
    <div className="african-trim h-2 w-full bg-black" aria-hidden="true" />
    <header className={`sticky top-0 z-50 border-b border-black/10 transition duration-300 ${scrolled ? 'bg-white/95 shadow-[0_14px_40px_rgba(0,0,0,.08)] backdrop-blur-xl' : 'bg-pm-ivory/95'}`}>
      <div className="mx-auto flex h-[84px] max-w-[1700px] items-center px-5 sm:px-8 lg:px-12 xl:px-16">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Perfect Models Management — Accueil">
          <span className="relative h-12 w-12 overflow-hidden border border-black/15 bg-white p-0.5"><Image src="/logopmm.jpg" alt="" fill sizes="48px" className="object-cover grayscale-[15%] transition duration-500 group-hover:scale-105" /></span>
          <span className="hidden sm:block">
            <span className="block font-playfair text-[21px] font-semibold leading-none tracking-[-.02em] text-black">Perfect Models</span>
            <span className="mt-1.5 block text-[7px] font-black uppercase tracking-[.32em] text-pm-gold-deep">Management · Gabon</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center xl:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => <Link key={link.path} href={link.path} className={`relative px-3.5 py-3 text-[8px] font-black uppercase tracking-[.18em] transition ${active(link.path) ? 'text-black' : 'text-black/48 hover:text-black'}`}>{link.label}{active(link.path) && <span className="absolute inset-x-3 bottom-1 h-px bg-pm-gold" />}</Link>)}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-5">
          <Link href="/inscription/mannequin" className="hidden min-h-11 items-center border border-pm-gold bg-pm-gold px-4 text-[8px] font-black uppercase tracking-[.16em] text-black transition hover:bg-pm-gold-light md:inline-flex">Inscription mannequin</Link>
          <Link href="/login" className="hidden px-3 py-2 text-[8px] font-black uppercase tracking-[.18em] text-black/45 transition hover:text-black sm:block">Espace privé</Link>
          <Link href="/contact?subject=booking" className="hidden min-h-11 items-center border border-black/15 bg-white px-4 text-[8px] font-black uppercase tracking-[.18em] text-black transition hover:border-pm-gold lg:inline-flex">Booking</Link>
          <Link href="/casting-formulaire" className="hidden min-h-11 items-center border border-black bg-black px-4 text-[8px] font-black uppercase tracking-[.18em] text-white transition hover:border-pm-gold hover:text-pm-gold-light lg:inline-flex">Candidater ↗</Link>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-1 grid h-11 w-11 place-items-center border border-black/15 bg-white xl:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
            <span className="relative block h-4 w-5"><span className={`absolute left-0 top-1 h-px w-5 bg-black transition ${menuOpen ? 'translate-y-1 rotate-45' : ''}`} /><span className={`absolute bottom-1 left-0 h-px bg-black transition ${menuOpen ? 'w-5 -translate-y-1 -rotate-45' : 'w-3'}`} /></span>
          </button>
        </div>
      </div>
    </header>

    <AnimatePresence>
      {menuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} className="fixed inset-0 z-40 overflow-y-auto bg-black px-6 pb-10 pt-28 text-white xl:hidden">
        <div aria-hidden="true" className="african-pattern absolute inset-0 opacity-20" />
        <div className="relative mx-auto flex min-h-[calc(100svh-9rem)] max-w-3xl flex-col justify-center">
          <div className="mb-9 flex items-center gap-4 border-y border-pm-gold/35 py-5"><span className="relative h-14 w-14 overflow-hidden border border-white/20 bg-white"><Image src="/logopmm.jpg" alt="" fill sizes="56px" className="object-cover" /></span><div><p className="font-playfair text-2xl font-semibold">Perfect Models Management</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.24em] text-pm-gold-light">Talent · Image · Culture</p></div></div>
          <nav className="grid sm:grid-cols-2">{NAV_LINKS.map((link, index) => <motion.div key={link.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }}><Link href={link.path} className={`flex items-end justify-between border-b border-white/15 px-1 py-5 ${active(link.path) ? 'text-pm-gold-light' : 'text-white'}`}><span className="font-playfair text-3xl font-semibold">{link.label}</span><span className="text-[8px] font-black uppercase tracking-[.2em] text-white/35">0{index + 1}</span></Link></motion.div>)}</nav>
          <div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href="/inscription/mannequin" className="inline-flex min-h-12 items-center justify-center bg-pm-gold px-5 text-[9px] font-black uppercase tracking-[.16em] text-black">Inscription mannequin</Link><Link href="/casting-formulaire" className="inline-flex min-h-12 items-center justify-center border border-white/25 px-5 text-[9px] font-black uppercase tracking-[.16em] text-white">Candidater ↗</Link></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><Link href="/contact?subject=booking" className="inline-flex min-h-12 items-center justify-center border border-pm-gold/45 px-5 text-[9px] font-black uppercase tracking-[.16em] text-pm-gold-light">Booking</Link><Link href="/login" className="inline-flex min-h-12 items-center justify-center border border-white/15 px-5 text-[9px] font-black uppercase tracking-[.16em] text-white/70">Espace privé</Link></div>
        </div>
      </motion.div>}
    </AnimatePresence>
  </>;
}
