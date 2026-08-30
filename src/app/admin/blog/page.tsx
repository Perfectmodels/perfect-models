import { redirect } from 'next/navigation';
import ResponsiveResourceManager from '@/components/admin/ResponsiveResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS } from '@/lib/agency-resource-registry';
import { enhanceAdminFields } from '@/lib/admin-field-options';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasAdminPermission } from '@/lib/auth/admin-access';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 15;

export default async function AdminBlogPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/blog');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'magazine')) redirect(profile.role === 'manager' ? '/manager' : '/profil');

  const definition = RESOURCE_DEFINITIONS.magazine;
  const supabase = createSupabaseAdminClient() as any;
  const fields = enhanceAdminFields('magazine', definition.fields);
  let query = supabase.from(definition.table).select('*', { count: 'exact' });
  if (definition.orderBy) query = query.order(definition.orderBy, { ascending: false });
  const { data, error, count } = await query.range(0, PAGE_SIZE - 1);
  if (error) throw new Error(`Lecture Supabase ${definition.table}: ${error.message}`);

  return <ResponsiveResourceManager resource="magazine" title={definition.title} primaryKey={definition.primaryKey} columns={definition.columns} fields={fields} initialRows={Array.isArray(data) ? data : []} initialTotal={Number(count || 0)} />;
}
