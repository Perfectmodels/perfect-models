import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabasePut, firebaseSignUp } from '@/lib/firebase-backend';
import { collectionToArray, getCollection, setCollection } from '@/lib/app-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.perfectmodels.online';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || 'contact@perfectmodels.online';

const slug = (value: unknown) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

function generateTemporaryPassword(length = 14) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%*-_';
  const all = upper + lower + digits + symbols;
  const pick = (set: string) => set[randomInt(0, set.length)];
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (chars.length < length) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

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

async function sendCredentialsEmail(input: {
  to: string;
  name: string;
  username: string;
  password: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY non configurée.');
  const loginUrl = `${SITE_URL.replace(/\/$/, '')}/login`;
  const htmlContent = `
    <html><body style="margin:0;background:#080808;font-family:Arial,sans-serif;color:#f5f5f5">
      <div style="max-width:620px;margin:0 auto;padding:36px 24px">
        <div style="border:1px solid #b9965b;background:#101010;padding:32px;border-radius:14px">
          <p style="margin:0 0 8px;color:#c8a96b;font-size:12px;letter-spacing:2px;text-transform:uppercase">Perfect Models Management</p>
          <h1 style="margin:0 0 20px;font-size:28px;color:#ffffff">Bienvenue dans l’agence, ${escapeHtml(input.name)}</h1>
          <p style="line-height:1.7;color:#d7d7d7">Votre profil de casting a été validé. Votre espace mannequin PMM vient d’être créé automatiquement.</p>
          <div style="margin:24px 0;padding:20px;background:#050505;border:1px solid #2a2a2a;border-radius:10px">
            <p style="margin:0 0 10px"><strong style="color:#c8a96b">Identifiant :</strong> ${escapeHtml(input.username)}</p>
            <p style="margin:0 0 10px"><strong style="color:#c8a96b">Adresse de connexion :</strong> ${escapeHtml(input.to)}</p>
            <p style="margin:0"><strong style="color:#c8a96b">Mot de passe temporaire :</strong> ${escapeHtml(input.password)}</p>
          </div>
          <p style="line-height:1.7;color:#d7d7d7">Lors de votre première connexion, vous pourrez remplacer ce mot de passe par un mot de passe personnel si vous le souhaitez.</p>
          <p style="margin:28px 0"><a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#c8a96b;color:#080808;text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:8px">Accéder à mon espace PMM</a></p>
          <p style="font-size:12px;line-height:1.6;color:#888">Pour votre sécurité, ne partagez jamais votre mot de passe. Perfect Models Management ne vous demandera jamais votre mot de passe par téléphone ou messagerie.</p>
        </div>
      </div>
    </body></html>`;

  let lastError = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: 'Perfect Models Management', email: DEFAULT_FROM_EMAIL },
        to: [{ email: input.to, name: input.name }],
        subject: 'Votre profil PMM est validé — vos accès mannequin',
        htmlContent,
      }),
      cache: 'no-store',
    });
    if (response.ok) return response.json().catch(() => ({}));
    const body = await response.json().catch(() => ({}));
    lastError = String(body?.message || `Brevo ${response.status}`);
  }
  throw new Error(lastError || 'Envoi de l’email impossible.');
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
  if (!String(application.email || '').includes('@')) {
    return NextResponse.json({ error: 'La candidature ne contient pas une adresse email valide.' }, { status: 400 });
  }

  const models = collectionToArray(await getCollection('models'));
  const fullName = `${String(application.firstName || '').trim()} ${String(application.lastName || '').trim()}`.trim();
  const existingIndex = models.findIndex((model) =>
    String(model?.castingApplicationId || '') === applicationId ||
    String(model?.id || '') === String(application.modelId || '') ||
    String(model?.name || '').trim().toLowerCase() === fullName.toLowerCase()
  );
  const existingModel = existingIndex >= 0 ? models[existingIndex] : null;

  if (application.accountProvisionedAt && existingModel?.firebaseUid && existingModel.firebaseUid !== 'server-pending') {
    return NextResponse.json({
      success: true,
      alreadyProvisioned: true,
      modelId: existingModel.id,
      username: existingModel.username,
      email: existingModel.email,
    });
  }

  const username = String(existingModel?.username || '').trim() || nextUsername(models, String(application.firstName || ''));
  const modelId = String(existingModel?.id || '').trim() || `${slug(application.lastName)}-${slug(application.firstName)}-${slug(application.id)}`;
  const email = String(application.email).trim().toLowerCase();
  const password = generateTemporaryPassword();
  const age = application.birthDate
    ? Math.max(0, new Date().getFullYear() - new Date(application.birthDate).getFullYear())
    : undefined;

  let authResult: any;
  try {
    authResult = await firebaseSignUp(email, password, fullName);
  } catch (error: any) {
    const message = String(error?.message || '');
    if (message.includes('EMAIL_EXISTS')) {
      return NextResponse.json({
        error: 'Un compte Firebase existe déjà avec l’adresse email de cette candidature. Utilisez la récupération de mot de passe ou liez ce compte manuellement avant de réessayer.',
      }, { status: 409 });
    }
    throw error;
  }

  const userId = String(authResult?.localId || '');
  if (!userId) return NextResponse.json({ error: 'Firebase n’a pas retourné d’identifiant utilisateur.' }, { status: 502 });

  const now = new Date().toISOString();
  const newModel = {
    ...(existingModel || {}),
    id: modelId,
    name: fullName,
    username,
    password: '',
    email,
    firebaseUid: userId,
    authUserId: userId,
    castingApplicationId: applicationId,
    phone: application.phone || existingModel?.phone || '',
    age,
    height: String(application.height || '').endsWith('cm') ? String(application.height) : `${application.height || '0'}cm`,
    gender: application.gender,
    location: application.city || '',
    imageUrl: application.photoPortraitUrl || application.photoFullBodyUrl || existingModel?.imageUrl || '/logo.svg',
    portfolioImages: [application.photoPortraitUrl, application.photoFullBodyUrl, application.photoProfileUrl, ...(existingModel?.portfolioImages || [])].filter(Boolean).filter((url: string, index: number, list: string[]) => list.indexOf(url) === index),
    isPublic: existingModel?.isPublic ?? false,
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
    permissions: existingModel?.permissions || {
      canAccessFormation: true,
      canAccessClassroom: true,
      canAccessForum: true,
      canViewPhotoshootBriefs: true,
      canViewResults: true,
      canEditProfile: true,
      isActive: true,
    },
    createdAt: existingModel?.createdAt || now,
    accountProvisionedAt: now,
  };

  await firebaseDatabasePut(`users/${userId}`, {
    id: userId,
    email,
    name: fullName,
    identifier: username,
    matricule: username,
    role: 'student',
    app_role: 'student',
    profileId: modelId,
    status: 'active',
    mustChangePassword: true,
    permissions: newModel.permissions,
    createdAt: now,
  }, authResult.idToken || undefined);

  if (existingIndex >= 0) models[existingIndex] = newModel;
  else models.push(newModel);
  await setCollection('models', models);

  applications[appIndex] = {
    ...application,
    status: 'Accepté',
    modelId,
    authUserId: userId,
    accountProvisionedAt: now,
    credentialsEmailStatus: 'pending',
  };
  await setCollection('castingApplications', applications);

  try {
    await sendCredentialsEmail({ to: email, name: fullName, username, password });
    applications[appIndex] = { ...applications[appIndex], credentialsEmailStatus: 'sent', credentialsSentAt: new Date().toISOString() };
    await setCollection('castingApplications', applications);
  } catch (emailError: any) {
    applications[appIndex] = { ...applications[appIndex], credentialsEmailStatus: 'failed', credentialsEmailError: String(emailError?.message || 'Erreur Brevo') };
    await setCollection('castingApplications', applications);
    return NextResponse.json({
      success: true,
      warning: 'Le compte a été créé mais l’email des identifiants n’a pas pu être envoyé.',
      modelId,
      username,
      email,
    }, { status: 207 });
  }

  return NextResponse.json({ success: true, modelId, username, email, credentialsSent: true });
}
