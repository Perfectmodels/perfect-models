'use client';

import { Suspense, type PropsWithChildren } from 'react';
import Providers from './Providers';

type RuntimeData = {
  navLinks?: Array<{ path: string; label: string; inFooter?: boolean; footerLabel?: string }>;
  socialLinks?: Record<string, string>;
  contactInfo?: { email?: string; phone?: string; address?: string };
};

function ShellFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-pm-ivory">
      <img src="/logo.svg" alt="PMM" className="h-24 w-24 animate-pulse" />
    </div>
  );
}

export default function ClientShell({ children, initialData }: PropsWithChildren<{ initialData?: RuntimeData | null }>) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <Providers initialData={initialData}>{children}</Providers>
    </Suspense>
  );
}
