import { useCallback, useEffect, useRef, useState } from 'react';

type Notice = { title: string; body: string; icon?: string; id: number };
type IntakeItem = { id?: string; firstName?: string; lastName?: string; name?: string; role?: string; status?: string; submissionDate?: string };

const STORAGE_KEY = 'pmm-admin-seen-intake-v1';
const POLL_MS = 20_000;

const asArray = (value: unknown): IntakeItem[] => Array.isArray(value)
  ? value.filter(Boolean) as IntakeItem[]
  : value && typeof value === 'object'
    ? Object.values(value).filter(Boolean) as IntakeItem[]
    : [];

const itemId = (source: string, item: IntakeItem) => `${source}:${String(item.id || `${item.submissionDate || ''}:${item.firstName || item.name || ''}`)}`;

export function usePushNotifications(onNotification?: (notification: Notice) => void) {
  const [state, setState] = useState({
    permission: (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported') as NotificationPermission | 'unsupported',
    token: null as string | null,
    isLoading: false,
  });
  const initialized = useRef(false);

  const subscribe = useCallback(async () => {
    if (!('Notification' in window)) return null;
    setState((current) => ({ ...current, isLoading: true }));
    const permission = await Notification.requestPermission();
    const token = permission === 'granted' ? 'browser-active-session' : null;
    setState({ permission, token, isLoading: false });
    if (permission === 'granted') {
      onNotification?.({ title: 'Notifications activées', body: 'Les nouvelles candidatures seront signalées dans votre espace administrateur.', id: Date.now() });
    }
    return token;
  }, [onNotification]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let stopped = false;

    const readSeen = () => {
      try { return new Set<string>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
      catch { return new Set<string>(); }
    };
    const writeSeen = (seen: Set<string>) => localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seen).slice(-3000)));

    const setBadge = async (count: number) => {
      const nav = navigator as Navigator & { setAppBadge?: (value?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
      try {
        if (count > 0 && nav.setAppBadge) await nav.setAppBadge(count);
        else if (count === 0 && nav.clearAppBadge) await nav.clearAppBadge();
      } catch { /* Badge API is optional. */ }
    };

    const poll = async () => {
      if (stopped || document.visibilityState === 'hidden') return;
      try {
        const [castingResponse, pfdResponse] = await Promise.all([
          fetch('/api/data/castingApplications', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/data/fashionDayApplications', { credentials: 'include', cache: 'no-store' }),
        ]);
        if (!castingResponse.ok || !pfdResponse.ok) return;
        const casting = asArray(await castingResponse.json());
        const pfd = asArray(await pfdResponse.json());
        const all = [
          ...casting.map((item) => ({ source: 'casting', item })),
          ...pfd.map((item) => ({ source: 'pfd', item })),
        ];
        const pending = all.filter(({ item }) => item.status === 'Nouveau');
        await setBadge(pending.length);

        const seen = readSeen();
        if (!initialized.current && seen.size === 0) {
          all.forEach(({ source, item }) => seen.add(itemId(source, item)));
          writeSeen(seen);
          initialized.current = true;
          return;
        }
        initialized.current = true;

        const fresh = all
          .filter(({ source, item }) => !seen.has(itemId(source, item)))
          .sort((a, b) => new Date(a.item.submissionDate || 0).getTime() - new Date(b.item.submissionDate || 0).getTime());

        for (const { source, item } of fresh) {
          const id = itemId(source, item);
          seen.add(id);
          const person = source === 'casting'
            ? `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Un nouveau profil'
            : item.name || 'Un nouveau participant';
          const title = source === 'casting' ? 'Nouvelle candidature mannequin' : 'Nouvelle candidature Perfect Fashion Day';
          const body = source === 'casting' ? `${person} vient de postuler sur le site.` : `${person}${item.role ? ` · ${item.role}` : ''} vient de soumettre sa candidature.`;
          onNotification?.({ title, body, id: Date.now() });
          if (state.permission === 'granted') {
            try {
              new Notification(title, { body, icon: '/icons/icon-192.webp', badge: '/icons/icon-192.webp', tag: id });
            } catch { /* Browser may restrict foreground notifications. */ }
          }
        }
        writeSeen(seen);
      } catch { /* Network polling must never break the admin shell. */ }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), POLL_MS);
    const visible = () => { if (document.visibilityState === 'visible') void poll(); };
    document.addEventListener('visibilitychange', visible);
    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [onNotification, state.permission]);

  return { ...state, subscribe };
}
