import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'student') return NextResponse.json({ error:'Compte mannequin requis.' }, { status:403 });
  const { id } = await context.params; const body = await request.json().catch(()=>({})); const response = String(body.response || '');
  if (!['confirmed','declined'].includes(response)) return NextResponse.json({ error:'Réponse invalide.' }, { status:400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data:model } = await supabase.from('models').select('id').eq('id',profile.profileId).eq('auth_user_id',profile.userId).maybeSingle();
  if(!model?.id) return NextResponse.json({ error:'Profil mannequin introuvable.' }, { status:404 });
  const { data,error } = await supabase.from('casting_talents').update({ stage:response, responded_at:new Date().toISOString() }).eq('id',id).eq('model_id',model.id).in('stage',['invited','confirmed','declined']).select('id,stage').maybeSingle();
  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  if(!data) return NextResponse.json({ error:'Invitation casting introuvable ou déjà traitée.' }, { status:404 });
  return NextResponse.json({ success:true, data });
}
