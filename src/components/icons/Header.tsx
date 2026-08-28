import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  if (!segments.length) return null;
  const crumbs = segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    path: `/${segments.slice(0, index + 1).join('/')}`,
  }));
  return (
    <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1600px] items-center gap-2 px-5 py-4 text-[8px] font-bold uppercase tracking-[.28em] text-white/25 sm:px-8 lg:px-12">
      <Link to="/" className="transition hover:text-pm-gold">Accueil</Link>
      {crumbs.map((crumb, index) => <React.Fragment key={crumb.path}><span aria-hidden="true">/</span>{index === crumbs.length - 1 ? <span className="text-white/55">{crumb.label}</span> : <Link to={crumb.path} className="transition hover:text-pm-gold">{crumb.label}</Link>}</React.Fragment>)}
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
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const active = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <header className={`sticky top-0 z-50 border-b transition duration-300 ${scrolled ? 'border-white/10 bg-pm-dark/95 shadow-2xl shadow-black/20 backdrop-blur-xl' : 'border-white/10 bg-pm-dark'}`}>
        <div className="mx-auto flex h-[78px] max-w-[1600px] items-center px-5 sm:px-8 lg:px-12">
          <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="Perfect Models Management — Accueil">
            <span className="grid h-10 w-10 place-items-center border border-pm-gold/70 font-playfair text-lg font-semibold text-pm-gold transition group-hover:bg-pm-gold group-hover:text-pm-dark">PM</span>
            <span className="hidden leading-none sm:block"><span className="block font-playfair text-lg font-semibold tracking-[.02em] text-pm-ivory">Perfect Models</span><span className="mt-1 block text-[7px] font-bold uppercase tracking-[.34em] text-white/35">Management · Gabon</span></span>
          </Link>

          <nav className="ml-auto hidden items-center gap-5 xl:flex 2xl:gap-7">
            {NAV_LINKS.map((link) => <Link key={link.path} to={link.path} className={`relative py-2 text-[9px] font-bold uppercase tracking-[.2em] transition ${active(link.path) ? 'text-pm-gold' : 'text-white/52 hover:text-white'}`}><span>{link.label}</span>{active(link.path) && <span className="absolute inset-x-0 -bottom-[1.38rem] h-px bg-pm-gold" />}</Link>)}
          </nav>

          <div className="ml-auto flex items-center xl:ml-7">
            <Link to="/login" className="hidden border-l border-white/10 px-5 py-2 text-[8px] font-bold uppercase tracking-[.22em] text-white/45 transition hover:text-pm-gold sm:block">Espace privé</Link>
            <Link to="/casting-formulaire" className="hidden border border-pm-gold bg-pm-gold px-5 py-3 text-[8px] font-black uppercase tracking-[.22em] text-pm-dark transition hover:bg-pm-ivory lg:inline-flex">Candidater ↗</Link>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="ml-4 grid h-11 w-11 place-items-center border border-white/15 xl:hidden" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
              <span className="relative block h-4 w-5"><span className={`absolute left-0 top-1 h-px w-5 bg-white transition ${menuOpen ? 'translate-y-1 rotate-45' : ''}`} /><span className={`absolute bottom-1 left-0 h-px bg-white transition ${menuOpen ? 'w-5 -translate-y-1 -rotate-45' : 'w-3'}`} /></span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .22 }} className="fixed inset-0 z-40 overflow-y-auto bg-pm-dark px-6 pb-10 pt-28 xl:hidden">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(100,37,58,.45),transparent_36%)]" />
            <nav className="relative mx-auto flex min-h-[calc(100svh-9rem)] max-w-3xl flex-col justify-center">
              {NAV_LINKS.map((link, index) => <motion.div key={link.path} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .045 }} className="border-b border-white/10"><Link to={link.path} className={`flex items-baseline justify-between py-4 font-playfair text-4xl font-semibold sm:text-6xl ${active(link.path) ? 'text-pm-gold' : 'text-pm-ivory'}`}><span>{link.label}</span><span className="font-montserrat text-[8px] font-bold tracking-[.3em] text-white/25">0{index + 1}</span></Link></motion.div>)}
              <div className="mt-8 grid gap-3 sm:grid-cols-2"><Link to="/casting-formulaire" className="pmm-button pmm-button--light">Candidater ↗</Link><Link to="/login" className="pmm-button pmm-button--ghost">Espace privé</Link></div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
