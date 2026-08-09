import { get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

const TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

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

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  const form = await request.formData();
  const file = form.get('file');
  const scope = String(form.get('scope') || 'media');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 });
  }

  if (!TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Format image non accepté.' }, { status: 415 });
  }

  if (file.size > 4.5 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Image trop lourde (4,5 Mo maximum).' },
      { status: 413 },
    );
  }

  if (!profile && scope !== 'casting') {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const blob = await put(`pmm/${scope}/${Date.now()}-${safe}`, file, {
    access: 'private',
    addRandomSuffix: true,
  });

  const url = `/api/media/upload?pathname=${encodeURIComponent(blob.pathname)}`;

  return NextResponse.json({ url, pathname: blob.pathname });
}
