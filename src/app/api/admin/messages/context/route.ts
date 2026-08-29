import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'messages')) {
    return NextResponse.json({ error:'Accès messagerie requis.' }, { status:403 });
  }
  const body = await request.json().catch(()=>({}));
  const messageId = String(body.messageId || '').trim();
  if (!messageId) return NextResponse.json({ error:'Message requis.' }, { status:400 });
  const clean = (value: unknown) => String(value || '').trim() || null;
  const patch = { client_id:clean(body.clientId), casting_id:clean(body.castingId), booking_id:clean(body.bookingId), invoice_id:clean(body.invoiceId) };
  const supabase = createSupabaseAdminClient() as any;
  const { data,error } = await supabase.from('messages').update(patch).eq('id',messageId).select('id,client_id,casting_id,booking_id,invoice_id').maybeSingle();
  if (error) return NextResponse.json({ error:error.message }, { status:400 });
  if (!data) return NextResponse.json({ error:'Message introuvable.' }, { status:404 });
  return NextResponse.json({ success:true,data });
}
