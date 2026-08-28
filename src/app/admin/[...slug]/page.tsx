import { notFound, redirect } from 'next/navigation';
import PaginatedResourceManager from '@/components/admin/PaginatedResourceManager';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS, type ResourceName } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasResourcePermission } from '@/lib/auth/admin-access';

export const dynamic = 'force-dynamic';

const ROUTES: Record<string, ResourceName> = {
  models: 'models',
  'model-access': 'models',
  'casting-applications': 'casting-applications',
  'casting-results': 'casting-applications',
  bookings: 'bookings',
  absences: 'absences',
  agency: 'content',
  'artistic-direction': 'photoshoot-briefs',
  'beauty-contests': 'beauty-contests',
  classroom: 'courses',
  'classroom-progress': 'course-progress',
  comments: 'comments',
  'fashion-day-applications': 'fashion-day-applications',
  'fashion-day-events': 'fashion-day-events',
  gallery: 'gallery',
  'media-library': 'gallery',
  mailing: 'mailing',
  messages: 'messages',
  messaging: 'messages',
  news: 'magazine',
  magazine: 'magazine',
  payments: 'payments',
  'recovery-requests': 'recovery',
  'user-permissions': 'admin-permissions',
  'live-chat': 'classroom-messages',
  services: 'services',
  'jury-members': 'jury-members',
  'registration-staff': 'registration-staff',
  profiles: 'profiles',
  analytics: 'analytics',
  navigation: 'navigation',
  'social-links': 'social-links',
  content: 'content',
  'site-settings': 'site-settings',
  'settings/site': 'site-settings',
  'settings/social': 'social-links',
  'settings/navigation': 'navigation',
  'settings/content': 'content',
  'settings/profiles': 'profiles',
};

const INITIAL_PAGE_SIZE = 25;

export default async function AdminResourceRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');

  const { slug } = await params;
  const key = (slug || []).join('/');
  const resource = ROUTES[key];
  if (!resource) notFound();
  if (!hasResourcePermission(profile, resource)) redirect(profile.role === 'manager' ? '/manager' : '/profil');

  const definition = RESOURCE_DEFINITIONS[resource];
  const supabase = createSupabaseAdminClient() as any;
  let query = supabase.from(definition.table).select('*', { count: 'exact' });
  if (definition.orderBy) query = query.order(definition.orderBy, { ascending: false, nullsFirst: false });
  const { data, error, count } = await query.range(0, INITIAL_PAGE_SIZE - 1);
  if (error) throw new Error(`Lecture Supabase ${definition.table}: ${error.message}`);

  return (
    <PaginatedResourceManager
      resource={resource}
      title={definition.title}
      primaryKey={definition.primaryKey}
      columns={definition.columns}
      fields={definition.fields}
      initialRows={Array.isArray(data) ? data : []}
      initialTotal={Number(count || 0)}
      canCreate={definition.canCreate}
      canDelete={definition.canDelete}
    />
  );
}
