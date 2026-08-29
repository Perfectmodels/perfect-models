import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS, isResourceName } from '@/lib/agency-resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasResourcePermission } from '@/lib/auth/admin-access';
import { CrudValidationError, sanitizeResourcePayload } from '@/lib/admin-crud';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ resource: string }> };

async function authorize(resource: string) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) return { error: NextResponse.json({ error: 'Non autorisé.' }, { status: 401 }) } as const;
  if (!isResourceName(resource)) return { error: NextResponse.json({ error: 'Ressource inconnue.' }, { status: 404 }) } as const;
  if (!hasResourcePermission(profile, resource)) return { error: NextResponse.json({ error: 'Permission manager insuffisante.' }, { status: 403 }) } as const;
  return { profile, resource, definition: RESOURCE_DEFINITIONS[resource] } as const;
}

function integerParam(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
function safeSearch(value: string | null) { return String(value || '').replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120); }

export async function GET(request: Request, context: Context) {
  const { resource } = await context.params;
  const access = await authorize(resource);
  if ('error' in access) return access.error;
  const url = new URL(request.url);
  const page = integerParam(url.searchParams.get('page'), 1, 1, 100000);
  const pageSize = integerParam(url.searchParams.get('pageSize'), 25, 15, 100);
  const q = safeSearch(url.searchParams.get('q'));
  const status = String(url.searchParams.get('status') || '').trim().slice(0, 80);
  const requestedSort = String(url.searchParams.get('sort') || '');
  const direction = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const definition = access.definition;
  const allowedSort = new Set<string>([definition.orderBy, ...definition.columns]);
  const sort = allowedSort.has(requestedSort) ? requestedSort : definition.orderBy;
  const hasStatus = definition.fields.some((field) => field.name === 'status');
  const searchable = definition.fields.filter((field) => ['text', 'email', 'tel', 'url', 'textarea', 'select'].includes(field.type)).map((field) => field.name).filter((name) => name !== 'id' && !name.endsWith('_id') && !name.endsWith('_at') && !['status','currency','source','stage','decision','option_rank'].includes(name)).slice(0, 10);
  const supabase = createSupabaseAdminClient() as any;
  let query = supabase.from(definition.table).select('*', { count: 'exact' });
  if (q && searchable.length) query = query.or(searchable.map((column) => `${column}.ilike.%${q}%`).join(','));
  if (status && hasStatus) query = query.eq('status', status);
  if (sort) query = query.order(sort, { ascending: direction === 'asc', nullsFirst: false });
  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const total = Number(count || 0);
  return NextResponse.json({ data: data || [], resource, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request, context: Context) {
  const { resource } = await context.params;
  const access = await authorize(resource);
  if ('error' in access) return access.error;
  if (access.definition.canCreate === false) return NextResponse.json({ error: 'Cette ressource est disponible en lecture seule.' }, { status: 405 });
  const body = await request.json().catch(() => null);
  let row: Record<string, unknown>;
  try { row = sanitizeResourcePayload(access.resource, body, 'create'); }
  catch (error) { return NextResponse.json({ error: error instanceof CrudValidationError ? error.message : 'Formulaire invalide.' }, { status: 400 }); }
  if (access.definition.generatePrimaryKey && !row[access.definition.primaryKey]) row[access.definition.primaryKey] = crypto.randomUUID();
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from(access.definition.table).insert(row).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
