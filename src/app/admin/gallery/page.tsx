import { redirect } from 'next/navigation';
import ResponsiveResourceManager from '@/components/admin/ResponsiveResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS } from '@/lib/agency-resource-registry';
import { enhanceAdminFields } from '@/lib/admin-field-options';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 15;

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/gallery');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'mediaLibrary')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const definition = RESOURCE_DEFINITIONS.gallery;
  const supabase = createSupabaseAdminClient() as any;
  const fields = enhanceAdminFields('gallery', definition.fields);
  const { data, error, count } = await supabase.from(definition.table).select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  return <ResponsiveResourceManager resource="gallery" title="Médiathèque" primaryKey={definition.primaryKey} columns={definition.columns} fields={fields} initialRows={data || []} initialTotal={Number(count || 0)}/>;
}
