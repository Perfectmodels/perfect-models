import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ClassroomServicesPage from '@/components/classroom/ClassroomServicesPage';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const metadata: Metadata = { title: 'Classroom — Vie d’agence | PMM', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/classroom/services');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');
  return <ClassroomServicesPage />;
}
