import { NextResponse } from 'next/server';
import { hasSupabasePrivilegedKey } from '@/lib/supabase-backend';
import { getValidFirebaseIdToken, firebaseDatabaseGet } from '@/lib/firebase-backend';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  const profile = await getCurrentAppProfile().catch(() => null);
  const firebaseToken = await getValidFirebaseIdToken().catch(() => null);
  let privateFirebaseReadable = false;
  if (firebaseToken) {
    privateFirebaseReadable = await firebaseDatabaseGet('users', firebaseToken)
      .then(() => true)
      .catch(() => false);
  }

  return NextResponse.json({
    supabasePrivilegedKeyConfigured: hasSupabasePrivilegedKey(),
    firebaseSessionAvailable: Boolean(firebaseToken),
    privateFirebaseReadable,
    authenticated: Boolean(profile),
    role: profile?.role || null,
    readyForPrivateMigration:
      hasSupabasePrivilegedKey() &&
      Boolean(firebaseToken) &&
      privateFirebaseReadable &&
      profile?.role === 'admin',
  }, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
