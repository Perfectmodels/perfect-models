'use client';

import { Suspense, type PropsWithChildren } from 'react';
import Providers from './Providers';
import type { AppData } from '@/hooks/useRealtimeDB';

function ShellFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pm-dark">
      <img src="/logo.svg" alt="PMM" className="h-24 w-24 animate-pulse" />
    </div>
  );
}

export default function ClientShell({ children, initialData }: PropsWithChildren<{ initialData?: Partial<AppData> | null }>) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <Providers initialData={initialData}>{children}</Providers>
    </Suspense>
  );
}
