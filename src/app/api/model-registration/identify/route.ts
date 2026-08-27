import { NextResponse } from 'next/server';
import { verifyAgencyModelIdentity } from '@/lib/model-registration';

export const dynamic = 'force-dynamic';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  }

  try {
    const result = await verifyAgencyModelIdentity({
      agencyIdentifier: String((body as any).agencyIdentifier || ''),
      fullName: String((body as any).fullName || ''),
      email: String((body as any).email || ''),
      phone: String((body as any).phone || ''),
    });
    if (!result.ok) return NextResponse.json({ error: result.error, alreadyClaimed: result.alreadyClaimed === true }, { status: result.status });
    return NextResponse.json({
      ok: true,
      displayName: result.displayName,
      agencyIdentifier: result.agencyIdentifier,
      modelId: result.model.id,
    });
  } catch (error) {
    console.error('[model-registration/identify]', error);
    return NextResponse.json({ error: 'Vérification temporairement indisponible.' }, { status: 500 });
  }
}
