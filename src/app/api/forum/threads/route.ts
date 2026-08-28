import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['student','admin','manager'].includes(profile.role)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = String(body?.title || '').trim().slice(0, 180);
  const message = String(body?.body || '').trim().slice(0, 8000);
  if (!title || !message) return NextResponse.json({ error: 'Titre et message requis.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('forum_threads').insert({ author_user_id: profile.userId, title, body: message, status: 'active', raw_data: {} }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
