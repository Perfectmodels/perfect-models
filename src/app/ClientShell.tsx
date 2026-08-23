'use client';

import { Suspense, type PropsWithChildren } from 'react';
import Providers from './Providers';

function ShellFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pm-dark">
      <img src="/logo.svg" alt="PMM" className="h-24 w-24 animate-pulse" />
    </div>
  );
}

export default function ClientShell({ children }: PropsWithChildren) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <Providers>{children}</Providers>
    </Suspense>
  );
}
