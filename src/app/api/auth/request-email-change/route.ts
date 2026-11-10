import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  }

  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'student') {
    return NextResponse.json({ error: 'Compte mannequin requis.' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const newEmail = String(body.newEmail || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: 'Saisissez une adresse e-mail valide.' }, { status: 400 });
  }
  if (newEmail === profile.email.toLowerCase()) return NextResponse.json({ success: true, unchanged: true });

  try {
    const supabase = await createSupabaseServerClient();
    const siteOrigin = new URL(String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || request.url)).origin;
    // Supabase sends confirmation to the new address (and, with secure email change, the old one).
    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: siteOrigin + '/auth/confirm?next=/login?verified=1' },
    );
    if (error) return NextResponse.json({ error: 'La demande de changement d’e-mail a échoué. Réessayez.' }, { status: 400 });
    return NextResponse.json({ success: true, confirmationRequired: true });
  } catch {
    return NextResponse.json({ error: 'Impossible de modifier votre adresse e-mail pour le moment.' }, { status: 503 });
  }
}
