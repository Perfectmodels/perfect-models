import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { RESOURCE_DEFINITIONS, isResourceName } from '@/lib/resource-registry';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hasResourcePermission } from '@/lib/auth/admin-access';
import { CrudValidationError, sanitizeResourcePayload } from '@/lib/admin-crud';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ resource: string; id: string }> };

async function resolve(context: Context) {
  const { resource, id } = await context.params;
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
  return { resource, id, definition: RESOURCE_DEFINITIONS[resource] } as const;
}

export async function PATCH(request: Request, context: Context) {
  const resolved = await resolve(context);
  if ('error' in resolved) return resolved.error;
  const body = await request.json().catch(() => null);
  let updates: Record<string, unknown>;
  try {
    updates = sanitizeResourcePayload(resolved.resource, body, 'update');
  } catch (error) {
    const message = error instanceof CrudValidationError ? error.message : 'Formulaire invalide.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from(resolved.definition.table)
    .update(updates)
    .eq(resolved.definition.primaryKey, decodeURIComponent(resolved.id))
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: Request, context: Context) {
  const resolved = await resolve(context);
  if ('error' in resolved) return resolved.error;
  if (resolved.definition.canDelete === false) {
    return NextResponse.json({ error: 'Cette ressource est disponible en lecture seule.' }, { status: 405 });
  }
  const supabase = createSupabaseAdminClient() as any;
  const { error } = await supabase
    .from(resolved.definition.table)
    .delete()
    .eq(resolved.definition.primaryKey, decodeURIComponent(resolved.id));
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
