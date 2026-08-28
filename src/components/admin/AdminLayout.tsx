'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AcademicCapIcon, Bars3Icon, BellAlertIcon, BellIcon, BellSlashIcon, BookOpenIcon,
  BriefcaseIcon, BuildingStorefrontIcon, CalendarDaysIcon, CalendarIcon, ChatBubbleLeftRightIcon,
  ChevronRightIcon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, Cog6ToothIcon,
  CurrencyDollarIcon, HomeIcon, KeyIcon, MagnifyingGlassIcon, NewspaperIcon, PaintBrushIcon,
  PaperAirplaneIcon, PhotoIcon, PresentationChartLineIcon, SparklesIcon, UsersIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/components/ui/Toast';

type NavigationItem = { to: string; label: string; icon: React.ElementType; description: string };
type NavigationSection = { title: string; items: NavigationItem[] };

const navigation: NavigationSection[] = [
  { title: 'Piloter', items: [
    { to: '/admin', label: 'Vue d’ensemble', icon: HomeIcon, description: 'Priorités et activité' },
    { to: '/admin/models', label: 'Talents', icon: UsersIcon, description: 'Profils et visibilité' },
    { to: '/admin/bookings', label: 'Bookings', icon: BriefcaseIcon, description: 'Demandes clients' },
    { to: '/admin/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon, description: 'Demandes entrantes' },
  ]},
  { title: 'Produire', items: [
    { to: '/admin/fashion-day-events', label: 'Perfect Fashion Day', icon: SparklesIcon, description: 'Éditions et programme' },
    { to: '/admin/casting-applications', label: 'Castings', icon: ClipboardDocumentListIcon, description: 'Candidatures' },
    { to: '/admin/casting-results', label: 'Décisions', icon: ClipboardDocumentCheckIcon, description: 'Résultats jury' },
    { to: '/admin/blog', label: 'Blog', icon: NewspaperIcon, description: 'Publications' },
    { to: '/admin/media-library', label: 'Médiathèque', icon: PhotoIcon, description: 'Fichiers et albums' },
  ]},
  { title: 'Coordonner', items: [
    { to: '/admin/fashion-day-applications', label: 'Candidatures PFD', icon: SparklesIcon, description: 'Talents et participants' },
    { to: '/admin/artistic-direction', label: 'Direction artistique', icon: PaintBrushIcon, description: 'Briefs de production' },
    { to: '/admin/payments', label: 'Finances', icon: CurrencyDollarIcon, description: 'Paiements' },
    { to: '/admin/absences', label: 'Présences', icon: CalendarIcon, description: 'Suivi équipe' },
    { to: '/admin/classroom-progress', label: 'Progression', icon: PresentationChartLineIcon, description: 'Parcours formation' },
    { to: '/formations', label: 'Formation', icon: AcademicCapIcon, description: 'Contenu pédagogique' },
  ]},
  { title: 'Gérer', items: [
    { to: '/admin/model-access', label: 'Accès', icon: KeyIcon, description: 'Comptes et droits' },
    { to: '/admin/recovery-requests', label: 'Récupérations', icon: KeyIcon, description: 'Demandes de compte' },
    { to: '/admin/comments', label: 'Modération', icon: ChatBubbleLeftRightIcon, description: 'Commentaires' },
    { to: '/admin/mailing', label: 'Mailing', icon: PaperAirplaneIcon, description: 'Campagnes email' },
    { to: '/admin/agency', label: 'Agence', icon: BuildingStorefrontIcon, description: 'Informations publiques' },
    { to: '/admin/settings', label: 'Réglages', icon: Cog6ToothIcon, description: 'Configuration Supabase' },
  ]},
];

const isActivePath = (pathname: string, to: string) => to === '/admin' ? pathname === '/admin' : pathname === to || pathname.startsWith(`${to}/`);
const titleFromPath = (pathname: string) => navigation.flatMap(section => section.items).find(entry => isActivePath(pathname, entry.to))?.label || 'Administration';

function NavigationList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return <nav className="space-y-8" aria-label="Navigation administration">
    {navigation.map(section => <section key={section.title}>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-pm-gold/50">{section.title}</p>
      <div className="space-y-1">{section.items.map(({ to, label, icon: Icon, description }) => {
        const active = isActivePath(pathname, to);
        return <Link key={to} href={to} onClick={onNavigate} title={description} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? 'bg-pm-gold text-[#1d1607] shadow-[0_8px_20px_rgba(181,138,42,0.16)]' : 'text-white/55 hover:bg-white/[0.055] hover:text-pm-off-white'}`}>
          <Icon className="h-4 w-4 shrink-0"/><span className="min-w-0 flex-1 truncate font-medium">{label}</span><ChevronRightIcon className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70"/>
        </Link>;
      })}</div>
    </section>)}
  </nav>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/admin';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const { info } = useToast();
  const handleNotification = useCallback((notification: { title: string; body: string }) => info(`${notification.title} — ${notification.body}`), [info]);
  const { permission, isLoading, subscribe } = usePushNotifications(handleNotification);
  const searchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return term ? navigation.flatMap(section => section.items).filter(item => `${item.label} ${item.description}`.toLocaleLowerCase('fr').includes(term)) : [];
  }, [query]);
  const requestNotifications = async () => { if (permission !== 'granted') await subscribe(); };

  return <div className="min-h-screen bg-[#0f0d0a] text-pm-off-white selection:bg-pm-gold selection:text-[#1d1607]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] border-r border-white/[0.07] bg-[#15110c]/95 px-5 py-6 lg:flex lg:flex-col">
      <Link href="/admin" className="mb-9 flex items-center gap-3 px-3"><span className="grid h-10 w-10 place-items-center rounded-lg border border-pm-gold/40 bg-pm-gold/[0.08] font-playfair text-sm font-black text-pm-gold-light">PMM</span><span><strong className="block font-playfair text-[1.05rem] text-pm-off-white">Maison PMM</strong><small className="block text-[9px] font-bold uppercase tracking-[0.18em] text-pm-gold/55">Administration</small></span></Link>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1"><NavigationList pathname={pathname}/></div>
      <div className="mt-5 border-t border-white/[0.07] pt-4"><Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-white/35 transition hover:text-pm-gold-light"><BookOpenIcon className="h-4 w-4"/>Voir le site public</Link></div>
    </aside>

    <div className="min-w-0 lg:pl-[17.5rem]">
      <header className="sticky top-0 z-20 flex h-[4.5rem] items-center gap-3 border-b border-white/[0.07] bg-[#0f0d0a]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
        <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg text-white/65 hover:bg-white/[0.06] lg:hidden" aria-label="Ouvrir la navigation"><Bars3Icon className="h-5 w-5"/></button>
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pm-gold/60">Espace équipe</p><h1 className="truncate font-playfair text-lg font-bold">{titleFromPath(pathname)}</h1></div>
        <button onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:border-pm-gold/35 hover:text-pm-gold-light sm:flex"><MagnifyingGlassIcon className="h-4 w-4"/>Rechercher</button>
        <button onClick={() => void requestNotifications()} disabled={isLoading || permission === 'denied'} className={`grid h-10 w-10 place-items-center rounded-lg transition ${permission === 'granted' ? 'bg-pm-gold/[0.12] text-pm-gold-light' : 'text-white/45 hover:bg-white/[0.06]'} disabled:opacity-40`} title="Notifications">{isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-pm-gold/30 border-t-pm-gold"/> : permission === 'granted' ? <BellIcon className="h-5 w-5"/> : permission === 'denied' ? <BellSlashIcon className="h-5 w-5"/> : <BellAlertIcon className="h-5 w-5"/>}</button>
        <div className="hidden border-l border-white/[0.08] pl-3 sm:block"><p className="max-w-28 truncate text-xs font-semibold">{user?.displayName || 'Équipe PMM'}</p><p className="text-[9px] uppercase tracking-[0.16em] text-pm-gold/60">{user?.role || 'admin'}</p></div>
      </header>
      <main className="mx-auto w-full max-w-[1700px] px-4 py-7 sm:px-6 lg:px-9 xl:px-12">{children}</main>
    </div>

    <AnimatePresence>{mobileOpen && <><motion.button aria-label="Fermer" className="fixed inset-0 z-40 bg-black/70 lg:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMobileOpen(false)}/><motion.aside className="fixed inset-y-0 left-0 z-50 w-[min(19rem,85vw)] overflow-y-auto border-r border-white/[0.08] bg-[#15110c] px-5 py-6 lg:hidden" initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}}><div className="mb-8 flex items-center justify-between"><span className="font-playfair text-xl font-bold">Maison PMM</span><button onClick={() => setMobileOpen(false)}><XMarkIcon className="h-5 w-5"/></button></div><NavigationList pathname={pathname} onNavigate={() => setMobileOpen(false)}/></motion.aside></>}</AnimatePresence>

    <AnimatePresence>{searchOpen && <motion.div className="fixed inset-0 z-[60] grid place-items-start bg-black/75 p-4 pt-[12vh] backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={() => setSearchOpen(false)}><motion.div className="w-full max-w-xl overflow-hidden rounded-xl border border-pm-gold/25 bg-[#18130d] shadow-2xl" initial={{y:12,opacity:0}} animate={{y:0,opacity:1}} onMouseDown={event => event.stopPropagation()}><div className="flex items-center gap-3 border-b border-white/[0.08] px-4"><MagnifyingGlassIcon className="h-5 w-5 text-pm-gold"/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une fonctionnalité…" className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none"/><button onClick={() => setSearchOpen(false)} className="text-xs text-white/40">Fermer</button></div><div className="max-h-[50vh] overflow-y-auto p-2">{searchResults.length ? searchResults.map(item => <Link key={item.to} href={item.to} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-pm-gold/[0.1]"><item.icon className="h-4 w-4 text-pm-gold"/><span className="flex-1"><b className="block text-sm">{item.label}</b><small className="text-xs text-white/35">{item.description}</small></span><ChevronRightIcon className="h-4 w-4 text-white/30"/></Link>) : <p className="px-3 py-8 text-center text-sm text-white/35">Saisissez le nom d’un module.</p>}</div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
