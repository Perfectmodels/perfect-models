import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { provisionModelAccount } from '@/lib/model-account-provisioning';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const profile = await getCurrentAppProfile();
  return profile?.role === 'admin';
}

function validEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Administrateur requis.' }, { status: 403 });
  const admin = createSupabaseAdminClient() as any;
  const { data, error } = await admin.from('models')
    .select('id,name,username,email,raw_data,auth_user_id,claim_status')
    .order('name').limit(1000);
  if (error) return NextResponse.json({ error: 'Liste des mannequins indisponible.' }, { status: 503 });
  const rows = (data || []).map((model: any) => {
    const email = validEmail(model.email || model.raw_data?.email);
    const claim = String(model.claim_status || '');
    const status = model.auth_user_id ? 'linked'
      : !email ? 'missing_email'
      : !['', 'not_applicable', 'available'].includes(claim) ? 'pending_claim'
      : 'eligible';
    return { id: model.id, name: model.name, username: model.username, email, status };
  });
  return NextResponse.json({ models: rows }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Administrateur requis.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body.modelIds) ? body.modelIds : [];
  if (!ids.length || ids.length > 10 || ids.some((id: unknown) => typeof id !== 'string' || !id.trim())) {
    return NextResponse.json({ error: 'Sélectionnez entre 1 et 10 mannequins.' }, { status: 400 });
  }
  const uniqueIds = [...new Set(ids.map((id: string) => id.trim()))];
  const results: Array<Awaited<ReturnType<typeof provisionModelAccount>>> = [];
  for (const id of uniqueIds) results.push(await provisionModelAccount(id));
  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
}
