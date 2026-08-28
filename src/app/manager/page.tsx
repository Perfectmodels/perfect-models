import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/manager');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  redirect('/admin');
}
