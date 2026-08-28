import { redirect } from 'next/navigation';
import AdminMessagingPage from '@/components/AdminMessagingPage';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/messaging');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'mailing') || !hasAdminPermission(profile, 'messages')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  return <AdminMessagingPage />;
}
