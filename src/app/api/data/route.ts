import { NextResponse } from 'next/server';
import { getCollections, setCollection, collectionToArray, getCollection, KNOWN_COLLECTIONS } from '@/lib/app-data';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { canReadCollection, canWriteCollection, INTAKE_COLLECTIONS } from '@/lib/data-policy';
import { getPublicAppState } from '@/lib/public-app-state';
import { submitSupabaseRow } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';

const normalizeDateValue = (value: unknown) => {
  if (typeof value !== 'string') return value;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
  return match?.[1] || value;
};

const normalizeDates = (value: any): any => {
  if (Array.isArray(value)) return value.map(normalizeDates);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      const dateKey = /^(date|eventDate|startDate|endDate|birthDate|dateNaissance|dateNaissanceFormatted)$/i.test(key);
      return [key, dateKey ? normalizeDateValue(item) : normalizeDates(item)];
    }));
  }
  return value;
};

const normalizeModels = (value: any) => collectionToArray(value).map((model) => ({ ...model, isActive: true, status: 'active' }));
const pick = (o: any, ...keys: string[]) => keys.map((k) => o?.[k]).find((v) => v !== undefined && v !== null && v !== '');
const asNumber = (v: any) => {
  const n = Number(String(v ?? '').replace(/[^0-9.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

async function mirrorIntakeToSupabase(key: string, item: any) {
  const legacyId = String(item?.id || item?.legacyId || crypto.randomUUID());
  try {
    if (key === 'castingApplications') {
      await submitSupabaseRow('casting_applications', {
        legacy_id: legacyId,
        full_name: pick(item, 'fullName', 'name', 'nomComplet', 'nom'),
        first_name: pick(item, 'firstName', 'prenom'),
        last_name: pick(item, 'lastName', 'nom'),
        email: pick(item, 'email', 'mail'),
        phone: pick(item, 'phone', 'telephone', 'whatsapp'),
        gender: pick(item, 'gender', 'sexe'),
        birth_date: pick(item, 'birthDate', 'dateNaissance') || null,
        age: asNumber(pick(item, 'age')),
        city: pick(item, 'city', 'ville', 'location'),
        height_cm: asNumber(pick(item, 'heightCm', 'height', 'taille')),
        status: String(pick(item, 'status', 'statut') || 'new'),
        photos: pick(item, 'photos', 'images', 'portfolioImages') || [],
        measurements: pick(item, 'measurements', 'mensurations') || {},
        experience: pick(item, 'experience', 'experienceLevel'),
        notes: pick(item, 'notes', 'motivation'),
        raw_data: item,
        created_at: pick(item, 'createdAt', 'submittedAt', 'date') || new Date().toISOString(),
      });
      return;
    }
    if (key === 'fashionDayApplications') {
      await submitSupabaseRow('fashion_day_applications', {
        legacy_id: legacyId,
        applicant_name: pick(item, 'name', 'fullName', 'brandName', 'designerName'),
        email: pick(item, 'email', 'mail'),
        phone: pick(item, 'phone', 'telephone', 'whatsapp'),
        application_type: pick(item, 'type', 'applicationType', 'role', 'category'),
        status: String(pick(item, 'status', 'statut') || 'new'),
        raw_data: item,
        created_at: pick(item, 'createdAt', 'submittedAt', 'date') || new Date().toISOString(),
      });
      return;
    }
    if (key === 'contactMessages') {
      await submitSupabaseRow('contact_messages', {
        legacy_id: legacyId,
        name: pick(item, 'name', 'fullName'),
        email: pick(item, 'email', 'mail'),
        phone: pick(item, 'phone', 'telephone'),
        subject: pick(item, 'subject', 'objet'),
        message: pick(item, 'message', 'body', 'content'),
        status: String(pick(item, 'status', 'statut') || 'new'),
        raw_data: item,
        created_at: pick(item, 'createdAt', 'submittedAt', 'date') || new Date().toISOString(),
      });
      return;
    }
    if (key === 'bookingRequests') {
      await submitSupabaseRow('booking_requests', {
        legacy_id: legacyId,
        name: pick(item, 'name', 'fullName', 'clientName'),
        email: pick(item, 'email', 'mail'),
        phone: pick(item, 'phone', 'telephone'),
        model_id: pick(item, 'modelId') || null,
        status: String(pick(item, 'status', 'statut') || 'new'),
        raw_data: item,
        created_at: pick(item, 'createdAt', 'submittedAt', 'date') || new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error(`[data] Supabase intake mirror failed for ${key}/${legacyId}`, error);
  }
}

export async function GET() {
  const profile = await getCurrentAppProfile();

  // Public visitors must receive the normalized Supabase tables for business data.
  // This prevents the client-side refresh from overwriting SSR data with migrated
  // Firebase fixtures still present in app_collections.
  if (!profile) {
    const publicData = await getPublicAppState();
    return NextResponse.json(
      { data: normalizeDates(publicData), authenticated: false, role: null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const allowedKeys = KNOWN_COLLECTIONS.filter((key) => canReadCollection(key, profile));
  const rows = await getCollections(allowedKeys);
  const data: any = Object.fromEntries(rows.map((row) => [row.key, row.data]));
  if (Array.isArray(data.models)) data.models = normalizeModels(data.models);
  return NextResponse.json(
    { data: normalizeDates(data), authenticated: true, role: profile.role || null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function PUT(request: Request) {
  const profile = await getCurrentAppProfile();
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw || typeof raw !== 'object') return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  const body: any = normalizeDates(raw);
  if (Array.isArray(body.models)) body.models = normalizeModels(body.models);

  if (profile?.role === 'admin') {
    for (const [key, value] of Object.entries(body)) {
      if (key === 'apiKeys' || typeof value === 'undefined') continue;
      await setCollection(key, value);
    }
    return NextResponse.json({ success: true });
  }

  if (profile?.role === 'manager') {
    let written = 0;
    for (const [key, value] of Object.entries(body)) {
      if (key === 'apiKeys' || typeof value === 'undefined' || !canWriteCollection(key, profile, 'update')) continue;
      await setCollection(key, value);
      written++;
    }
    return written
      ? NextResponse.json({ success: true, written })
      : NextResponse.json({ error: 'Aucune collection autorisée dans cette opération.' }, { status: 403 });
  }

  if (profile?.role === 'student') {
    const submitted = collectionToArray(body.models).find((item) => String(item?.id) === String(profile.profileId));
    if (!submitted) return NextResponse.json({ error: 'Profil mannequin absent.' }, { status: 400 });
    const current = collectionToArray(await getCollection('models'));
    const index = current.findIndex((item) => String(item?.id) === String(profile.profileId));
    if (index < 0) return NextResponse.json({ error: 'Profil introuvable.' }, { status: 404 });
    current[index] = {
      ...current[index],
      ...submitted,
      id: profile.profileId,
      authUserId: profile.userId,
      supabaseUserId: profile.userId,
      email: profile.email,
      username: profile.identifier,
      isActive: true,
      status: 'active',
    };
    await setCollection('models', current);
    return NextResponse.json({ success: true });
  }

  let accepted = 0;
  for (const key of INTAKE_COLLECTIONS) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const before = collectionToArray(await getCollection(key));
    const incoming = collectionToArray(body[key]);
    const seen = new Set(before.map((item) => String(item?.id ?? JSON.stringify(item))));
    for (const item of incoming) {
      const id = String(item?.id ?? JSON.stringify(item));
      if (!seen.has(id)) {
        before.push(item);
        seen.add(id);
        await mirrorIntakeToSupabase(key, item);
      }
    }
    await setCollection(key, before);
    accepted++;
  }
  if (!accepted) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json({ success: true });
}
