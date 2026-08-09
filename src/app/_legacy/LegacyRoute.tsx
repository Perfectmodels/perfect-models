'use client';

import type { ComponentType } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { legacyPages, type LegacyPageName } from './registry';
import type { UserRole } from '@/contexts/AuthContext';

export default function LegacyRoute({ component, role }: { component: LegacyPageName; role?: UserRole }) {
  const Component = legacyPages[component] as ComponentType;
  const content = <Component />;
  return role ? <ProtectedRoute role={role}>{content}</ProtectedRoute> : content;
}
