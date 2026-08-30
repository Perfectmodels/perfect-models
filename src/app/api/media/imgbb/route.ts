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
const IMGBB_DIRECT_HOST = 'i.ibb.co';
const VERIFY_TIMEOUT_MS = 8_000;

function getImgBBConfiguration() {
  if (process.env.IMGBB_API_KEY) {
    return { apiKey: process.env.IMGBB_API_KEY, configuration: 'server' as const };
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

function isDirectImgBBUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === IMGBB_DIRECT_HOST && url.pathname.length > 1;
  } catch {
    return false;
  }
}

async function verifyUploadedImage(url: string) {
  if (!isDirectImgBBUrl(url)) return false;

  const check = async (method: 'HEAD' | 'GET') => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method,
        cache: 'no-store',
        redirect: 'follow',
        signal: controller.signal,
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
      });
      const type = String(response.headers.get('content-type') || '').toLowerCase();
      return response.ok && type.startsWith('image/');
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  };

  return (await check('HEAD')) || (await check('GET'));
}

export function GET() {
  const { apiKey, configuration } = getImgBBConfiguration();
  return NextResponse.json(
    {
      provider: 'imgbb',
      configured: Boolean(apiKey),
      configuration,
      route: '/api/media/imgbb',
      uploadMode: 'server-proxy',
      acceptedTypes: [...IMAGE_TYPES],
      maxImageSizeBytes: MAX_IMAGE_SIZE,
      directImageHost: IMGBB_DIRECT_HOST,
      cors: 'same-origin',
    },
    { status: apiKey ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: 'GET, POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  });
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

    // Les navigateurs envoient toujours les images au proxy serveur PMM.
    // La clé ImgBB n'est jamais exposée côté client et aucun upload cross-origin direct n'est autorisé.
    const isPublicCastingUpload = scope === 'casting' || scope.startsWith('casting-');
    if (isPublicCastingUpload && !isSameOrigin(request)) {
      return NextResponse.json({ error: 'Origine de téléversement non autorisée.' }, { status: 403 });
    }
    if (!isPublicCastingUpload) {
      const profile = await getCurrentAppProfile();
      const isStaffUpload = profile ? ['admin', 'manager'].includes(profile.role) : false;
      const isOwnModelMedia = profile?.role === 'student' && scope.startsWith('models/');
      if (!isStaffUpload && !isOwnModelMedia) {
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
    const directUrl = data?.data?.display_url || data?.data?.url;

    if (!response.ok || !data?.success || !isDirectImgBBUrl(directUrl)) {
      console.error('[media/imgbb] upload failed', response.status, data?.error);
      return NextResponse.json(
        { error: data?.error?.message || 'ImgBB n’a pas retourné une URL image directe valide.' },
        { status: 502 },
      );
    }

    const accessible = await verifyUploadedImage(directUrl);
    if (!accessible) {
      console.error('[media/imgbb] uploaded image is not reachable', directUrl);
      return NextResponse.json(
        { error: 'L’image a été envoyée mais son URL publique ImgBB n’est pas accessible. Réessayez.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url: directUrl,
      displayUrl: directUrl,
      deleteUrl: data.data.delete_url || null,
      provider: 'imgbb',
      verified: true,
      accessible: true,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('[media/imgbb] unexpected error', error);
    return NextResponse.json(
      { error: error?.message || 'Impossible de téléverser cette image.' },
      { status: 500 },
    );
  }
}
