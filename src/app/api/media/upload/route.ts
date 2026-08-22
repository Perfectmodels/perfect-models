import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const pathname = new URL(request.url).searchParams.get('pathname');

  if (!pathname || !pathname.startsWith('pmm/')) {
    return NextResponse.json({ error: 'Fichier invalide.' }, { status: 400 });
  }

  const result = await get(pathname, { access: 'private' });

  if (!result || result.statusCode !== 200) {
    return new NextResponse('Fichier introuvable.', { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Ce téléversement est désactivé. Utilisez /api/media/imgbb pour les images.' },
    { status: 410 },
  );
}
