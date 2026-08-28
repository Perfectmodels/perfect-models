import { redirect } from 'next/navigation';
import SupabaseResourceManager from '@/components/admin/SupabaseResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasAdminPermission } from '@/lib/auth/admin-access';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/blog');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'magazine')) redirect(profile.role === 'manager' ? '/manager' : '/profil');

  const definition = RESOURCE_DEFINITIONS.magazine;
  const supabase = createSupabaseAdminClient() as any;
  let query = supabase.from(definition.table).select('*').limit(1000);
  if (definition.orderBy) query = query.order(definition.orderBy, { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(`Lecture Supabase ${definition.table}: ${error.message}`);

  return <SupabaseResourceManager resource="magazine" title={definition.title} primaryKey={definition.primaryKey} columns={definition.columns} initialRows={Array.isArray(data) ? data : []} />;
}
