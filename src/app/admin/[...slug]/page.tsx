import { notFound, redirect } from 'next/navigation';
import SupabaseResourceManager from '@/components/admin/SupabaseResourceManager';
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
  let query = supabase.from(definition.table).select('*').limit(1000);
  if (definition.orderBy) query = query.order(definition.orderBy, { ascending: false });
  const { data, error } = await query;
  if (error) throw new Error(`Lecture Supabase ${definition.table}: ${error.message}`);

  return (
    <SupabaseResourceManager
      resource={resource}
      title={definition.title}
      primaryKey={definition.primaryKey}
      columns={definition.columns}
      fields={definition.fields}
      initialRows={Array.isArray(data) ? data : []}
      canCreate={definition.canCreate}
      canDelete={definition.canDelete}
    />
  );
}
