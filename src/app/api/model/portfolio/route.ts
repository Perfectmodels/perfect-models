import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function text(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function directImgBB(value: unknown) {
  const candidate = text(value, 1200);
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' && url.hostname === 'i.ibb.co' && url.pathname.length > 1 ? url.toString() : '';
  } catch {
    return '';
  }
}

async function requireOwnModel() {
  const profile = await getCurrentAppProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Connexion requise.' }, { status: 401 }) } as const;
  if (profile.role !== 'student' || !profile.profileId) return { error: NextResponse.json({ error: 'Espace mannequin requis.' }, { status: 403 }) } as const;
  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error } = await supabase.from('models').select('id,auth_user_id').eq('id', profile.profileId).eq('auth_user_id', profile.userId).maybeSingle();
  if (error) return { error: NextResponse.json({ error: 'Impossible de vérifier votre fiche.' }, { status: 503 }) } as const;
  if (!model?.id) return { error: NextResponse.json({ error: 'Fiche mannequin introuvable.' }, { status: 404 }) } as const;
  return { profile, model, supabase } as const;
}

export async function POST(request: Request) {
  const access = await requireOwnModel();
  if ('error' in access) return access.error;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const url = directImgBB(body?.url);
  if (!url) return NextResponse.json({ error: 'Une image ImgBB valide est requise.' }, { status: 400 });

  const { data: existing } = await access.supabase
    .from('model_portfolio_images')
    .select('id,position')
    .eq('model_id', access.model.id)
    .order('position', { ascending: false })
    .limit(1);
  const nextPosition = Array.isArray(existing) && existing.length ? Number(existing[0]?.position || 0) + 1 : 0;

  const { data, error } = await access.supabase
    .from('model_portfolio_images')
    .insert({
      model_id: access.model.id,
      url,
      position: nextPosition,
      caption: text(body?.caption, 300) || null,
    })
    .select('id,url,position,caption')
    .single();

  if (error) {
    if (String(error.code || '') === '23505') return NextResponse.json({ error: 'Cette image figure déjà dans votre portfolio.' }, { status: 409 });
    console.error('[model/portfolio] insert failed', error);
    return NextResponse.json({ error: 'L’image n’a pas pu être ajoutée au portfolio.' }, { status: 503 });
  }

  return NextResponse.json({ success: true, image: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const access = await requireOwnModel();
  if ('error' in access) return access.error;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = text(body?.id, 80);
  if (!id) return NextResponse.json({ error: 'Image requise.' }, { status: 400 });

  const { data: image } = await access.supabase.from('model_portfolio_images').select('id,url,model_id').eq('id', id).eq('model_id', access.model.id).maybeSingle();
  if (!image?.id) return NextResponse.json({ error: 'Image introuvable dans votre portfolio.' }, { status: 404 });

  const action = text(body?.action, 40);
  if (action === 'cover') {
    const { error } = await access.supabase.from('models').update({ image_url: image.url, updated_at: new Date().toISOString() }).eq('id', access.model.id).eq('auth_user_id', access.profile.userId);
    if (error) return NextResponse.json({ error: 'La photo principale n’a pas pu être mise à jour.' }, { status: 503 });
    return NextResponse.json({ success: true, imageUrl: image.url });
  }

  const { data, error } = await access.supabase.from('model_portfolio_images').update({ caption: text(body?.caption, 300) || null }).eq('id', id).eq('model_id', access.model.id).select('id,url,position,caption').maybeSingle();
  if (error || !data) return NextResponse.json({ error: 'La légende n’a pas pu être mise à jour.' }, { status: 503 });
  return NextResponse.json({ success: true, image: data });
}

export async function DELETE(request: Request) {
  const access = await requireOwnModel();
  if ('error' in access) return access.error;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = text(body?.id, 80);
  if (!id) return NextResponse.json({ error: 'Image requise.' }, { status: 400 });

  const { data: image } = await access.supabase.from('model_portfolio_images').select('id,url,model_id').eq('id', id).eq('model_id', access.model.id).maybeSingle();
  if (!image?.id) return NextResponse.json({ error: 'Image introuvable dans votre portfolio.' }, { status: 404 });

  const { error } = await access.supabase.from('model_portfolio_images').delete().eq('id', id).eq('model_id', access.model.id);
  if (error) return NextResponse.json({ error: 'L’image n’a pas pu être supprimée.' }, { status: 503 });
  return NextResponse.json({ success: true });
}
