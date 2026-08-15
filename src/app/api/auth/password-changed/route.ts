import { NextResponse } from 'next/server';
import { firebaseDatabasePut, getValidFirebaseIdToken } from '@/lib/firebase-backend';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export async function POST() {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const token = await getValidFirebaseIdToken();
  await firebaseDatabasePut(`users/${profile.userId}/mustChangePassword`, false, token);
  return NextResponse.json({ success: true });
}
