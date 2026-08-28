'use client';

import React, { useEffect, useState } from 'react';
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
    <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1700px] items-center gap-2 px-5 py-4 text-[8px] font-bold uppercase tracking-[.26em] text-white/28 sm:px-8 lg:px-12 xl:px-16">
      <Link href="/" className="transition hover:text-pm-gold">Accueil</Link>
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <span aria-hidden="true">/</span>
          {index === crumbs.length - 1 ? <span className="text-white/55">{crumb.label}</span> : <Link href={crumb.path} className="transition hover:text-pm-gold">{crumb.label}</Link>}
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
  { path: '/magazine', label: 'Journal' },
  { path: '/contact', label: 'Contact' },
];

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() || '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth >= 1280) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      <header className={`sticky top-0 z-50 border-b transition duration-500 ${scrolled ? 'border-white/10 bg-pm-dark/94 shadow-[0_18px_50px_rgba(0,0,0,.18)] backdrop-blur-2xl' : 'border-white/8 bg-pm-dark'}`}>
        <div className="mx-auto flex h-[78px] max-w-[1700px] items-center px-5 sm:px-8 lg:px-12 xl:px-16">
          <Link href="/" className="group flex shrink-0 items-center gap-3.5" aria-label="Perfect Models Management — Accueil">
            <span className="relative h-11 w-11 overflow-hidden border border-white/12 bg-white">
              <img src="/logopmm.jpg" alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block font-playfair text-[19px] font-semibold tracking-[-.015em] text-pm-ivory">Perfect Models</span>
              <span className="mt-1.5 block text-[7px] font-black uppercase tracking-[.34em] text-white/32">Management · Gabon</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-5 xl:flex 2xl:gap-7">
            {NAV_LINKS.map((link) => (
              <Link key={link.path} href={link.path} className={`relative py-2 text-[8px] font-black uppercase tracking-[.2em] transition duration-300 ${active(link.path) ? 'text-pm-gold-light' : 'text-white/48 hover:text-white'}`}>
                <span>{link.label}</span>
                <span className={`absolute inset-x-0 -bottom-[1.45rem] h-px origin-left bg-pm-gold transition-transform duration-300 ${active(link.path) ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center xl:ml-7">
            <Link href="/login" className="hidden border-l border-white/10 px-5 py-2 text-[8px] font-black uppercase tracking-[.2em] text-white/38 transition hover:text-pm-gold sm:block">Espace privé</Link>
            <Link href="/contact?subject=booking" className="hidden border border-pm-gold/55 px-5 py-3 text-[8px] font-black uppercase tracking-[.22em] text-pm-gold-light transition hover:border-pm-gold hover:bg-pm-gold hover:text-pm-dark lg:inline-flex">Booking</Link>
            <Link href="/casting-formulaire" className="hidden border border-pm-gold bg-pm-gold px-5 py-3 text-[8px] font-black uppercase tracking-[.22em] text-pm-dark transition hover:bg-pm-ivory lg:ml-2 lg:inline-flex">Candidater ↗</Link>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-4 grid h-11 w-11 place-items-center border border-white/15 xl:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
              <span className="relative block h-4 w-5">
                <span className={`absolute left-0 top-1 h-px w-5 bg-white transition ${menuOpen ? 'translate-y-1 rotate-45' : ''}`} />
                <span className={`absolute bottom-1 left-0 h-px bg-white transition ${menuOpen ? 'w-5 -translate-y-1 -rotate-45' : 'w-3'}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .22 }} className="fixed inset-0 z-40 overflow-y-auto bg-pm-dark px-6 pb-10 pt-28 xl:hidden">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(100,37,58,.48),transparent_38%)]" />
            <div aria-hidden="true" className="absolute -bottom-10 left-0 font-playfair text-[34vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">PMM</div>
            <nav className="relative mx-auto flex min-h-[calc(100svh-9rem)] max-w-3xl flex-col justify-center">
              {NAV_LINKS.map((link, index) => (
                <motion.div key={link.path} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .045 }} className="border-b border-white/10">
                  <Link href={link.path} className={`flex items-baseline justify-between py-4 font-playfair text-4xl font-semibold tracking-[-.03em] sm:text-6xl ${active(link.path) ? 'text-pm-gold-light' : 'text-pm-ivory'}`}>
                    <span>{link.label}</span>
                    <span className="font-montserrat text-[8px] font-black tracking-[.3em] text-white/22">0{index + 1}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Link href="/casting-formulaire" className="pmm-button pmm-button--light">Candidater ↗</Link>
                <Link href="/contact?subject=booking" className="pmm-button pmm-button--ghost">Booking</Link>
              </div>
              <Link href="/login" className="mt-6 text-[8px] font-black uppercase tracking-[.28em] text-white/35">Espace privé ↗</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
