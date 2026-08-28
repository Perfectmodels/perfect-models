'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import Layout from '@/components/icons/Layout';
import { PWAInstaller } from '@/components/PWAInstaller';
import { registerServiceWorker } from '@/utils/pwa';

const PUBLIC_PATHS = ['/', '/agence', '/mannequins', '/fashion-day', '/magazine', '/blog', '/services', '/casting', '/contact', '/galerie'];

type RuntimeData = {
  navLinks?: Array<{ path: string; label: string; inFooter?: boolean; footerLabel?: string }>;
  socialLinks?: Record<string, string>;
  contactInfo?: { email?: string; phone?: string; address?: string };
};

function RuntimeEffects() {
  const pathname = usePathname();
  useAuth();
  const notified = useRef(new Set<string>());

  useEffect(() => { registerServiceWorker(); }, []);
  useEffect(() => {
    if (!pathname || !PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) || notified.current.has(pathname)) return;
    notified.current.add(pathname);
    void fetch('/api/analytics', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'page_view', path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}

export default function Providers({ children, initialData }: { children: React.ReactNode; initialData?: RuntimeData | null }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <RuntimeEffects />
        <Layout runtimeData={initialData}>{children}</Layout>
        <PWAInstaller />
      </ToastProvider>
    </AuthProvider>
  );
}
