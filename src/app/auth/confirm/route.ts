import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set<EmailOtpType>(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

function safeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = String(url.searchParams.get('token_hash') || '').trim();
  const code = String(url.searchParams.get('code') || '').trim();
  const type = String(url.searchParams.get('type') || '').trim() as EmailOtpType;
  const defaultNext = type === 'recovery' || type === 'invite' ? '/auth/set-password' : '/login?verified=1';
  const next = safeNext(url.searchParams.get('next'), defaultNext);

  try {
    const supabase = await createSupabaseServerClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else if (tokenHash && ALLOWED_TYPES.has(type)) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (error) throw error;
    } else {
      throw new Error('Lien incomplet.');
    }

    const response = NextResponse.redirect(new URL(next, url.origin));
    if (next.startsWith('/auth/set-password')) {
      response.cookies.set('pmm_password_grant', '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60,
      });
    }
    return response;
  } catch (error) {
    console.error('[auth/confirm] lien Supabase invalide ou expiré', error);
    return NextResponse.redirect(new URL('/login?auth_error=expired_or_invalid_link', url.origin));
  }
}
