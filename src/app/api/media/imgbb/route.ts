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
    if (!isPublicCastingUpload) {
      const profile = await getCurrentAppProfile();
      if (!profile || profile.role !== 'admin') {
        return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
      }
    }

    const apiKey = process.env.IMGBB_API_KEY || process.env.VITE_IMGBB_API_KEY;
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
