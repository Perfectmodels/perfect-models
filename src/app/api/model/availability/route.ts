import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const STATUS = new Set(['available','unavailable','travel','tentative']);

async function ownedModel() {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'student') return null;
  const supabase = createSupabaseAdminClient() as any;
  const { data } = await supabase.from('models').select('id').eq('id',profile.profileId).eq('auth_user_id',profile.userId).maybeSingle();
  return data?.id ? { profile, modelId:String(data.id), supabase } : null;
}

export async function POST(request: Request) {
  const owned = await ownedModel(); if (!owned) return NextResponse.json({ error:'Compte mannequin requis.' }, { status:403 });
  const body = await request.json().catch(()=>({})); const startsAt = String(body.startsAt||''); const endsAt = String(body.endsAt||''); const status = String(body.status||'available'); const reason = String(body.reason||'').trim().slice(0,600);
  if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt) || !STATUS.has(status)) return NextResponse.json({ error:'Période ou statut invalide.' }, { status:400 });
  const { data,error } = await owned.supabase.from('model_availability').insert({ model_id:owned.modelId, starts_at:startsAt, ends_at:endsAt, status, reason:reason||null, source:'model', created_by:owned.profile.userId }).select('*').single();
  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  return NextResponse.json({ data }, { status:201 });
}

export async function DELETE(request: Request) {
  const owned = await ownedModel(); if (!owned) return NextResponse.json({ error:'Compte mannequin requis.' }, { status:403 });
  const id = new URL(request.url).searchParams.get('id') || '';
  if(!id) return NextResponse.json({ error:'Disponibilité requise.' }, { status:400 });
  const { error } = await owned.supabase.from('model_availability').delete().eq('id',id).eq('model_id',owned.modelId).eq('source','model');
  if(error) return NextResponse.json({ error:error.message }, { status:400 });
  return NextResponse.json({ success:true });
}
