'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AcademicCapIcon, Bars3Icon, BellAlertIcon, BellIcon, BellSlashIcon, BookOpenIcon,
  BriefcaseIcon, BuildingStorefrontIcon, CalendarIcon, ChatBubbleLeftRightIcon,
  ChevronRightIcon, ClipboardDocumentCheckIcon, ClipboardDocumentListIcon, Cog6ToothIcon,
  CurrencyDollarIcon, HomeIcon, KeyIcon, MagnifyingGlassIcon, NewspaperIcon, PaintBrushIcon,
  PaperAirplaneIcon, PhotoIcon, PresentationChartLineIcon, SparklesIcon, UsersIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/components/ui/Toast';
import type { AdminPagePermissions } from '@/types';

type PermissionKey = keyof AdminPagePermissions;
type NavigationItem = { to: string; label: string; icon: React.ElementType; description: string; permission?: PermissionKey; adminOnly?: boolean };
type NavigationSection = { title: string; items: NavigationItem[] };

const navigation: NavigationSection[] = [
  { title: 'Piloter', items: [
    { to: '/admin', label: 'Tour de contrôle', icon: HomeIcon, description: 'Priorités et activité', permission: 'dashboard', adminOnly: true },
    { to: '/admin/models', label: 'Talents', icon: UsersIcon, description: 'Profils et visibilité', permission: 'models' },
    { to: '/admin/bookings', label: 'Bookings', icon: BriefcaseIcon, description: 'Demandes clients', permission: 'bookings' },
    { to: '/admin/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon, description: 'Demandes entrantes', permission: 'messages' },
  ]},
  { title: 'Produire', items: [
    { to: '/admin/fashion-day-events', label: 'Perfect Fashion Day', icon: SparklesIcon, description: 'Éditions et programme', permission: 'fashionDayEvents' },
    { to: '/admin/casting-applications', label: 'Castings', icon: ClipboardDocumentListIcon, description: 'Candidatures', permission: 'castingApplications' },
    { to: '/admin/casting-results', label: 'Décisions', icon: ClipboardDocumentCheckIcon, description: 'Résultats jury', permission: 'castingResults' },
    { to: '/admin/blog', label: 'Journal', icon: NewspaperIcon, description: 'Publications', permission: 'magazine' },
    { to: '/admin/media-library', label: 'Médiathèque', icon: PhotoIcon, description: 'Fichiers et albums', permission: 'mediaLibrary' },
  ]},
  { title: 'Accompagner', items: [
    { to: '/admin/artistic-direction', label: 'Direction artistique', icon: PaintBrushIcon, description: 'Briefs de production', permission: 'artisticDirection' },
    { to: '/admin/payments', label: 'Finances', icon: CurrencyDollarIcon, description: 'Paiements mannequins', permission: 'payments' },
    { to: '/admin/absences', label: 'Présences', icon: CalendarIcon, description: 'Suivi équipe', permission: 'absences' },
    { to: '/admin/classroom-progress', label: 'Progression', icon: PresentationChartLineIcon, description: 'Parcours de formation', permission: 'classroomProgress' },
    { to: '/admin/classroom', label: 'Classroom', icon: AcademicCapIcon, description: 'Contenu pédagogique', permission: 'classroom' },
  ]},
  { title: 'Administrer', items: [
    { to: '/admin/model-access', label: 'Accès & rôles', icon: KeyIcon, description: 'Comptes et droits', permission: 'modelAccess', adminOnly: true },
    { to: '/admin/recovery-requests', label: 'Récupérations', icon: KeyIcon, description: 'Demandes de compte', permission: 'recovery', adminOnly: true },
    { to: '/admin/mailing', label: 'Mailing', icon: PaperAirplaneIcon, description: 'Campagnes email', permission: 'mailing', adminOnly: true },
    { to: '/admin/agency', label: 'Agence', icon: BuildingStorefrontIcon, description: 'Informations publiques', permission: 'agency', adminOnly: true },
    { to: '/admin/settings', label: 'Réglages', icon: Cog6ToothIcon, description: 'Configuration Supabase', permission: 'settings', adminOnly: true },
  ]},
];

const isActivePath = (pathname: string, to: string) => to === '/admin' ? pathname === '/admin' : pathname === to || pathname.startsWith(`${to}/`);
const titleFromPath = (pathname: string) => pathname === '/manager' ? 'Espace manager' : navigation.flatMap(section => section.items).find(entry => isActivePath(pathname, entry.to))?.label || 'Maison PMM';

function allowed(item: NavigationItem, role?: string, permissions?: AdminPagePermissions) {
  if (role !== 'manager') return true;
  if (item.adminOnly) return false;
  if (item.to === '/admin/messages') return Boolean(permissions?.messages && permissions?.mailing);
  return item.permission ? Boolean(permissions?.[item.permission]) : false;
}

function NavigationList({ pathname, role, permissions, onNavigate }: { pathname: string; role?: string; permissions?: AdminPagePermissions; onNavigate?: () => void }) {
  const sections = navigation.map(section => ({ ...section, items: section.items.filter(item => allowed(item, role, permissions)) })).filter(section => section.items.length);
  return <nav className="space-y-7" aria-label="Navigation de gestion">
    {role === 'manager' && <section><p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[.22em] text-pm-wine/45">Mon espace</p><Link href="/manager" onClick={onNavigate} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${pathname === '/manager' ? 'bg-pm-coral text-white shadow-[0_12px_28px_rgba(239,112,84,.22)]' : 'text-pm-ink/58 hover:bg-pm-peach hover:text-pm-ink'}`}><HomeIcon className="h-4 w-4"/><span className="min-w-0 flex-1 font-semibold">Vue manager</span><ChevronRightIcon className="h-3.5 w-3.5"/></Link></section>}
    {sections.map(section => <section key={section.title}>
      <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[.22em] text-pm-wine/45">{section.title}</p>
      <div className="space-y-1">{section.items.map(({ to, label, icon: Icon, description }) => {
        const active = isActivePath(pathname, to);
        return <Link key={to} href={to} onClick={onNavigate} title={description} className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${active ? 'bg-pm-ink text-white shadow-[0_12px_28px_rgba(37,27,32,.16)]' : 'text-pm-ink/58 hover:bg-pm-peach hover:text-pm-ink'}`}>
          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-pm-gold-light' : 'text-pm-wine/55'}`}/><span className="min-w-0 flex-1 truncate font-semibold">{label}</span><ChevronRightIcon className="h-3.5 w-3.5 opacity-35 transition group-hover:translate-x-0.5 group-hover:opacity-80"/>
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
  const isManager = user?.role === 'manager' || pathname === '/manager';
  const homePath = isManager ? '/manager' : '/admin';
  const handleNotification = useCallback((notification: { title: string; body: string }) => info(`${notification.title} — ${notification.body}`), [info]);
  const { permission, isLoading, subscribe } = usePushNotifications(handleNotification);
  const searchResults = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return term ? navigation.flatMap(section => section.items).filter(item => allowed(item, user?.role, user?.adminPermissions) && `${item.label} ${item.description}`.toLocaleLowerCase('fr').includes(term)) : [];
  }, [query, user?.role, user?.adminPermissions]);
  const requestNotifications = async () => { if (permission !== 'granted') await subscribe(); };

  return <div className="min-h-screen bg-[#F7EFE6] text-pm-ink selection:bg-pm-coral selection:text-white">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[18rem] border-r border-pm-ink/[.08] bg-pm-paper/95 px-5 py-6 lg:flex lg:flex-col">
      <Link href={homePath} className="mb-8 flex items-center gap-3 rounded-2xl px-3 py-2"><span className="grid h-11 w-11 place-items-center rounded-full bg-pm-wine font-playfair text-sm font-black text-white shadow-lg">PMM</span><span><strong className="block font-playfair text-lg text-pm-ink">Maison PMM</strong><small className="block text-[8px] font-black uppercase tracking-[.2em] text-pm-coral">{isManager ? 'Management' : 'Administration'}</small></span></Link>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1"><NavigationList pathname={pathname} role={user?.role} permissions={user?.adminPermissions}/></div>
      <div className="mt-5 border-t border-pm-ink/[.08] pt-4"><Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-pm-ink/45 transition hover:bg-pm-peach hover:text-pm-wine"><BookOpenIcon className="h-4 w-4"/>Voir le site public</Link></div>
    </aside>

    <div className="min-w-0 lg:pl-[18rem]">
      <header className="sticky top-0 z-20 flex h-[4.75rem] items-center gap-3 border-b border-pm-ink/[.08] bg-[#F7EFE6]/88 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
        <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-pm-ink/65 hover:bg-pm-peach lg:hidden" aria-label="Ouvrir la navigation"><Bars3Icon className="h-5 w-5"/></button>
        <div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[.2em] text-pm-coral">{isManager ? 'Accompagnement des talents' : 'Pilotage en temps réel'}</p><h1 className="truncate font-playfair text-xl font-bold">{titleFromPath(pathname)}</h1></div>
        <button onClick={() => setSearchOpen(true)} className="hidden items-center gap-2 rounded-full border border-pm-ink/[.09] bg-white/65 px-4 py-2.5 text-xs font-semibold text-pm-ink/45 transition hover:border-pm-coral/35 hover:text-pm-wine sm:flex"><MagnifyingGlassIcon className="h-4 w-4"/>Rechercher</button>
        <button onClick={() => void requestNotifications()} disabled={isLoading || permission === 'denied'} className={`grid h-10 w-10 place-items-center rounded-full transition ${permission === 'granted' ? 'bg-pm-peach text-pm-wine' : 'text-pm-ink/45 hover:bg-white'} disabled:opacity-40`} title="Notifications">{isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-pm-coral/30 border-t-pm-coral"/> : permission === 'granted' ? <BellIcon className="h-5 w-5"/> : permission === 'denied' ? <BellSlashIcon className="h-5 w-5"/> : <BellAlertIcon className="h-5 w-5"/>}</button>
        <div className="hidden border-l border-pm-ink/[.08] pl-3 sm:block"><p className="max-w-32 truncate text-xs font-bold">{user?.displayName || 'Équipe PMM'}</p><p className="text-[8px] font-black uppercase tracking-[.16em] text-pm-coral">{user?.role || (isManager ? 'manager' : 'admin')}</p></div>
      </header>
      <main className="mx-auto w-full max-w-[1700px] px-4 py-7 sm:px-6 lg:px-9 xl:px-12">{children}</main>
    </div>

    <AnimatePresence>{mobileOpen && <><motion.button aria-label="Fermer" className="fixed inset-0 z-40 bg-pm-ink/45 backdrop-blur-sm lg:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMobileOpen(false)}/><motion.aside className="fixed inset-y-0 left-0 z-50 w-[min(19rem,88vw)] overflow-y-auto border-r border-pm-ink/[.08] bg-pm-paper px-5 py-6 lg:hidden" initial={{x:'-100%'}} animate={{x:0}} exit={{x:'-100%'}}><div className="mb-8 flex items-center justify-between"><span className="font-playfair text-xl font-bold">Maison PMM</span><button onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-pm-peach"><XMarkIcon className="h-5 w-5"/></button></div><NavigationList pathname={pathname} role={user?.role} permissions={user?.adminPermissions} onNavigate={() => setMobileOpen(false)}/></motion.aside></>}</AnimatePresence>

    <AnimatePresence>{searchOpen && <motion.div className="fixed inset-0 z-[60] grid place-items-start bg-pm-ink/50 p-4 pt-[12vh] backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={() => setSearchOpen(false)}><motion.div className="w-full max-w-xl overflow-hidden rounded-[1.7rem] border border-pm-ink/10 bg-pm-paper shadow-2xl" initial={{y:12,opacity:0}} animate={{y:0,opacity:1}} onMouseDown={event => event.stopPropagation()}><div className="flex items-center gap-3 border-b border-pm-ink/[.08] px-5"><MagnifyingGlassIcon className="h-5 w-5 text-pm-coral"/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher une fonctionnalité…" className="h-16 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-pm-ink/30"/><button onClick={() => setSearchOpen(false)} className="text-xs font-bold text-pm-ink/40">Fermer</button></div><div className="max-h-[50vh] overflow-y-auto p-3">{searchResults.length ? searchResults.map(item => <Link key={item.to} href={item.to} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-pm-peach"><item.icon className="h-4 w-4 text-pm-coral"/><span className="flex-1"><b className="block text-sm">{item.label}</b><small className="text-xs text-pm-ink/40">{item.description}</small></span><ChevronRightIcon className="h-4 w-4 text-pm-ink/30"/></Link>) : <p className="px-3 py-8 text-center text-sm text-pm-ink/35">Saisissez le nom d’un module.</p>}</div></motion.div></motion.div>}</AnimatePresence>
  </div>;
}
