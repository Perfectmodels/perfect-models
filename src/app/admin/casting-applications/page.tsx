import { redirect } from 'next/navigation';
import CastingApplicationsManager from '@/components/admin/CastingApplicationsManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const INITIAL_PAGE_SIZE = 20;

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/casting-applications');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'castingApplications')) redirect(profile.role === 'manager' ? '/manager' : '/profil');

  const supabase = createSupabaseAdminClient() as any;
  const { data, error, count } = await supabase
    .from('casting_applications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, INITIAL_PAGE_SIZE - 1);
  if (error) throw new Error(error.message);

  const rows = (Array.isArray(data) ? data : []).map((application: any) => {
    const hasSupabaseAuthInvite = application.credentials_email_status === 'sent_by_supabase_auth';
    if (hasSupabaseAuthInvite) return application;
    return {
      ...application,
      legacy_account_provisioned_at: application.account_provisioned_at || null,
      account_provisioned_at: null,
    };
  });

  return (
    <CastingApplicationsManager
      initialRows={rows}
      initialTotal={Number(count || 0)}
      canProvision={profile.role === 'admin'}
    />
  );
}
