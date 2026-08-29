import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

function normalizedName(value: unknown) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function clientIp(request: Request) {
  return String(request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim() || null;
}

export async function POST(request: Request, context: Context) {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'student') return NextResponse.json({ error: 'Compte mannequin requis.' }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || '').trim();
  if (!['view', 'sign', 'decline'].includes(action)) return NextResponse.json({ error: 'Action contractuelle invalide.' }, { status: 400 });

  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error: modelError } = await supabase.from('models').select('id,name,auth_user_id').eq('id', profile.profileId).eq('auth_user_id', profile.userId).maybeSingle();
  if (modelError) return NextResponse.json({ error: modelError.message }, { status: 400 });
  if (!model?.id) return NextResponse.json({ error: 'Profil mannequin introuvable.' }, { status: 404 });

  const { data: contract, error: contractError } = await supabase.from('contracts').select('*').eq('id', decodeURIComponent(id)).eq('model_id', model.id).maybeSingle();
  if (contractError) return NextResponse.json({ error: contractError.message }, { status: 400 });
  if (!contract) return NextResponse.json({ error: 'Contrat introuvable.' }, { status: 404 });
  if (['signed', 'expired', 'cancelled'].includes(String(contract.status))) return NextResponse.json({ error: 'Ce contrat ne peut plus être modifié.' }, { status: 409 });

  const now = new Date().toISOString();
  const metadata = contract.metadata && typeof contract.metadata === 'object' && !Array.isArray(contract.metadata) ? contract.metadata : {};

  if (action === 'view') {
    if (!['sent', 'viewed'].includes(String(contract.status))) return NextResponse.json({ error: 'Ce contrat n’est pas encore disponible à la lecture.' }, { status: 409 });
    const { data, error } = await supabase.from('contracts').update({ status: 'viewed', viewed_at: contract.viewed_at || now, metadata: { ...metadata, lastViewedByModelAt: now }, updated_at: now }).eq('id', contract.id).eq('model_id', model.id).select('id,status,viewed_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, data });
  }

  if (!['sent', 'viewed'].includes(String(contract.status))) return NextResponse.json({ error: 'Le contrat doit être envoyé par l’agence avant réponse.' }, { status: 409 });

  if (action === 'decline') {
    const reason = String(body?.reason || '').trim().slice(0, 1000);
    const { data, error } = await supabase.from('contracts').update({
      status: 'cancelled',
      viewed_at: contract.viewed_at || now,
      metadata: { ...metadata, modelDecision: 'declined', declinedAt: now, declinedByUserId: profile.userId, declineReason: reason || null },
      updated_at: now,
    }).eq('id', contract.id).eq('model_id', model.id).select('id,status,updated_at').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await supabase.from('notifications').insert({ audience_role: 'admin', type: 'contract_declined', title: 'Contrat refusé par un mannequin', body: `${model.name} a refusé « ${contract.title} ».`, href: '/admin/contracts', is_read: false, metadata: { contract_id: contract.id, model_id: model.id } });
    return NextResponse.json({ success: true, data });
  }

  if (!contract.document_url) return NextResponse.json({ error: 'Le document contractuel doit être joint avant signature.' }, { status: 409 });
  if (body?.acceptedTerms !== true) return NextResponse.json({ error: 'Vous devez confirmer avoir lu et accepté le contrat.' }, { status: 400 });
  const signatureName = String(body?.signatureName || '').trim().slice(0, 180);
  if (!signatureName || normalizedName(signatureName) !== normalizedName(model.name)) {
    return NextResponse.json({ error: `Saisissez votre nom complet tel qu’il apparaît sur votre profil : ${model.name}.` }, { status: 400 });
  }

  const evidence = `${contract.id}|${profile.userId}|${now}|${normalizedName(signatureName)}`;
  const signatureHash = createHash('sha256').update(evidence).digest('hex');
  const audit = {
    method: 'typed_name_electronic_acceptance',
    signerName: signatureName,
    signerUserId: profile.userId,
    signerModelId: model.id,
    signedAt: now,
    ip: clientIp(request),
    userAgent: String(request.headers.get('user-agent') || '').slice(0, 500) || null,
    signatureHash,
    acceptedTerms: true,
  };
  const { data, error } = await supabase.from('contracts').update({
    status: 'signed',
    viewed_at: contract.viewed_at || now,
    signed_at: now,
    metadata: { ...metadata, modelDecision: 'signed', electronicSignature: audit },
    updated_at: now,
  }).eq('id', contract.id).eq('model_id', model.id).in('status', ['sent', 'viewed']).select('id,title,status,signed_at,metadata').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'Le statut du contrat a changé. Rechargez la page.' }, { status: 409 });

  await supabase.from('notifications').insert({ audience_role: 'admin', type: 'contract_signed', title: 'Contrat signé', body: `${model.name} a signé « ${contract.title} ».`, href: '/admin/contracts', is_read: false, metadata: { contract_id: contract.id, model_id: model.id, signature_hash: signatureHash } });
  return NextResponse.json({ success: true, data, signatureHash });
}
