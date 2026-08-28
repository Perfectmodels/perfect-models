import { redirect } from 'next/navigation';
import SupabaseResourceManager from '@/components/admin/SupabaseResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/gallery');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'mediaLibrary')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const definition = RESOURCE_DEFINITIONS.gallery;
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false }).limit(1000);
  if (error) throw new Error(error.message);
  return <SupabaseResourceManager resource="gallery" title="Médiathèque" primaryKey={definition.primaryKey} columns={definition.columns} initialRows={data || []}/>;
}
