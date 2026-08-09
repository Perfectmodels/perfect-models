'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { DataProvider, useData } from '@/contexts/DataContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import Layout from '@/components/icons/Layout';
import { PWAInstaller } from '@/components/PWAInstaller';
import { registerServiceWorker } from '@/utils/pwa';
import { restoreFcmSession } from '@/utils/fcmService';
import { notifyAdmin } from '@/utils/adminNotify';
import { useCapacitor } from '@/hooks/useCapacitor';
import { initNativePush } from '@/utils/nativePush';

const PUBLIC_PATHS = ['/', '/agence', '/mannequins', '/fashion-day', '/magazine', '/services', '/casting', '/contact'];

function RuntimeEffects() {
  const pathname = usePathname();
  const { data } = useData();
  const { user } = useAuth();
  const { isNative } = useCapacitor();
  const notifiedPaths = useRef(new Set<string>());

  useEffect(() => {
    if (isNative) initNativePush();
    else registerServiceWorker();
  }, [isNative]);

  useEffect(() => {
    if (user?.role === 'admin') restoreFcmSession().catch(() => {});
  }, [user?.role]);

  useEffect(() => {
    if (!pathname) return;
    if (!PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return;
    if (notifiedPaths.current.has(pathname)) return;
    notifiedPaths.current.add(pathname);
    const pageName = pathname === '/' ? 'Accueil' : pathname.replace(/^\//, '').replace(/-/g, ' ');
    notifyAdmin('visit', `Page visitée : ${pageName}`).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const originalTitle = 'Perfect Models Management';
    if (data && pathname?.startsWith('/admin')) {
      const totalNotifications =
        (data.castingApplications?.filter((item) => item.status === 'Nouveau').length || 0) +
        (data.fashionDayApplications?.filter((item) => item.status === 'Nouveau').length || 0) +
        (data.recoveryRequests?.filter((item) => item.status === 'Nouveau').length || 0) +
        (data.bookingRequests?.filter((item) => item.status === 'Nouveau').length || 0) +
        (data.contactMessages?.filter((item) => item.status === 'Nouveau').length || 0);
      document.title = totalNotifications > 0 ? `(${totalNotifications}) Admin | ${originalTitle}` : `Admin | ${originalTitle}`;
      if ('clearAppBadge' in navigator) (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {});
      navigator.serviceWorker?.ready
        .then((registration) => registration.active?.postMessage({ type: 'CLEAR_BADGE' }))
        .catch(() => {});
    }
    return () => {
      if (document.title.startsWith('(') || document.title.startsWith('Admin |')) document.title = originalTitle;
    };
  }, [pathname, data]);

  useEffect(() => {
    if (!data?.apiKeys?.dropboxAccessToken) return;
    import('@/utils/dropboxService').then(({ dropboxService }) => {
      dropboxService.updateToken(data.apiKeys.dropboxAccessToken!);
    });
  }, [data?.apiKeys?.dropboxAccessToken]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
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
