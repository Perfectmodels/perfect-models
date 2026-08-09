'use client';

import dynamic from 'next/dynamic';
import type { PropsWithChildren } from 'react';

const Providers = dynamic(() => import('./Providers'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-pm-dark">
      <img src="/logo.svg" alt="PMM" className="h-24 w-24 animate-pulse" />
    </div>
  ),
});

export default function ClientShell({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}
