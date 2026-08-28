import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['student','admin','manager'].includes(profile.role)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const message = String(body?.body || '').trim().slice(0, 8000);
  if (!message) return NextResponse.json({ error: 'Message requis.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('forum_replies').insert({ thread_id: id, author_user_id: profile.userId, body: message, raw_data: {} }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
