import { redirect } from 'next/navigation';
import SupabaseResourceManager from '@/components/admin/SupabaseResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/fashion-day-events');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'fashionDayEvents')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const definition = RESOURCE_DEFINITIONS['fashion-day-events'];
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from(definition.table).select('*').order('edition', { ascending: false });
  if (error) throw new Error(error.message);
  return <SupabaseResourceManager resource="fashion-day-events" title={definition.title} primaryKey={definition.primaryKey} columns={definition.columns} fields={definition.fields} initialRows={data || []}/>;
}
