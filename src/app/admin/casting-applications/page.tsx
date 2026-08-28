import { redirect } from 'next/navigation';
import CastingAccountProvisioner from '@/components/admin/CastingAccountProvisioner';
import SupabaseResourceManager from '@/components/admin/SupabaseResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/casting-applications');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'castingApplications')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const definition = RESOURCE_DEFINITIONS['casting-applications'];
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from(definition.table).select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return <><SupabaseResourceManager resource="casting-applications" title={definition.title} primaryKey={definition.primaryKey} columns={definition.columns} initialRows={data || []}/>{profile.role === 'admin' && <CastingAccountProvisioner />}</>;
}
