'use client';

import type { PropsWithChildren } from 'react';
import Providers from './Providers';

export default function ClientShell({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}
