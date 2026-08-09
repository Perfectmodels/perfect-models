import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    path: '/' + segments.slice(0, index + 1).join('/'),
  }));

  return (
    <nav className="max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
      <Link to="/" className="hover:text-pm-gold transition-colors">Accueil</Link>
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <span className="text-white/10">›</span>
          {index === crumbs.length - 1 ? (
            <span className="text-pm-gold">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-pm-gold transition-colors capitalize">{crumb.label}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const NAV_LINKS = [
  { path: '/agence', label: 'Agence' },
  { path: '/mannequins', label: 'Mannequins' },
  { path: '/fashion-day', label: 'Fashion Day' },
  { path: '/casting', label: 'Casting' },
  { path: '/services', label: 'Services' },
  { path: '/magazine', label: 'Magazine' },
  { path: '/galerie', label: 'Galerie' },
  { path: '/contact', label: 'Contact' },
];

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-pm-dark/95 backdrop-blur-xl border-b border-white/5 py-3' : 'py-4 sm:py-6'}`}>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="relative">
              <span className="absolute inset-0 rounded-full border-2 border-pm-gold/60 scale-110 group-hover:scale-125 group-hover:border-pm-gold transition-all duration-500" />
              <span className="absolute inset-0 rounded-full border border-pm-gold/20 scale-125 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700" />
              <img src="/logopmm.jpg" alt="Perfect Models Management" className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-pm-gold/40 shadow-lg shadow-pm-gold/10 transition-all duration-500 group-hover:border-pm-gold group-hover:shadow-pm-gold/30 group-hover:scale-105" />
            </div>
            <span className="font-playfair font-black text-xs sm:text-sm tracking-widest text-white/70 group-hover:text-pm-gold transition-colors duration-300 uppercase">PMM</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} className={`text-[10px] font-black uppercase tracking-[0.25em] xl:tracking-[0.3em] transition-colors duration-300 relative group ${isActive(link.path) ? 'text-pm-gold' : 'text-white/50 hover:text-white'}`}>
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-px bg-pm-gold transition-all duration-500 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/casting-formulaire" className="hidden sm:inline-block btn-premium text-white !text-[9px] !py-2.5 !px-5">Rejoindre</Link>
            <button onClick={() => setMenuOpen(value => !value)} className="lg:hidden flex flex-col gap-1.5 p-2 -mr-1 group" aria-label="Menu" aria-expanded={menuOpen}>
              <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px w-6 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-40 bg-pm-dark/98 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 lg:hidden overflow-y-auto py-20">
            {NAV_LINKS.map((link, index) => (
              <motion.div key={link.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Link to={link.path} className={`text-xl sm:text-2xl font-playfair font-black tracking-tight transition-colors ${isActive(link.path) ? 'text-pm-gold' : 'text-white/60 hover:text-white'}`}>{link.label}</Link>
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-4">
              <Link to="/casting-formulaire" className="btn-premium text-white">Rejoindre l'agence</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
