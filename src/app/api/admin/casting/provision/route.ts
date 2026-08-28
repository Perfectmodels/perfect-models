import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import {
  privilegedSupabaseSelect,
  privilegedSupabaseUpsert,
  submitSupabaseRow,
  supabaseAdminUpdateUser,
  supabaseInviteUserByEmail,
} from '@/lib/supabase-backend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.perfectmodels.online').replace(/\/$/, '');
const slug = (value: unknown) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function nextUsername(models: any[], firstName: string) {
  const initial = (firstName.trim().charAt(0) || 'M').toUpperCase().replace(/[^A-Z]/g, '') || 'M';
  const prefix = `Man-PMM${initial}`;
  const numbers = models
    .map((model) => String(model?.username || ''))
    .filter((username) => username.startsWith(prefix))
    .map((username) => Number.parseInt(username.slice(prefix.length), 10))
    .filter(Number.isFinite);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${prefix}${String(next).padStart(2, '0')}`;
}

function experienceText(value: unknown) {
  switch (String(value || '')) {
    case 'none': return 'Débutant(e) sans expérience préalable, prêt(e) à apprendre les bases du métier.';
    case 'beginner': return 'A déjà participé à quelques shootings photo en amateur ou pour de petites marques.';
    case 'intermediate': return 'A une expérience préalable en agence et a participé à des défilés ou des campagnes locales.';
    case 'professional': return 'Carrière de mannequin professionnel(le) établie avec un portfolio solide.';
    default: return 'Expérience à renseigner par l’administrateur.';
  }
}

async function archiveActivationMessage(input: { applicationId: string; modelId: string; to: string; name: string; username: string }) {
  const sentAt = new Date().toISOString();
  await submitSupabaseRow('contact_messages', {
    name: 'Perfect Models Management',
    email: input.to,
    subject: 'Invitation à votre espace mannequin PMM',
    message: `Invitation Supabase envoyée à ${input.name}.\n\nIdentifiant agence : ${input.username}\nAdresse de connexion : ${input.to}\nLe mannequin choisit lui-même son mot de passe via le lien sécurisé.`,
    status: 'Lu',
    raw_data: {
      folder: 'sent',
      label: 'Casting',
      direction: 'outbound',
      messageType: 'account_activation',
      deliveryStatus: 'sent_by_supabase_auth',
      provider: 'supabase-auth',
      castingApplicationId: input.applicationId,
      modelId: input.modelId,
      recipientName: input.name,
      sentAt,
    },
    created_at: sentAt,
  });
}

export async function POST(request: Request) {
  const admin = await getCurrentAppProfile();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const applicationId = String(body?.applicationId || '').trim();
  if (!applicationId) return NextResponse.json({ error: 'Candidature requise.' }, { status: 400 });

  const applicationRows = await privilegedSupabaseSelect(`casting_applications?select=*&id=eq.${encodeURIComponent(applicationId)}&limit=1`);
  const application = Array.isArray(applicationRows) ? applicationRows[0] : null;
  if (!application) return NextResponse.json({ error: 'Candidature introuvable.' }, { status: 404 });
  if (application.status !== 'Accepté') {
    return NextResponse.json({ error: 'La candidature doit être acceptée avant la création du compte.' }, { status: 409 });
  }

  const models = await privilegedSupabaseSelect('models?select=*');
  const modelRows = Array.isArray(models) ? models : [];
  const raw = application.raw_data && typeof application.raw_data === 'object' ? application.raw_data : {};
  const fullName = String(application.full_name || `${application.first_name || raw.firstName || ''} ${application.last_name || raw.lastName || ''}`).trim();
  const hintedModelId = String(raw.modelId || '').trim();
  const existingModel = modelRows.find((model: any) =>
    String(model?.casting_application_id || '') === applicationId ||
    (hintedModelId && String(model?.id || '') === hintedModelId) ||
    String(model?.name || '').trim().toLowerCase() === fullName.toLowerCase()
  ) || null;

  if (application.account_provisioned_at && existingModel?.auth_user_id) {
    return NextResponse.json({
      success: true,
      alreadyProvisioned: true,
      modelId: existingModel.id,
      username: existingModel.username,
      email: existingModel.email,
      activationEmailStatus: raw.activationEmailStatus || application.credentials_email_status || null,
    });
  }

  const firstName = String(application.first_name || raw.firstName || '').trim();
  const lastName = String(application.last_name || raw.lastName || '').trim();
  const username = String(existingModel?.username || '').trim() || nextUsername(modelRows, firstName);
  const sourceId = String(raw.id || application.id || '').trim();
  const modelId = String(existingModel?.id || hintedModelId || `${slug(lastName)}-${slug(firstName)}-${slug(sourceId)}`).trim();
  const email = String(application.email || raw.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
  }

  let invited: any;
  try {
    invited = await supabaseInviteUserByEmail(email, `${SITE_URL}/auth/complete?next=/auth/set-password`, {
      name: fullName,
      identifier: username,
      model_id: modelId,
      source: 'casting',
    });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (/already|exists|registered/i.test(message)) {
      return NextResponse.json({ error: 'Un compte Supabase existe déjà avec cette adresse email.' }, { status: 409 });
    }
    throw error;
  }

  const authUser = invited?.user || invited;
  const userId = String(authUser?.id || '');
  if (!userId) return NextResponse.json({ error: 'Supabase n’a pas retourné d’identifiant utilisateur.' }, { status: 502 });

  const now = new Date().toISOString();
  const measurements = application.measurements && typeof application.measurements === 'object' ? application.measurements : {};
  const photos = Array.isArray(application.photos) ? application.photos.filter(Boolean) : [];
  const portrait = String(raw.photoPortraitUrl || photos[0] || existingModel?.image_url || '/logo.svg');
  const portfolioImages = [raw.photoPortraitUrl, raw.photoFullBodyUrl, raw.photoProfileUrl, ...photos]
    .filter(Boolean)
    .map(String)
    .filter((url, index, list) => list.indexOf(url) === index);
  const birthDate = String(application.birth_date || raw.birthDate || '').trim() || null;
  const age = Number.isFinite(Number(application.age))
    ? Number(application.age)
    : birthDate
      ? Math.max(0, new Date().getFullYear() - new Date(birthDate).getFullYear())
      : null;
  const height = application.height_cm ? `${application.height_cm}cm` : existingModel?.height || '';
  const permissions = existingModel?.permissions || {
    canAccessFormation: true,
    canAccessClassroom: true,
    canAccessForum: true,
    canViewPhotoshootBriefs: true,
    canViewResults: true,
    canEditProfile: true,
    isActive: true,
  };
  const normalizedMeasurements = existingModel?.measurements || {
    chest: measurements.chest ? `${measurements.chest}cm` : '',
    waist: measurements.waist ? `${measurements.waist}cm` : '',
    hips: measurements.hips ? `${measurements.hips}cm` : '',
    shoeSize: String(measurements.shoeSize || ''),
  };
  const categories = Array.isArray(existingModel?.categories) && existingModel.categories.length ? existingModel.categories : ['Défilé', 'Commercial'];
  const distinctions = Array.isArray(existingModel?.distinctions) ? existingModel.distinctions : [];
  const experience = String(existingModel?.experience || experienceText(application.experience || raw.experience));
  const journey = String(existingModel?.journey || 'Profil issu du casting Perfect Models Management.');
  const quizScores = existingModel?.quiz_scores || {};

  await supabaseAdminUpdateUser(userId, {
    app_metadata: {
      ...(authUser?.app_metadata || {}),
      role: 'student',
      profile_id: modelId,
      model_id: modelId,
      identifier: username,
      must_change_password: true,
      account_source: 'casting',
    },
  });

  await privilegedSupabaseUpsert('models', {
    id: modelId,
    auth_user_id: userId,
    casting_application_id: application.id,
    username,
    name: fullName,
    email,
    phone: application.phone || raw.phone || null,
    gender: application.gender || raw.gender || null,
    age,
    birth_date: birthDate,
    nationality: raw.nationality || null,
    instagram_url: raw.instagram || null,
    height,
    location: application.city || raw.city || null,
    level: existingModel?.level || 'Débutant',
    image_url: portrait,
    categories,
    measurements: normalizedMeasurements,
    distinctions,
    experience,
    journey,
    permissions,
    quiz_scores: quizScores,
    is_public: existingModel?.is_public ?? false,
    is_active: true,
    status: 'active',
    raw_data: {
      ...(existingModel?.raw_data || {}),
      ...raw,
      portfolioImages,
      accountProvisionedAt: now,
      authUserId: userId,
      supabaseUserId: userId,
    },
    updated_at: now,
  }, 'id');

  await privilegedSupabaseUpsert('profiles', {
    user_id: userId,
    role: 'student',
    identifier: username,
    display_name: fullName,
    email,
    model_id: modelId,
    must_change_password: true,
    is_active: true,
    metadata: { permissions, source: 'casting', casting_application_id: applicationId },
    updated_at: now,
  }, 'user_id');

  await privilegedSupabaseUpsert('model_account_claims', {
    model_id: modelId,
    auth_user_id: userId,
    agency_identifier: username,
    full_name: fullName,
    email,
    phone: application.phone || raw.phone || null,
    status: 'invited',
    verification_method: 'casting_approval',
    activation_email_status: 'sent_by_supabase_auth',
    metadata: { casting_application_id: applicationId },
    updated_at: now,
  }, 'model_id');

  await privilegedSupabaseUpsert('casting_applications', {
    ...application,
    status: 'Accepté',
    account_provisioned_at: now,
    credentials_email_status: 'replaced_by_secure_invite',
    raw_data: {
      ...raw,
      modelId,
      authUserId: userId,
      supabaseUserId: userId,
      accountProvisionedAt: now,
      activationEmailStatus: 'sent_by_supabase_auth',
      activationEmailSentAt: now,
    },
    updated_at: now,
  }, 'id');

  await archiveActivationMessage({ applicationId, modelId, to: email, name: fullName, username }).catch(() => undefined);

  return NextResponse.json({
    success: true,
    modelId,
    username,
    email,
    invitationSent: true,
    passwordDelivery: 'self_service_activation_link',
  });
}
