'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { DataProvider, useData } from '@/contexts/DataContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import Layout from '@/components/icons/Layout';
import { PWAInstaller } from '@/components/PWAInstaller';
import { registerServiceWorker } from '@/utils/pwa';
import { notifyAdmin } from '@/utils/adminNotify';
import type { AppData } from '@/hooks/useRealtimeDB';

const PUBLIC_PATHS = ['/', '/agence', '/mannequins', '/fashion-day', '/magazine', '/blog', '/services', '/casting', '/contact', '/galerie'];

function RuntimeEffects() {
  const pathname = usePathname();
  const { data } = useData();
  useAuth();
  const notified = useRef(new Set<string>());

  useEffect(() => { registerServiceWorker(); }, []);
  useEffect(() => {
    if (!pathname || !PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) || notified.current.has(pathname)) return;
    notified.current.add(pathname);
    notifyAdmin('visit', `Page visitée : ${pathname === '/' ? 'Accueil' : pathname.replace(/^\//, '').replace(/-/g, ' ')}`).catch(() => {});
  }, [pathname]);
  useEffect(() => {
    if (!data || !pathname?.startsWith('/admin')) return;
    const n = (data.castingApplications?.filter((i: any) => i.status === 'Nouveau').length || 0)
      + (data.fashionDayApplications?.filter((i: any) => i.status === 'Nouveau').length || 0)
      + (data.recoveryRequests?.filter((i: any) => i.status === 'Nouveau').length || 0)
      + (data.bookingRequests?.filter((i: any) => i.status === 'Nouveau').length || 0)
      + (data.contactMessages?.filter((i: any) => i.status === 'Nouveau').length || 0);
    document.title = n ? `(${n}) Admin | Perfect Models Management` : 'Admin | Perfect Models Management';
  }, [pathname, data]);
  return null;
}

export default function Providers({ children, initialData }: { children: React.ReactNode; initialData?: Partial<AppData> | null }) {
  return (
    <DataProvider initialData={initialData}>
      <AuthProvider>
        <ToastProvider>
          <RuntimeEffects />
          <Layout>{children}</Layout>
          <PWAInstaller />
        </ToastProvider>
      </AuthProvider>
    </DataProvider>
  );
}
