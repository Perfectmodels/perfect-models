import { redirect } from 'next/navigation';
import SiteVisualSettings from '@/components/admin/SiteVisualSettings';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/settings/visuals');
  if (profile.role !== 'admin') redirect(profile.role === 'manager' ? '/manager' : '/profil');

  return <section className="mx-auto max-w-[1500px] text-pm-ink"><SiteVisualSettings /></section>;
}
