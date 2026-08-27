import 'server-only';
import { privilegedSupabaseSelect } from '@/lib/supabase-backend';

export type AgencyModelRecord = {
  id: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  auth_user_id?: string | null;
  is_active?: boolean | null;
  status?: string | null;
};

export type ModelIdentityInput = {
  agencyIdentifier: string;
  fullName: string;
  email?: string;
  phone?: string;
};

export function normalizeHumanName(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeAgencyIdentifier(value: unknown) {
  return String(value ?? '').trim().replace(/\s+/g, '').toLowerCase();
}

export function normalizePhone(value: unknown) {
  return String(value ?? '').replace(/\D/g, '');
}

export function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function hasTrustedEmail(value: unknown) {
  const email = normalizeEmail(value);
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith('@example.com'));
}

function hasTrustedPhone(value: unknown) {
  const phone = normalizePhone(value);
  if (phone.length < 8) return false;
  // Ignore obvious legacy placeholder numbers such as 077000001.
  return !/(?:0{4,}|123456|000001)$/.test(phone);
}

function contactMatches(model: AgencyModelRecord, input: ModelIdentityInput) {
  const trustedEmail = hasTrustedEmail(model.email);
  const trustedPhone = hasTrustedPhone(model.phone);
  if (!trustedEmail && !trustedPhone) return true;

  const submittedEmail = normalizeEmail(input.email);
  const submittedPhone = normalizePhone(input.phone);
  const emailMatch = trustedEmail && submittedEmail === normalizeEmail(model.email);
  const storedPhone = normalizePhone(model.phone);
  const phoneMatch = trustedPhone && submittedPhone.length >= 8 && (
    submittedPhone === storedPhone || submittedPhone.slice(-8) === storedPhone.slice(-8)
  );
  return Boolean(emailMatch || phoneMatch);
}

export async function findAgencyModelByIdentifier(identifier: string): Promise<AgencyModelRecord | null> {
  const normalized = normalizeAgencyIdentifier(identifier);
  if (!normalized || normalized.length > 80) return null;

  const rows = await privilegedSupabaseSelect('models?select=id,username,name,email,phone,auth_user_id,is_active,status&order=name.asc');
  const match = (Array.isArray(rows) ? rows : []).find((row: AgencyModelRecord) =>
    normalizeAgencyIdentifier(row.username) === normalized
  );
  return match || null;
}

export async function verifyAgencyModelIdentity(input: ModelIdentityInput) {
  const agencyIdentifier = String(input.agencyIdentifier || '').trim();
  const fullName = String(input.fullName || '').trim();
  const email = normalizeEmail(input.email);
  const phone = String(input.phone || '').trim();

  if (!agencyIdentifier || !fullName) {
    return { ok: false as const, status: 400, error: 'Identifiant agence et nom complet requis.' };
  }

  const model = await findAgencyModelByIdentifier(agencyIdentifier);
  if (!model || model.is_active === false) {
    return { ok: false as const, status: 404, error: 'Aucune fiche mannequin active ne correspond à ces informations.' };
  }

  if (model.auth_user_id) {
    return {
      ok: false as const,
      status: 409,
      error: 'Cette fiche mannequin possède déjà un compte. Utilisez la connexion ou la récupération de mot de passe.',
      alreadyClaimed: true,
    };
  }

  if (normalizeHumanName(model.name) !== normalizeHumanName(fullName)) {
    return { ok: false as const, status: 403, error: 'Les informations fournies ne correspondent pas à la fiche agence.' };
  }

  if (!contactMatches(model, { agencyIdentifier, fullName, email, phone })) {
    return {
      ok: false as const,
      status: 403,
      error: 'L’adresse email ou le téléphone ne correspond pas aux coordonnées enregistrées par l’agence.',
    };
  }

  return {
    ok: true as const,
    model,
    agencyIdentifier: String(model.username || agencyIdentifier),
    displayName: String(model.name || fullName),
  };
}
