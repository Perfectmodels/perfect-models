import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function objectValue(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function text(value: unknown, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function nullableText(value: unknown, max = 500) {
  const normalized = text(value, max);
  return normalized || null;
}

function numberOrNull(value: unknown, min: number, max: number) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function stringList(value: unknown, maxItems = 20) {
  return Array.isArray(value)
    ? value.map((item) => text(item, 80)).filter(Boolean).slice(0, maxItems)
    : [];
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

function safeHttpsUrl(value: unknown, allowedHost?: string) {
  const candidate = text(value, 1200);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return null;
    if (allowedHost && url.hostname !== allowedHost && !url.hostname.endsWith(`.${allowedHost}`)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function computeAge(birthDate: string | null) {
  if (!birthDate) return null;
  const date = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();
  const beforeBirthday = today.getUTCMonth() < date.getUTCMonth() || (today.getUTCMonth() === date.getUTCMonth() && today.getUTCDate() < date.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age <= 100 ? age : null;
}

async function requireOwnModel() {
  const profile = await getCurrentAppProfile();
  if (!profile) return { error: NextResponse.json({ error: 'Connexion requise.' }, { status: 401 }) } as const;
  if (profile.role !== 'student' || !profile.profileId) return { error: NextResponse.json({ error: 'Espace mannequin requis.' }, { status: 403 }) } as const;

  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error } = await supabase
    .from('models')
    .select('id,auth_user_id,raw_data,measurements,email,username')
    .eq('id', profile.profileId)
    .eq('auth_user_id', profile.userId)
    .maybeSingle();

  if (error) return { error: NextResponse.json({ error: 'Impossible de vérifier votre fiche mannequin.' }, { status: 503 }) } as const;
  if (!model?.id) return { error: NextResponse.json({ error: 'Votre compte n’est pas rattaché à une fiche mannequin modifiable.' }, { status: 404 }) } as const;
  return { profile, model, supabase } as const;
}

export async function PATCH(request: Request) {
  const access = await requireOwnModel();
  if ('error' in access) return access.error;

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });

  const birthDate = nullableText(body.birthDate, 10);
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json({ error: 'Date de naissance invalide.' }, { status: 400 });
  }

  const imageUrlInput = text(body.imageUrl, 1200);
  const imageUrl = imageUrlInput ? directImgBB(imageUrlInput) : '';
  if (imageUrlInput && !imageUrl) return NextResponse.json({ error: 'La photo principale doit provenir du téléversement ImgBB PMM.' }, { status: 400 });

  const compCardInput = text(body.compCardUrl, 1200);
  const compCardUrl = compCardInput ? directImgBB(compCardInput) : '';
  if (compCardInput && !compCardUrl) return NextResponse.json({ error: 'Le composite doit provenir du téléversement ImgBB PMM.' }, { status: 400 });

  const instagramInput = text(body.instagramUrl, 1200);
  const instagramUrl = instagramInput ? safeHttpsUrl(instagramInput, 'instagram.com') : null;
  if (instagramInput && !instagramUrl) return NextResponse.json({ error: 'Le lien Instagram doit être une URL https://instagram.com valide.' }, { status: 400 });

  const heightCm = numberOrNull(body.heightCm, 100, 230);
  const chestCm = numberOrNull(body.chestCm, 40, 180);
  const waistCm = numberOrNull(body.waistCm, 35, 180);
  const hipsCm = numberOrNull(body.hipsCm, 40, 200);
  const shoeSize = nullableText(body.shoeSize, 20);
  const currentMeasurements = objectValue(access.model.measurements);
  const measurements = {
    ...currentMeasurements,
    chest: chestCm === null ? '' : `${chestCm}cm`,
    waist: waistCm === null ? '' : `${waistCm}cm`,
    hips: hipsCm === null ? '' : `${hipsCm}cm`,
    shoeSize: shoeSize || '',
  };

  const currentRaw = objectValue(access.model.raw_data);
  const now = new Date().toISOString();
  const rawData = {
    ...currentRaw,
    compCardUrl: compCardUrl || null,
    compCardIsPublic: body.compCardPublic === true,
    compCardUpdatedAt: compCardUrl ? now : currentRaw.compCardUpdatedAt || null,
    selfServiceUpdatedAt: now,
  };

  const patch = {
    name: text(body.name, 160) || 'Mannequin PMM',
    phone: nullableText(body.phone, 40),
    gender: nullableText(body.gender, 40),
    birth_date: birthDate,
    age: computeAge(birthDate),
    nationality: nullableText(body.nationality, 100),
    instagram_url: instagramUrl,
    location: nullableText(body.location, 160),
    height_cm: heightCm,
    height: heightCm === null ? null : `${heightCm}cm`,
    chest_cm: chestCm,
    waist_cm: waistCm,
    hips_cm: hipsCm,
    shoe_size: shoeSize,
    hair_color: nullableText(body.hairColor, 80),
    eye_color: nullableText(body.eyeColor, 80),
    categories: stringList(body.categories, 12),
    mobility: stringList(body.mobility, 20),
    experience: nullableText(body.experience, 5000),
    journey: nullableText(body.journey, 5000),
    image_url: imageUrl || null,
    measurements,
    raw_data: rawData,
    updated_at: now,
  };

  const { data, error } = await access.supabase
    .from('models')
    .update(patch)
    .eq('id', access.model.id)
    .eq('auth_user_id', access.profile.userId)
    .select('id,name,username,email,phone,gender,birth_date,nationality,instagram_url,location,height_cm,chest_cm,waist_cm,hips_cm,shoe_size,hair_color,eye_color,categories,mobility,experience,journey,image_url,raw_data,updated_at')
    .maybeSingle();

  if (error || !data) {
    console.error('[model/profile] self update failed', error);
    return NextResponse.json({ error: 'Vos modifications n’ont pas pu être enregistrées.' }, { status: 503 });
  }

  return NextResponse.json({ success: true, model: data, message: 'Votre profil a été mis à jour.' });
}
