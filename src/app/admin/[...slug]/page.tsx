import { notFound, redirect } from 'next/navigation';
import PaginatedResourceManager from '@/components/admin/PaginatedResourceManager';
import ProfessionalResourceWorkspace from '@/components/admin/ProfessionalResourceWorkspace';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS, type ResourceName } from '@/lib/agency-resource-registry';
import { enhanceAdminFields } from '@/lib/admin-field-options';
import { hydrateAdminRelationOptions } from '@/lib/admin-relation-options';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasResourcePermission } from '@/lib/auth/admin-access';
import { professionalWorkspaceFor } from '@/lib/professional-workspaces';

export const dynamic = 'force-dynamic';

const ROUTES: Record<string, ResourceName> = {
  models: 'models', 'model-access': 'models', 'talent-availability': 'availability',
  'casting-applications': 'casting-applications', 'casting-results': 'casting-applications', castings: 'castings', 'casting-pipeline': 'casting-talents',
  'booking-requests': 'booking-requests', bookings: 'bookings', 'booking-options': 'booking-options',
  clients: 'clients', 'client-contacts': 'client-contacts', 'calendar-events': 'calendar-events',
  quotes: 'quotes', contracts: 'contracts', invoices: 'invoices', 'invoice-payments': 'invoice-payments', 'image-rights': 'image-rights',
  'client-selections': 'client-selections', 'selection-items': 'selection-items',
  absences: 'absences', agency: 'content', 'artistic-direction': 'photoshoot-briefs', 'beauty-contests': 'beauty-contests',
  classroom: 'courses', 'classroom-progress': 'course-progress', comments: 'comments',
  'fashion-day-applications': 'fashion-day-applications', 'fashion-day-events': 'fashion-day-events',
  gallery: 'gallery', 'media-library': 'gallery', mailing: 'mailing', messages: 'messages', messaging: 'messages', news: 'magazine', magazine: 'magazine', payments: 'payments',
  'recovery-requests': 'recovery', 'user-permissions': 'admin-permissions', 'live-chat': 'classroom-messages', services: 'services',
  'jury-members': 'jury-members', 'registration-staff': 'registration-staff', profiles: 'profiles',
  navigation: 'navigation', 'social-links': 'social-links', content: 'content', 'site-settings': 'site-settings',
  'settings/site': 'site-settings', 'settings/social': 'social-links', 'settings/navigation': 'navigation', 'settings/content': 'content', 'settings/profiles': 'profiles',
};

const INITIAL_PAGE_SIZE = 25;

function hasValue(value: unknown) {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return true;
}

function computeCompleteness(rows: Record<string, unknown>[], fields: readonly { name: string; required?: boolean; createOnly?: boolean }[]) {
  if (!rows.length) return 0;
  const required = fields.filter((field) => field.required && !field.createOnly);
  const qualityFields = required.length
    ? required
    : fields.filter((field) => !field.createOnly && field.name !== 'id' && !field.name.endsWith('_at')).slice(0, 8);
  if (!qualityFields.length) return 100;
  let present = 0;
  for (const row of rows) for (const field of qualityFields) if (hasValue(row[field.name])) present += 1;
  return Math.round((present / (rows.length * qualityFields.length)) * 100);
}

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
  const fields = await hydrateAdminRelationOptions(supabase, enhanceAdminFields(resource, definition.fields));
  const workspace = professionalWorkspaceFor(resource);

  let query = supabase.from(definition.table).select('*', { count: 'exact' });
  if (definition.orderBy) query = query.order(definition.orderBy, { ascending: false, nullsFirst: false });
  const { data, error, count } = await query.range(0, INITIAL_PAGE_SIZE - 1);
  if (error) throw new Error(`Lecture Supabase ${definition.table}: ${error.message}`);

  const initialRows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
  const fieldNames = new Set(definition.fields.map((field) => field.name));
  const metricResults = await Promise.all(workspace.metrics.map(async (metric) => {
    if (!metric.field || !fieldNames.has(metric.field)) return null;
    try {
      let metricQuery = supabase.from(definition.table).select(definition.primaryKey, { count: 'exact', head: true });
      metricQuery = metric.value === null ? metricQuery.is(metric.field, null) : metricQuery.eq(metric.field, metric.value);
      const result = await metricQuery;
      if (result.error) return null;
      return { label: metric.label, value: Number(result.count || 0), tone: metric.tone };
    } catch {
      return null;
    }
  }));

  const snapshot = {
    total: Number(count || 0),
    completeness: computeCompleteness(initialRows, definition.fields),
    metrics: metricResults.filter((metric): metric is NonNullable<typeof metric> => Boolean(metric)),
  };

  return (
    <ProfessionalResourceWorkspace title={definition.title} config={workspace} snapshot={snapshot}>
      <PaginatedResourceManager
        resource={resource}
        title={definition.title}
        primaryKey={definition.primaryKey}
        columns={definition.columns}
        fields={fields}
        initialRows={initialRows}
        initialTotal={Number(count || 0)}
        canCreate={definition.canCreate}
        canDelete={definition.canDelete}
      />
    </ProfessionalResourceWorkspace>
  );
}
