'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Images,
  LayoutDashboard,
  Menu,
  UserRoundPen,
} from 'lucide-react';

const items = [
  { href: '/profil', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/profil/edition', label: 'Mes informations & médias', icon: UserRoundPen },
  { href: '/profil/comp-card', label: 'Ma Comp Card', icon: Images },
  { href: '/profil/agency', label: 'Carrière & agence', icon: BriefcaseBusiness },
  { href: '/profil/classroom', label: 'Classroom', icon: BookOpen },
  { href: '/profil/formation', label: 'Formation', icon: GraduationCap },
] as const;

function activeFor(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavItems({ pathname, compact = false }: { pathname: string; compact?: boolean }) {
  return (
    <nav aria-label="Navigation espace mannequin" className={compact ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-2'}>
      {items.map((item) => {
        const Icon = item.icon;
        const exact = 'exact' in item ? item.exact : false;
        const active = activeFor(pathname, item.href, exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition ${
              active
                ? 'bg-pm-wine text-white shadow-[0_12px_30px_rgba(125,31,77,.18)]'
                : 'bg-white/70 text-pm-ink/65 hover:bg-pm-peach hover:text-pm-wine'
            }`}
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? 'bg-white/12' : 'bg-pm-ivory'}`}>
              <Icon size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words leading-5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden min-w-0 border-r border-pm-ink/10 bg-white/75 lg:block">
        <div className="sticky top-0 flex h-screen min-w-0 flex-col overflow-y-auto p-5 xl:p-6">
          <div className="rounded-[1.7rem] bg-pm-ink p-5 text-white">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-pm-gold text-pm-ink">
              <BadgeCheck size={20} aria-hidden="true" />
            </span>
            <p className="mt-5 text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">Espace mannequin</p>
            <p className="mt-2 font-playfair text-2xl font-semibold leading-tight">Mon espace professionnel</p>
            <p className="mt-3 text-xs leading-5 text-white/50">Profil, médias, composite, carrière et formation au même endroit.</p>
          </div>
          <div className="mt-5 min-w-0"><NavItems pathname={pathname} /></div>
          <p className="mt-auto pt-6 text-[10px] leading-5 text-pm-ink/35">Perfect Models Management · Portail talent</p>
        </div>
      </aside>

      <div className="min-w-0 border-b border-pm-ink/10 bg-white/80 p-3 lg:hidden">
        <details className="group min-w-0 rounded-2xl border border-pm-ink/10 bg-pm-ivory">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-black text-pm-ink marker:content-none">
            <span className="flex min-w-0 items-center gap-3"><Menu size={18} className="shrink-0 text-pm-wine"/><span className="min-w-0 break-words">Menu de mon espace</span></span>
            <span className="shrink-0 text-[9px] uppercase tracking-[.12em] text-pm-ink/40 group-open:hidden">Ouvrir</span>
            <span className="hidden shrink-0 text-[9px] uppercase tracking-[.12em] text-pm-ink/40 group-open:inline">Fermer</span>
          </summary>
          <div className="border-t border-pm-ink/10 p-3"><NavItems pathname={pathname} compact /></div>
        </details>
      </div>
    </>
  );
}
