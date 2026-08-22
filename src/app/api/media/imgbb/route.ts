import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
const MAX_IMAGE_SIZE = 4.5 * 1024 * 1024;

function getImgBBConfiguration() {
  if (process.env.IMGBB_API_KEY) {
    return { apiKey: process.env.IMGBB_API_KEY, configuration: 'server' as const };
  }

  // Temporary migration path. This legacy name is explicitly excluded from
  // the client bundle in next.config.mjs and is consumed only by this route.
  if (process.env.VITE_IMGBB_API_KEY) {
    return { apiKey: process.env.VITE_IMGBB_API_KEY, configuration: 'legacy-server' as const };
  }

  return { apiKey: '', configuration: 'missing' as const };
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function GET() {
  const { apiKey, configuration } = getImgBBConfiguration();
  return NextResponse.json(
    { provider: 'imgbb', configured: Boolean(apiKey), configuration },
    { status: apiKey ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const scope = String(form.get('scope') || 'media').replace(/[^a-z0-9/_-]+/gi, '-');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier requis.' }, { status: 400 });
    }
    if (!IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Format image non accepté.' }, { status: 415 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image trop lourde (4,5 Mo maximum).' }, { status: 413 });
    }

    // The public casting form is intentionally upload-only: it may upload
    // candidate photos, but it must never gain access to the media library.
    const isPublicCastingUpload = scope === 'casting';
    if (isPublicCastingUpload && !isSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine de téléversement non autorisée.' }, { status: 403 });
    }
    if (!isPublicCastingUpload) {
      const profile = await getCurrentAppProfile();
      const isAdminUpload = profile?.role === 'admin';
      const isOwnModelMedia = profile?.role === 'student' && scope.startsWith('models/');
      if (!isAdminUpload && !isOwnModelMedia) {
        return NextResponse.json({ error: 'Accès autorisé requis.' }, { status: 403 });
      }
    }

    const { apiKey } = getImgBBConfiguration();
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé ImgBB non configurée sur le serveur.' }, { status: 503 });
    }

    const uploadForm = new FormData();
    uploadForm.append('key', apiKey);
    uploadForm.append('image', file);
    uploadForm.append('name', `pmm-${scope.replace(/\//g, '-')}-${Date.now()}`);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: uploadForm,
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.success || !data?.data?.url) {
      console.error('[media/imgbb] upload failed', response.status, data?.error);
      return NextResponse.json(
        { error: data?.error?.message || 'Échec du téléversement ImgBB.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url: data.data.url,
      displayUrl: data.data.display_url || data.data.url,
      deleteUrl: data.data.delete_url || null,
      provider: 'imgbb',
    });
  } catch (error: any) {
    console.error('[media/imgbb] unexpected error', error);
    return NextResponse.json(
      { error: error?.message || 'Impossible de téléverser cette image.' },
      { status: 500 },
    );
  }
}
