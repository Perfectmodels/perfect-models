import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import {
  privilegedSupabaseUpsert,
  supabaseAdminUpdateUser,
  supabaseInviteUserByEmail,
} from '@/lib/supabase-backend';
import { collectionToArray, getCollection, setCollection } from '@/lib/app-data';

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

function isUuid(value: unknown) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

async function archiveActivationMessage(input: { applicationId: string; modelId: string; to: string; name: string; username: string }) {
  const sentAt = new Date().toISOString();
  const messages = collectionToArray(await getCollection('contactMessages'));
  messages.push({
    id: `activation-${slug(input.applicationId)}-${Date.now()}`,
    submissionDate: sentAt,
    status: 'Lu',
    name: 'Perfect Models Management',
    email: input.to,
    subject: 'Invitation à votre espace mannequin PMM',
    message: `Invitation Supabase envoyée à ${input.name}.\n\nIdentifiant agence : ${input.username}\nAdresse de connexion : ${input.to}\nLe mannequin choisit lui-même son mot de passe via le lien sécurisé.`,
    folder: 'sent',
    label: 'Casting',
    direction: 'outbound',
    messageType: 'account_activation',
    deliveryStatus: 'sent_by_supabase_auth',
    provider: 'supabase-auth',
    castingApplicationId: input.applicationId,
    modelId: input.modelId,
    recipientName: input.name,
  });
  await setCollection('contactMessages', messages);
}

export async function POST(request: Request) {
  const admin = await getCurrentAppProfile();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const applicationId = String(body?.applicationId || '').trim();
  if (!applicationId) return NextResponse.json({ error: 'Candidature requise.' }, { status: 400 });

  const applications = collectionToArray(await getCollection('castingApplications'));
  const appIndex = applications.findIndex((item) => String(item?.id || '') === applicationId);
  if (appIndex < 0) return NextResponse.json({ error: 'Candidature introuvable.' }, { status: 404 });

  const application = applications[appIndex] as any;
  if (application.status !== 'Accepté') {
    return NextResponse.json({ error: 'La candidature doit être acceptée avant la création du compte.' }, { status: 409 });
  }

  const models = collectionToArray(await getCollection('models'));
  const fullName = `${String(application.firstName || '').trim()} ${String(application.lastName || '').trim()}`.trim();
  const existingIndex = models.findIndex((model) =>
    String(model?.castingApplicationId || '') === applicationId ||
    String(model?.id || '') === String(application.modelId || '') ||
    String(model?.name || '').trim().toLowerCase() === fullName.toLowerCase()
  );
  const existingModel = existingIndex >= 0 ? models[existingIndex] : null;

  if (application.accountProvisionedAt && (existingModel?.supabaseUserId || existingModel?.authUserId)) {
    return NextResponse.json({
      success: true,
      alreadyProvisioned: true,
      modelId: existingModel.id,
      username: existingModel.username,
      email: existingModel.email,
      activationEmailStatus: application.activationEmailStatus || application.credentialsEmailStatus || null,
    });
  }

  const username = String(existingModel?.username || '').trim() || nextUsername(models, String(application.firstName || ''));
  const modelId = String(existingModel?.id || '').trim() || `${slug(application.lastName)}-${slug(application.firstName)}-${slug(application.id)}`;
  const email = String(application.email || '').trim().toLowerCase();
  const age = application.birthDate ? Math.max(0, new Date().getFullYear() - new Date(application.birthDate).getFullYear()) : undefined;
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
  const permissions = existingModel?.permissions || {
    canAccessFormation: true,
    canAccessClassroom: true,
    canAccessForum: true,
    canViewPhotoshootBriefs: true,
    canViewResults: true,
    canEditProfile: true,
    isActive: true,
  };

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

  const newModel = {
    ...(existingModel || {}),
    id: modelId,
    name: fullName,
    username,
    password: '',
    email,
    supabaseUserId: userId,
    authUserId: userId,
    castingApplicationId: applicationId,
    phone: application.phone || existingModel?.phone || '',
    age,
    birthDate: application.birthDate || existingModel?.birthDate || '',
    nationality: application.nationality || existingModel?.nationality || '',
    instagram: application.instagram || existingModel?.instagram || '',
    height: String(application.height || '').endsWith('cm') ? String(application.height) : `${application.height || '0'}cm`,
    gender: application.gender,
    location: application.city || '',
    imageUrl: application.photoPortraitUrl || application.photoFullBodyUrl || existingModel?.imageUrl || '/logo.svg',
    portfolioImages: [
      application.photoPortraitUrl,
      application.photoFullBodyUrl,
      application.photoProfileUrl,
      ...(existingModel?.portfolioImages || []),
    ].filter(Boolean).filter((url: string, index: number, list: string[]) => list.indexOf(url) === index),
    isPublic: existingModel?.isPublic ?? false,
    isActive: true,
    status: 'active',
    level: existingModel?.level || 'Débutant',
    distinctions: existingModel?.distinctions || [],
    measurements: {
      chest: `${application.chest || '0'}cm`,
      waist: `${application.waist || '0'}cm`,
      hips: `${application.hips || '0'}cm`,
      shoeSize: String(application.shoeSize || '0'),
    },
    categories: existingModel?.categories?.length ? existingModel.categories : ['Défilé', 'Commercial'],
    experience: existingModel?.experience || experienceText(application.experience),
    journey: existingModel?.journey || 'Profil issu du casting Perfect Models Management.',
    quizScores: existingModel?.quizScores || {},
    permissions,
    createdAt: existingModel?.createdAt || now,
    accountProvisionedAt: now,
  };

  await Promise.all([
    privilegedSupabaseUpsert('profiles', {
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
    }, 'user_id'),
    privilegedSupabaseUpsert('models', {
      id: modelId,
      auth_user_id: userId,
      casting_application_id: isUuid(applicationId) ? applicationId : null,
      username,
      name: fullName,
      email,
      phone: application.phone || null,
      gender: application.gender || null,
      age: Number.isFinite(age) ? age : null,
      birth_date: application.birthDate || null,
      nationality: application.nationality || null,
      instagram_url: application.instagram || null,
      height: newModel.height,
      location: application.city || null,
      level: newModel.level,
      image_url: newModel.imageUrl,
      categories: newModel.categories,
      measurements: newModel.measurements,
      distinctions: newModel.distinctions,
      experience: newModel.experience,
      journey: newModel.journey,
      permissions,
      quiz_scores: newModel.quizScores,
      is_public: false,
      is_active: true,
      status: 'active',
      raw_data: application,
      updated_at: now,
    }, 'id'),
    privilegedSupabaseUpsert('model_account_claims', {
      model_id: modelId,
      auth_user_id: userId,
      agency_identifier: username,
      full_name: fullName,
      email,
      phone: application.phone || null,
      status: 'invited',
      verification_method: 'casting_approval',
      activation_email_status: 'sent_by_supabase_auth',
      metadata: { casting_application_id: applicationId },
      updated_at: now,
    }, 'model_id'),
  ]);

  if (existingIndex >= 0) models[existingIndex] = newModel;
  else models.push(newModel);
  await setCollection('models', models);

  applications[appIndex] = {
    ...application,
    status: 'Accepté',
    modelId,
    authUserId: userId,
    supabaseUserId: userId,
    accountProvisionedAt: now,
    activationEmailStatus: 'sent_by_supabase_auth',
    activationEmailSentAt: now,
    credentialsEmailStatus: 'replaced_by_secure_invite',
  };
  await setCollection('castingApplications', applications);

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
