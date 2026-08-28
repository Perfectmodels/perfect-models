const DEFAULT_SUPABASE_URL = 'https://qzkodgqxrcxsnfwpmwfb.supabase.co';

export function getSupabaseUrl() {
  return String(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL,
  ).replace(/\/$/, '');
}

export function getSupabasePublishableKey() {
  const key = String(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '',
  );
  if (!key) throw Object.assign(new Error('Clé publique Supabase absente.'), { status: 503 });
  return key;
}

export function getSupabaseSecretKey() {
  const key = String(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  if (!key) throw Object.assign(new Error('Clé serveur Supabase absente.'), { status: 503 });
  return key;
}

export function isSupabaseServerConfigured() {
  return Boolean(
    getSupabaseUrl() &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY) &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}
