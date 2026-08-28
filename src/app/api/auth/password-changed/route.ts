import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export async function POST() {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  // Compatibilité avec les anciens clients. La mutation canonique est désormais
  // intégralement réalisée par /api/auth/change-password.
  return NextResponse.json({ success: true, migrated: true });
}
