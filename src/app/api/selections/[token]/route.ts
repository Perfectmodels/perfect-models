import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ token: string }> };
const DECISIONS = new Set(['pending','favorite','shortlist','rejected']);

export async function POST(request: Request, context: Context) {
  const { token } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return NextResponse.json({ error: 'Lien de sélection invalide.' }, { status: 404 });
  const body = await request.json().catch(()=>({})); const itemId = String(body.itemId || ''); const decision = String(body.decision || 'pending'); const comment = String(body.comment || '').trim().slice(0,800);
  if (!itemId || !DECISIONS.has(decision)) return NextResponse.json({ error: 'Décision invalide.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data: selection, error } = await supabase.from('client_selections').select('id,status,expires_at').eq('public_token',token).maybeSingle();
  if (error || !selection || selection.status !== 'active' || (selection.expires_at && new Date(selection.expires_at) < new Date())) return NextResponse.json({ error: 'Cette sélection est fermée ou a expiré.' }, { status: 410 });
  const { data, error: updateError } = await supabase.from('client_selection_items').update({ decision, client_comment: comment || null }).eq('id',itemId).eq('selection_id',selection.id).select('id,decision,client_comment').maybeSingle();
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'Talent absent de cette sélection.' }, { status: 404 });
  return NextResponse.json({ success:true, data });
}
