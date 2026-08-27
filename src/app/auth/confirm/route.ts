import { NextResponse } from 'next/server';
import { setSupabaseSession, supabaseVerifyOtp } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

function safeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = String(url.searchParams.get('token_hash') || '').trim();
  const type = String(url.searchParams.get('type') || '').trim();
  const defaultNext = type === 'recovery' || type === 'invite' ? '/auth/set-password' : '/login?verified=1';
  const next = safeNext(url.searchParams.get('next'), defaultNext);

  if (!tokenHash || !ALLOWED_TYPES.has(type)) {
    return NextResponse.redirect(new URL('/login?auth_error=invalid_link', url.origin));
  }

  try {
    const session = await supabaseVerifyOtp(tokenHash, type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email');
    if (!session?.access_token || !session?.refresh_token || !session?.user) {
      throw new Error('Session Supabase absente après vérification.');
    }
    await setSupabaseSession(session);
    return NextResponse.redirect(new URL(next, url.origin));
  } catch (error) {
    console.error('[auth/confirm] vérification du lien impossible', error);
    return NextResponse.redirect(new URL('/login?auth_error=expired_or_invalid_link', url.origin));
  }
}