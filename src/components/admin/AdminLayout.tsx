import React, { useCallback, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  AcademicCapIcon,
  Bars3Icon,
  BellAlertIcon,
  BellIcon,
  BellSlashIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  HomeIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PaintBrushIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PresentationChartLineIcon,
  SparklesIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useToast } from '../ui/Toast';

type NavigationItem = { to: string; label: string; icon: React.ElementType; description: string };
type NavigationSection = { title: string; items: NavigationItem[] };

const navigation: NavigationSection[] = [
  {
    title: 'Piloter',
    items: [
      { to: '/admin', label: 'Vue d’ensemble', icon: HomeIcon, description: 'Priorités et activité' },
      { to: '/admin/models', label: 'Talents', icon: UsersIcon, description: 'Profils et visibilité' },
      { to: '/admin/bookings', label: 'Bookings', icon: BriefcaseIcon, description: 'Demandes clients' },
      { to: '/admin/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon, description: 'Demandes entrantes' },
    ],
  },
  {
    title: 'Produire',
    items: [
      { to: '/admin/fashion-day-events', label: 'Perfect Fashion Day', icon: SparklesIcon, description: 'Éditions et programme' },
      { to: '/admin/casting-applications', label: 'Castings', icon: ClipboardDocumentListIcon, description: 'Candidatures' },
      { to: '/admin/casting-results', label: 'Décisions', icon: ClipboardDocumentCheckIcon, description: 'Résultats jury' },
      { to: '/admin/magazine', label: 'Magazine', icon: NewspaperIcon, description: 'Publications' },
      { to: '/admin/news', label: 'Actualités', icon: CalendarDaysIcon, description: 'Annonces courtes' },
      { to: '/admin/media-library', label: 'Médiathèque', icon: PhotoIcon, description: 'Fichiers et albums' },
    ],
  },
  {
    title: 'Coordonner',
    items: [
      { to: '/admin/fashion-day-applications', label: 'Candidatures PFD', icon: SparklesIcon, description: 'Talents et participants' },
      { to: '/admin/artistic-direction', label: 'Direction artistique', icon: PaintBrushIcon, description: 'Briefs de production' },
      { to: '/admin/payments', label: 'Finances', icon: CurrencyDollarIcon, description: 'Paiements' },
      { to: '/admin/absences', label: 'Présences', icon: CalendarIcon, description: 'Suivi équipe' },
      { to: '/admin/classroom-progress', label: 'Progression', icon: PresentationChartLineIcon, description: 'Parcours formation' },
      { to: '/formation', label: 'Formation', icon: AcademicCapIcon, description: 'Contenu pédagogique' },
    ],
  },
  {
    title: 'Gérer',
    items: [
      { to: '/admin/model-access', label: 'Accès', icon: KeyIcon, description: 'Comptes et droits' },
      { to: '/admin/recovery-requests', label: 'Récupérations', icon: KeyIcon, description: 'Demandes de compte' },
      { to: '/admin/comments', label: 'Modération', icon: ChatBubbleLeftRightIcon, description: 'Commentaires' },
      { to: '/admin/mailing', label: 'Mailing', icon: PaperAirplaneIcon, description: 'Campagnes email' },
      { to: '/admin/agency', label: 'Agence', icon: BuildingStorefrontIcon, description: 'Informations publiques' },
      { to: '/admin/settings', label: 'Réglages', icon: Cog6ToothIcon, description: 'Configuration' },
    ],
  },
];

const titleFromPath = (pathname: string) => {
  const item = navigation.flatMap(section => section.items).find(entry => entry.to === pathname);
  return item?.label || 'Administration';
};

const NavigationList: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => (
  <nav className="space-y-8" aria-label="Navigation administration">
    {navigation.map(section => (
      <section key={section.title}>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-pm-gold/50">{section.title}</p>
        <div className="space-y-1">
          {section.items.map(({ to, label, icon: Icon, description }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={onNavigate}
              title={description}
              className={({ isActive }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-pm-gold text-[#1d1607] shadow-[0_8px_20px_rgba(181,138,42,0.16)]'
                  : 'text-white/55 hover:bg-white/[0.055] hover:text-pm-off-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
              <ChevronRightIcon className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70" />
            </NavLink>
          ))}
        </div>
      </section>
    ))}
  </nav>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const { user } = useAuth();
  const { info } = useToast();
  const handleNotification = useCallback((notification: { title: string; body: string }) => info(`${notification.title} — ${notification.body}`), [info]);
  const { permission, isLoading, subscribe } = usePushNotifications(handleNotification);

  const searchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return term ? navigation.flatMap(section => section.items).filter(item => `${item.label} ${item.description}`.toLocaleLowerCase('fr').includes(term)) : [];
  }, [query]);

  const requestNotifications = async () => {
    if (permission !== 'granted') await subscribe();
  };

  return (
    <div className="min-h-screen bg-[#0f0d0a] text-pm-off-white selection:bg-pm-gold selection:text-[#1d1607]">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-70 [background-image:radial-gradient(circle_at_14%_0%,rgba(181,138,42,0.13),transparent_28rem),radial-gradient(circle_at_92%_16%,rgba(129,91,21,0.11),transparent_24rem)]" />

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] border-r border-white/[0.07] bg-[#15110c]/95 px-5 py-6 lg:flex lg:flex-col">
        <Link to="/admin" className="mb-9 flex items-center gap-3 px-3" aria-label="Retour au tableau de bord">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-pm-gold/40 bg-pm-gold/[0.08] font-playfair text-sm font-black text-pm-gold-light">PMM</span>
          <span>
            <strong className="block font-playfair text-[1.05rem] leading-tight text-pm-off-white">Maison PMM</strong>
            <small className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-pm-gold/55">Administration</small>
          </span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
          <NavigationList />
        </div>
        <div className="mt-5 border-t border-white/[0.07] pt-4">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-white/35 transition hover:text-pm-gold-light"><BookOpenIcon className="h-4 w-4" /> Voir le site public</Link>
        </div>
      </aside>

      <div className="relative z-10 min-w-0 lg:pl-[17.5rem]">
        <header className="sticky top-0 z-20 flex h-[4.5rem] items-center gap-3 border-b border-white/[0.07] bg-[#0f0d0a]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg text-white/65 hover:bg-white/[0.06] lg:hidden" aria-label="Ouvrir la navigation"><Bars3Icon className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pm-gold/60">Espace équipe</p>
            <h1 className="truncate font-playfair text-lg font-bold text-pm-off-white">{titleFromPath(location.pathname)}</h1>
          </div>
          <button onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:border-pm-gold/35 hover:text-pm-gold-light sm:flex" aria-label="Rechercher un module">
            <MagnifyingGlassIcon className="h-4 w-4" /><span>Rechercher</span><kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[9px]">⌘ K</kbd>
          </button>
          <button onClick={() => void requestNotifications()} disabled={isLoading || permission === 'denied'} className={`grid h-10 w-10 place-items-center rounded-lg transition ${permission === 'granted' ? 'bg-pm-gold/[0.12] text-pm-gold-light' : 'text-white/45 hover:bg-white/[0.06] hover:text-pm-gold-light'} disabled:cursor-not-allowed disabled:opacity-40`} title={permission === 'granted' ? 'Notifications activées' : 'Activer les notifications'}>
            {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-pm-gold/30 border-t-pm-gold" /> : permission === 'granted' ? <BellIcon className="h-5 w-5" /> : permission === 'denied' ? <BellSlashIcon className="h-5 w-5" /> : <BellAlertIcon className="h-5 w-5" />}
          </button>
          <div className="hidden min-w-0 border-l border-white/[0.08] pl-3 sm:block">
            <p className="max-w-28 truncate text-xs font-semibold text-pm-off-white">{user?.displayName || 'Équipe PMM'}</p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-pm-gold/60">{user?.role || 'admin'}</p>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1700px] px-4 py-7 sm:px-6 sm:py-9 lg:px-9 xl:px-12">{children}</main>
      </div>

      <AnimatePresence>
        {mobileOpen && <>
          <motion.button aria-label="Fermer la navigation" className="fixed inset-0 z-40 bg-black/70 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
          <motion.aside className="fixed inset-y-0 left-0 z-50 w-[min(19rem,85vw)] overflow-y-auto border-r border-white/[0.08] bg-[#15110c] px-5 py-6 lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}>
            <div className="mb-8 flex items-center justify-between"><span className="font-playfair text-xl font-bold text-pm-off-white">Maison PMM</span><button onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg text-white/55 hover:bg-white/[0.06]"><XMarkIcon className="h-5 w-5" /></button></div>
            <NavigationList onNavigate={() => setMobileOpen(false)} />
          </motion.aside>
        </>}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && <motion.div className="fixed inset-0 z-[60] grid place-items-start bg-black/75 p-4 pt-[12vh] backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setSearchOpen(false)}>
          <motion.div className="w-full max-w-xl overflow-hidden rounded-xl border border-pm-gold/25 bg-[#18130d] shadow-2xl" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-4"><MagnifyingGlassIcon className="h-5 w-5 text-pm-gold" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une fonctionnalité…" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-pm-off-white outline-none placeholder:text-white/30" /><button onClick={() => setSearchOpen(false)} className="text-xs text-white/40">Échap</button></div>
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {searchResults.length ? searchResults.map(item => <Link key={item.to} to={item.to} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-pm-gold/[0.1]"><item.icon className="h-4 w-4 text-pm-gold" /><span className="flex-1"><b className="block text-sm text-pm-off-white">{item.label}</b><small className="text-xs text-white/35">{item.description}</small></span><ChevronRightIcon className="h-4 w-4 text-white/30" /></Link>) : <p className="px-3 py-8 text-center text-sm text-white/35">Saisissez le nom d’un module pour le trouver.</p>}
            </div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
