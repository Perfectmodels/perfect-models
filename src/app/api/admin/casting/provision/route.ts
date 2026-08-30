import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { submitSupabaseRow } from '@/lib/supabase-backend';

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
    default: return String(value || 'Profil issu du casting Perfect Models Management.');
  }
}

function validEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

async function archiveActivationMessage(input: { applicationId: string; modelId: string; to: string; name: string; username: string }) {
  const sentAt = new Date().toISOString();
  await submitSupabaseRow('contact_messages', {
    name: 'Perfect Models Management',
    email: input.to,
    subject: 'Invitation à votre espace mannequin PMM',
    message: `Invitation Supabase Auth envoyée à ${input.name}.\n\nIdentifiant agence : ${input.username}\nAdresse de connexion : ${input.to}\nLe mannequin choisit lui-même son mot de passe via le lien sécurisé.`,
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
  const adminProfile = await getCurrentAppProfile();
  if (!adminProfile || adminProfile.role !== 'admin') {
    return NextResponse.json({ error: 'La validation finale du casting est réservée à un administrateur.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const applicationId = String(body?.applicationId || '').trim();
  const internalNotes = String(body?.notes || '').trim().slice(0, 5000);
  if (!applicationId) return NextResponse.json({ error: 'Candidature requise.' }, { status: 400 });

  const supabase = createSupabaseAdminClient() as any;
  const { data: application, error: applicationError } = await supabase
    .from('casting_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();
  if (applicationError) return NextResponse.json({ error: applicationError.message }, { status: 400 });
  if (!application) return NextResponse.json({ error: 'Candidature introuvable.' }, { status: 404 });

  const raw = asObject(application.raw_data);
  const email = validEmail(application.email || raw.email);
  if (!email) return NextResponse.json({ error: 'La candidature ne contient pas une adresse e-mail valide.' }, { status: 400 });

  const { data: modelRows, error: modelsError } = await supabase.from('models').select('*');
  if (modelsError) return NextResponse.json({ error: modelsError.message }, { status: 400 });
  const models = Array.isArray(modelRows) ? modelRows : [];

  const firstName = String(application.first_name || raw.firstName || '').trim();
  const lastName = String(application.last_name || raw.lastName || '').trim();
  const fullName = String(application.full_name || `${firstName} ${lastName}`).trim() || email;
  const hintedModelId = String(raw.modelId || '').trim();
  const existingModel = models.find((model: any) =>
    String(model?.casting_application_id || '') === applicationId ||
    (hintedModelId && String(model?.id || '') === hintedModelId) ||
    String(model?.email || '').trim().toLowerCase() === email
  ) || null;

  if (application.account_provisioned_at && existingModel?.auth_user_id) {
    return NextResponse.json({
      success: true,
      alreadyProvisioned: true,
      modelId: existingModel.id,
      username: existingModel.username,
      email: existingModel.email || email,
      invitationSent: true,
      accountProvisionedAt: application.account_provisioned_at,
    });
  }

  const username = String(existingModel?.username || '').trim() || nextUsername(models, firstName || fullName);
  const sourceId = String(application.id || '').trim();
  const modelId = String(existingModel?.id || hintedModelId || `${slug(lastName || fullName)}-${slug(firstName || 'model')}-${slug(sourceId)}`).trim();
  const inviteRedirect = `${SITE_URL}/auth/complete?next=/auth/set-password`;

  const { data: listedUsers, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) return NextResponse.json({ error: `Vérification Supabase Auth impossible : ${usersError.message}` }, { status: 502 });
  const existingAuthUser = listedUsers.users.find((user: any) => String(user.email || '').trim().toLowerCase() === email) || null;

  let authUser = existingAuthUser;
  let newlyInvited = false;

  if (authUser) {
    const linkedToThisModel = String(existingModel?.auth_user_id || '') === String(authUser.id || '');
    const castingSource = authUser.app_metadata?.account_source === 'casting' || authUser.user_metadata?.source === 'casting';
    if (!linkedToThisModel && !castingSource) {
      return NextResponse.json({
        error: 'Cette adresse e-mail est déjà rattachée à un autre compte Supabase. Vérifiez le compte avant de valider cette candidature.',
      }, { status: 409 });
    }
  } else {
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteRedirect,
      data: {
        name: fullName,
        identifier: username,
        model_id: modelId,
        source: 'casting',
        casting_application_id: applicationId,
      },
    });
    if (inviteError || !inviteData.user) {
      return NextResponse.json({ error: inviteError?.message || 'Supabase n’a pas pu créer le compte invité.' }, { status: 400 });
    }
    authUser = inviteData.user;
    newlyInvited = true;
  }

  const userId = String(authUser?.id || '');
  if (!userId) return NextResponse.json({ error: 'Supabase n’a pas retourné d’identifiant utilisateur.' }, { status: 502 });

  const now = new Date().toISOString();
  const measurements = asObject(application.measurements);
  const submittedPhotos = Array.isArray(application.photos) ? application.photos.filter(Boolean).map(String) : [];
  const portfolioImages = [raw.photoPortraitUrl, raw.photoFullBodyUrl, raw.photoProfileUrl, ...submittedPhotos]
    .filter(Boolean)
    .map(String)
    .filter((url, index, list) => list.indexOf(url) === index);
  const portrait = String(raw.photoPortraitUrl || portfolioImages[0] || existingModel?.image_url || '/logo.svg');
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

  try {
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        ...(authUser?.app_metadata || {}),
        role: 'student',
        profile_id: modelId,
        model_id: modelId,
        identifier: username,
        must_change_password: true,
        account_source: 'casting',
        casting_application_id: applicationId,
      },
    });
    if (authUpdateError) throw authUpdateError;

    const { error: modelError } = await supabase.from('models').upsert({
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
      is_public: true,
      is_active: true,
      status: 'active',
      claim_status: 'pending_activation',
      raw_data: {
        ...(existingModel?.raw_data || {}),
        ...raw,
        portfolioImages,
        accountProvisionedAt: now,
        authUserId: userId,
        supabaseUserId: userId,
      },
      updated_at: now,
    }, { onConflict: 'id' });
    if (modelError) throw modelError;

    const { error: profileError } = await supabase.from('profiles').upsert({
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
    }, { onConflict: 'user_id' });
    if (profileError) throw profileError;

    if (portfolioImages.length) {
      const portfolioRows = portfolioImages.map((url, index) => ({ model_id: modelId, url, position: index, caption: index === 0 ? 'Portrait casting' : `Photo casting ${index + 1}` }));
      const { error: portfolioError } = await supabase.from('model_portfolio_images').upsert(portfolioRows, { onConflict: 'model_id,url' });
      if (portfolioError) throw portfolioError;
    }

    const { error: applicationUpdateError } = await supabase.from('casting_applications').update({
      status: 'Accepté',
      notes: internalNotes || application.notes || null,
      account_provisioned_at: now,
      credentials_email_status: 'sent_by_supabase_auth',
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
    }).eq('id', applicationId);
    if (applicationUpdateError) throw applicationUpdateError;
  } catch (error: any) {
    if (newlyInvited) {
      await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
    }
    const isClaimStatusConstraint = String(error?.code || '') === '23514' || String(error?.message || '').includes('models_claim_status_check');
    return NextResponse.json({
      error: isClaimStatusConstraint
        ? 'Le statut d’activation du mannequin n’a pas pu être enregistré. La création a été annulée proprement ; vous pouvez relancer la validation.'
        : `Le compte n’a pas pu être finalisé : ${String(error?.message || 'erreur Supabase')}`,
      code: isClaimStatusConstraint ? 'MODEL_CLAIM_STATUS_INVALID' : 'CASTING_PROVISION_FAILED',
    }, { status: 500 });
  }

  await archiveActivationMessage({ applicationId, modelId, to: email, name: fullName, username }).catch(() => undefined);

  return NextResponse.json({
    success: true,
    modelId,
    username,
    email,
    invitationSent: newlyInvited,
    reusedInvitationUser: !newlyInvited,
    accountProvisionedAt: now,
    passwordDelivery: 'self_service_activation_link',
  });
}
