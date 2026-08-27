import 'server-only';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzkodgqxrcxsnfwpmwfb.supabase.co').replace(/\/$/, '');
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function requireConfig() {
  if (!SUPABASE_URL || !SECRET_KEY) {
    throw Object.assign(new Error('Supabase Auth Admin non configuré côté serveur.'), { status: 503 });
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) {
    throw Object.assign(
      new Error(String(data?.msg || data?.message || data?.error_description || data?.error || `Supabase Auth ${response.status}`)),
      { status: response.status, code: data?.code },
    );
  }
  return data;
}

export async function inviteSupabaseUserByEmail(input: {
  email: string;
  name: string;
  redirectTo: string;
}) {
  requireConfig();
  const response = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
    method: 'POST',
    headers: {
      apikey: SECRET_KEY,
      Authorization: `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
      'x-redirect-to': input.redirectTo,
    },
    body: JSON.stringify({
      email: input.email,
      data: { name: input.name, onboarding_source: 'casting' },
    }),
    cache: 'no-store',
  });
  return parseResponse(response);
}
