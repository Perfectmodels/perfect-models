import { randomInt, randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  collectionToArray,
  deleteNestedValue,
  getCollection,
  getNestedValue,
  patchNestedValue,
  setCollection,
  setNestedValue,
} from '@/lib/app-data';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { canReadCollection, canWriteCollection } from '@/lib/data-policy';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ path: string[] }> };

async function resolvePath(ctx: Ctx) {
  const { path } = await ctx.params;
  const decoded = (path || []).map(decodeURIComponent);
  return { key: decoded[0] || '', nested: decoded.slice(1) };
}

const owns = (
  profile: Awaited<ReturnType<typeof getCurrentAppProfile>>,
  key: string,
  nested: string[],
) => profile?.role !== 'student' || key !== 'models' || !nested.length || nested[0] === profile.profileId;

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function text(value: unknown, maxLength: number) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function optionalNumber(value: unknown, min: number, max: number, label: string) {
  const normalized = text(value, 12);
  if (!normalized) return '';
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} invalide.`);
  }
  return normalized;
}

function isTrustedImgBBUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'i.ibb.co';
  } catch {
    return false;
  }
}

function normalizeCastingApplication(raw: Record<string, unknown>) {
  const firstName = text(raw.firstName, 80);
  const lastName = text(raw.lastName, 80);
  const birthDate = text(raw.birthDate, 10);
  const gender = text(raw.gender, 20);
  const nationality = text(raw.nationality, 80);
  const city = text(raw.city, 80);
  const email = text(raw.email, 160).toLowerCase();
  const phone = text(raw.phone, 40);
  const height = optionalNumber(raw.height, 120, 230, 'Taille');
  const experience = text(raw.experience, 30);

  if (!firstName || !lastName || !birthDate || !nationality || !city || !email || !phone || !height) {
    throw new Error('Champs obligatoires incomplets.');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('Date de naissance invalide.');
  const birth = new Date(`${birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime())) throw new Error('Date de naissance invalide.');
  const age = Math.floor((Date.now() - birth.getTime()) / 31_556_952_000);
  if (age < 14 || age > 80) throw new Error('Âge hors limites autorisées.');
  if (!['Femme', 'Homme'].includes(gender)) throw new Error('Genre invalide.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Adresse email invalide.');
  if (phone.replace(/\D/g, '').length < 8) throw new Error('Numéro de téléphone invalide.');
  if (!['none', 'beginner', 'intermediate', 'professional'].includes(experience)) {
    throw new Error("Niveau d'expérience invalide.");
  }

  const photoPortraitUrl = text(raw.photoPortraitUrl, 600);
  const photoFullBodyUrl = text(raw.photoFullBodyUrl, 600);
  const photoProfileUrl = text(raw.photoProfileUrl, 600);
  const photos = [photoPortraitUrl, photoFullBodyUrl, photoProfileUrl];
  if (!photos.some(Boolean)) throw new Error('Au moins une photo est requise.');
  if (!photos.every(isTrustedImgBBUrl)) throw new Error('URL de photo non autorisée.');
  if (raw.consentAccepted !== true) throw new Error('Consentement requis.');

  const portfolioLink = text(raw.portfolioLink, 600);
  if (portfolioLink) {
    try {
      const url = new URL(portfolioLink);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      throw new Error('Lien portfolio invalide.');
    }
  }

  const now = new Date().toISOString();
  return {
    firstName,
    lastName,
    birthDate,
    gender,
    nationality,
    city,
    email,
    phone,
    height,
    weight: optionalNumber(raw.weight, 25, 300, 'Poids'),
    chest: optionalNumber(raw.chest, 30, 250, 'Tour de poitrine'),
    waist: optionalNumber(raw.waist, 30, 250, 'Tour de taille'),
    hips: optionalNumber(raw.hips, 30, 250, 'Tour de hanches'),
    shoeSize: optionalNumber(raw.shoeSize, 20, 55, 'Pointure'),
    eyeColor: text(raw.eyeColor, 40),
    hairColor: text(raw.hairColor, 60),
    experience,
    instagram: text(raw.instagram, 120),
    portfolioLink,
    photoPortraitUrl,
    photoFullBodyUrl,
    photoProfileUrl,
    status: 'Nouveau',
    submissionDate: now,
    passageNumber: randomInt(1000, 10_000),
    consentAccepted: true,
    consentAcceptedAt: now,
    source: 'website',
  };
}

export async function GET(_request: Request, ctx: Ctx) {
  const { key, nested } = await resolvePath(ctx);
  const profile = await getCurrentAppProfile();
  if (!key || !canReadCollection(key, profile)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const root = await getCollection(key);
  return NextResponse.json(nested.length ? getNestedValue(root, nested) : root, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const { key, nested } = await resolvePath(ctx);
  const profile = await getCurrentAppProfile();
  if (!key || nested.length || !canWriteCollection(key, profile, 'create')) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 64 * 1024) {
    return NextResponse.json({ error: 'Payload trop volumineux.' }, { status: 413 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  }

  let sanitized: Record<string, unknown> = body as Record<string, unknown>;
  if (key === 'castingApplications') {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine de soumission non autorisée.' }, { status: 403 });
    }
    try {
      sanitized = normalizeCastingApplication(sanitized);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Candidature invalide.' },
        { status: 400 },
      );
    }
  }

  const id = randomUUID();
  const item = { ...sanitized, id };
  const items = collectionToArray(await getCollection(key));
  items.push(item);

  try {
    await setCollection(key, items);
    return NextResponse.json({ id, item }, { status: 201 });
  } catch (error) {
    if (key === 'adminNotifications') {
      console.warn('[adminNotifications] persistence unavailable; notification skipped', error);
      return NextResponse.json({ id, accepted: true, persisted: false }, { status: 202 });
    }
    throw error;
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  const { key, nested } = await resolvePath(ctx);
  const profile = await getCurrentAppProfile();
  const operation = !profile ? 'create' : 'update';
  if (!key || !canWriteCollection(key, profile, operation) || !owns(profile, key, nested)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const value = await request.json().catch(() => null);
  const root = await getCollection(key);
  await setCollection(key, nested.length ? setNestedValue(root ?? {}, nested, value) : value);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { key, nested } = await resolvePath(ctx);
  const profile = await getCurrentAppProfile();
  if (!key || !canWriteCollection(key, profile, 'update') || !owns(profile, key, nested)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  const updates = await request.json().catch(() => null);
  if (!updates || typeof updates !== 'object') {
    return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  }
  const root = await getCollection(key);
  await setCollection(
    key,
    nested.length
      ? patchNestedValue(root ?? {}, nested, updates)
      : { ...((root as Record<string, unknown>) || {}), ...updates },
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { key, nested } = await resolvePath(ctx);
  const profile = await getCurrentAppProfile();
  if (!key || !nested.length || !canWriteCollection(key, profile, 'delete') || !owns(profile, key, nested)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  await setCollection(key, deleteNestedValue(await getCollection(key), nested));
  return NextResponse.json({ success: true });
}
