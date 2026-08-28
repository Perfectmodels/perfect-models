import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS, isResourceName } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasResourcePermission } from '@/lib/auth/admin-access';
import { CrudValidationError, sanitizeResourcePayload } from '@/lib/admin-crud';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ resource: string }> };

async function authorize(resource: string) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Non autorisé.' }, { status: 401 }) } as const;
  }
  if (!isResourceName(resource)) {
    return { error: NextResponse.json({ error: 'Ressource inconnue.' }, { status: 404 }) } as const;
  }
  if (!hasResourcePermission(profile, resource)) {
    return { error: NextResponse.json({ error: 'Permission manager insuffisante.' }, { status: 403 }) } as const;
  }
  return { profile, resource, definition: RESOURCE_DEFINITIONS[resource] } as const;
}

export async function GET(_request: Request, context: Context) {
  const { resource } = await context.params;
  const access = await authorize(resource);
  if ('error' in access) return access.error;

  const supabase = createSupabaseAdminClient() as any;
  let query = supabase.from(access.definition.table).select('*').limit(1000);
  if (access.definition.orderBy) query = query.order(access.definition.orderBy, { ascending: false });
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [], resource, definition: access.definition }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request, context: Context) {
  const { resource } = await context.params;
  const access = await authorize(resource);
  if ('error' in access) return access.error;

  if (access.definition.canCreate === false) {
    return NextResponse.json({ error: 'Cette ressource est disponible en lecture seule.' }, { status: 405 });
  }

  const body = await request.json().catch(() => null);
  let row: Record<string, unknown>;
  try {
    row = sanitizeResourcePayload(access.resource, body, 'create');
  } catch (error) {
    const message = error instanceof CrudValidationError ? error.message : 'Formulaire invalide.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
  if (access.definition.generatePrimaryKey && !row[access.definition.primaryKey]) {
    row[access.definition.primaryKey] = crypto.randomUUID();
  }

  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from(access.definition.table).insert(row).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
