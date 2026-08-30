'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BellIcon, CheckIcon, InboxIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

const POLL_MS = 30_000;

function relativeDate(value: string) {
  const date = new Date(value);
  const delta = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(delta / 60_000));
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} j`;
  return new Intl.DateTimeFormat('fr-GA', { day: '2-digit', month: 'short' }).format(date);
}

export default function NotificationCenter() {
  const pathname = usePathname() || '/';
  const { user, loading } = useAuth();
  const { error: toastError } = useToast();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState(false);

  const enabled = !loading && Boolean(user) && (
    pathname.startsWith('/admin') || pathname.startsWith('/manager') || pathname.startsWith('/profil')
  );
  const isBackOffice = pathname.startsWith('/admin') || pathname.startsWith('/manager');

  const load = useCallback(async (quiet = true) => {
    if (!enabled) return;
    if (!quiet) setBusy(true);
    try {
      const response = await fetch('/api/notifications?limit=30', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Notifications indisponibles.');
      setItems(Array.isArray(payload.notifications) ? payload.notifications : []);
      setUnread(Number(payload.unread || 0));
    } catch (cause) {
      if (!quiet) toastError(cause instanceof Error ? cause.message : 'Notifications indisponibles.');
    } finally {
      if (!quiet) setBusy(false);
    }
  }, [enabled, toastError]);

  useEffect(() => {
    if (!enabled) return;
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, POLL_MS);
    const refresh = () => void load();
    window.addEventListener('pmm-notifications-changed', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pmm-notifications-changed', refresh);
    };
  }, [enabled, load]);

  const markRead = useCallback(async (id: string) => {
    const current = items.find((item) => item.id === id);
    if (!current || current.is_read) return;
    setItems((list) => list.map((item) => item.id === id ? { ...item, is_read: true } : item));
    setUnread((value) => Math.max(0, value - 1));
    const response = await fetch('/api/notifications', {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).catch(() => null);
    if (!response?.ok) void load();
  }, [items, load]);

  const markAll = async () => {
    if (!unread) return;
    setBusy(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Mise à jour impossible.');
      setItems((list) => list.map((item) => ({ ...item, is_read: true })));
      setUnread(0);
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : 'Mise à jour impossible.');
    } finally {
      setBusy(false);
    }
  };

  const visibleItems = useMemo(() => items.slice(0, 30), [items]);
  if (!enabled) return null;

  const Icon = isBackOffice ? InboxIcon : BellIcon;
  return <div className="fixed bottom-5 right-4 z-[80] sm:bottom-6 sm:right-6">
    {open && <div className="absolute bottom-14 right-0 w-[min(92vw,25rem)] overflow-hidden rounded-[1.6rem] border border-pm-ink/10 bg-white shadow-[0_26px_80px_rgba(37,24,32,.22)]">
      <div className="flex items-start justify-between gap-4 border-b border-pm-ink/10 bg-pm-ivory px-5 py-4">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-pm-coral">Centre de notifications</p><h2 className="mt-1 font-playfair text-2xl font-bold text-pm-ink">Vos alertes PMM</h2></div>
        <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-pm-ink/45 hover:bg-pm-peach" aria-label="Fermer les notifications"><XMarkIcon className="h-5 w-5" /></button>
      </div>
      <div className="flex items-center justify-between gap-3 border-b border-pm-ink/10 px-5 py-3">
        <p className="text-xs font-semibold text-pm-ink/55">{unread ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}</p>
        <button type="button" disabled={!unread || busy} onClick={() => void markAll()} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[10px] font-black uppercase tracking-[.08em] text-pm-wine hover:bg-pm-peach disabled:opacity-35"><CheckIcon className="h-4 w-4" />Tout lire</button>
      </div>
      <div className="max-h-[min(65vh,32rem)] overflow-y-auto">
        {!visibleItems.length ? <div className="px-6 py-10 text-center"><BellIcon className="mx-auto h-7 w-7 text-pm-ink/25"/><p className="mt-3 text-sm font-semibold text-pm-ink/55">Aucune notification pour le moment.</p><p className="mt-1 text-xs leading-5 text-pm-ink/40">Les informations importantes de votre espace apparaîtront ici.</p></div> : visibleItems.map((item) => <a key={item.id} href={item.href || '#'} onClick={(event) => {
          if (!item.href) event.preventDefault();
          void markRead(item.id);
          if (item.href) setOpen(false);
        }} className={`block border-b border-pm-ink/[.07] px-5 py-4 transition last:border-b-0 hover:bg-pm-peach/45 ${item.is_read ? 'bg-white' : 'bg-pm-peach/25'}`}>
          <div className="flex items-start gap-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.is_read ? 'bg-pm-ink/15' : 'bg-pm-coral'}`} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="text-sm font-extrabold leading-5 text-pm-ink">{item.title}</p><time className="shrink-0 text-[10px] font-semibold text-pm-ink/35">{relativeDate(item.created_at)}</time></div>{item.body && <p className="mt-1.5 text-xs leading-5 text-pm-ink/55">{item.body}</p>}</div></div>
        </a>)}
      </div>
    </div>}
    <button type="button" onClick={() => { setOpen((value) => !value); if (!open) void load(false); }} className="relative grid h-12 w-12 place-items-center rounded-full bg-pm-wine text-white shadow-[0_12px_34px_rgba(80,25,55,.28)] transition hover:-translate-y-0.5 hover:bg-pm-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pm-coral" aria-label={unread ? `Notifications, ${unread} non lues` : 'Notifications'} aria-expanded={open}>
      <Icon className="h-5 w-5" />
      {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-pm-coral px-1 text-[9px] font-black text-white ring-2 ring-pm-ivory">{unread > 99 ? '99+' : unread}</span>}
    </button>
  </div>;
}
