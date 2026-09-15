'use client';

import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_AT_KEY = 'pmm:pwa-install-dismissed-at';
const DISMISS_COOLDOWN = 30 * 24 * 60 * 60 * 1000;

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function recentlyDismissed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) || 0);
    return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN;
  } catch { return false; }
}

export const PWAInstaller: React.FC = () => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const hide = () => { setVisible(false); setPrompt(null); };
    const onInstalled = () => { try { localStorage.removeItem(DISMISSED_AT_KEY); } catch {} hide(); };
    const onDisplayMode = () => { if (isStandalone()) hide(); };
    const onPrompt = (event: Event) => {
      event.preventDefault();
      if (isStandalone() || recentlyDismissed()) return;
      setPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    displayMode.addEventListener?.('change', onDisplayMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      displayMode.removeEventListener?.('change', onDisplayMode);
    };
  }, []);

  if (!visible || !prompt || isStandalone()) return null;

  const install = async () => {
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      try { localStorage.removeItem(DISMISSED_AT_KEY); } catch {}
      setPrompt(null); setVisible(false);
    } else {
      try { localStorage.setItem(DISMISSED_AT_KEY, String(Date.now())); } catch {}
      setVisible(false);
    }
  };

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_AT_KEY, String(Date.now())); } catch {}
    setVisible(false);
  };

  return <div className="fixed bottom-6 left-6 z-50 max-w-xs border border-pm-gold/20 bg-pm-dark p-4 shadow-2xl">
    <p className="mb-3 text-xs font-black uppercase tracking-widest text-white">Installer l'application</p>
    <div className="flex gap-3">
      <button onClick={install} className="btn-premium !px-4 !py-2 !text-[9px]">Installer</button>
      <button onClick={dismiss} className="text-xs text-white/30 transition-colors hover:text-white">Ne plus afficher</button>
    </div>
  </div>;
};
