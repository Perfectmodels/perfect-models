import { redirect } from 'next/navigation';
import ModelClaimReview from '@/components/admin/ModelClaimReview';
import PaginatedResourceManager from '@/components/admin/PaginatedResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS } from '@/lib/resource-registry';
import { enhanceAdminFields } from '@/lib/admin-field-options';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const INITIAL_PAGE_SIZE = 25;

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/model-access');
  if (profile.role !== 'admin') redirect('/profil');
  const definition = RESOURCE_DEFINITIONS.models;
  const fields = enhanceAdminFields('models', definition.fields);
  const supabase = createSupabaseAdminClient() as any;
  const [{ data, error, count }, { data: claims, error: claimsError }] = await Promise.all([
    supabase.from('models').select('*', { count: 'exact' }).order(definition.orderBy, { ascending: false, nullsFirst: false }).range(0, INITIAL_PAGE_SIZE - 1),
    supabase.from('models').select('id,name,username,image_url,claim_status,raw_data').eq('claim_status', 'pending_agency_review').order('updated_at', { ascending: false }),
  ]);
  if (error) throw new Error(error.message);
  if (claimsError) throw new Error(claimsError.message);
  return <><ModelClaimReview initialClaims={Array.isArray(claims) ? claims : []}/><PaginatedResourceManager resource="models" title="Accès & comptes mannequins" primaryKey={definition.primaryKey} columns={definition.columns} fields={fields} initialRows={Array.isArray(data) ? data : []} initialTotal={Number(count || 0)} canCreate={definition.canCreate} canDelete={definition.canDelete}/></>;
}
