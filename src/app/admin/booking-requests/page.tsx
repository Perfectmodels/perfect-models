import { redirect } from 'next/navigation';
import BookingRequestQueue from '@/components/admin/BookingRequestQueue';
import PaginatedResourceManager from '@/components/admin/PaginatedResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS } from '@/lib/agency-resource-registry';
import { enhanceAdminFields } from '@/lib/admin-field-options';
import { hydrateAdminRelationOptions } from '@/lib/admin-relation-options';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function BookingRequestsPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/booking-requests');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'bookings')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const definition = RESOURCE_DEFINITIONS['booking-requests'];
  const [{ data, error, count }, { data: queue }, { data: models }] = await Promise.all([
    supabase.from('booking_requests').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(0,24),
    supabase.from('booking_requests').select('*').neq('status','converted').order('created_at', { ascending: false }).limit(20),
    supabase.from('models').select('id,name').eq('is_active',true),
  ]);
  if (error) throw new Error(error.message);
  const modelMap = new Map((models || []).map((model: any) => [String(model.id), String(model.name)]));
  const queueRows = (queue || []).map((row: any) => ({ ...row, modelName: row.model_id ? modelMap.get(String(row.model_id)) || null : null }));
  const fields = await hydrateAdminRelationOptions(supabase, enhanceAdminFields('booking-requests', definition.fields));
  return <div><BookingRequestQueue initialRows={queueRows}/><PaginatedResourceManager resource="booking-requests" title="Toutes les demandes de booking" primaryKey={definition.primaryKey} columns={definition.columns} fields={fields} initialRows={data || []} initialTotal={Number(count || 0)} canCreate={false} canDelete={definition.canDelete}/></div>;
}
