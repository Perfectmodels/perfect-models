import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['registration','admin','manager'].includes(profile.role)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = String(body?.status || '').trim().slice(0, 80);
  if (!status) return NextResponse.json({ error: 'Statut requis.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('casting_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
