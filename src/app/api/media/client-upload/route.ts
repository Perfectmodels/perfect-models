import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const IMAGE_MAX = 15 * 1024 * 1024;
const VIDEO_MAX = 1024 * 1024 * 1024;

type ClientPayload = {
  kind?: 'image' | 'video';
  scope?: string;
};

const parsePayload = (value?: string | null): ClientPayload => {
  if (!value) return {};
  try {
    return JSON.parse(value) as ClientPayload;
  } catch {
    return {};
  }
};

const normalizeScope = (value: string) =>
  value.replace(/[^a-z0-9/_-]+/gi, '-').replace(/^\/+|\/+$/g, '') || 'media';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);
        const kind = payload.kind === 'video' ? 'video' : 'image';
        const scope = normalizeScope(String(payload.scope || 'media'));

        // Casting submissions are intentionally allowed without an admin session.
        const isPublicCasting = scope === 'casting';
        const profile = isPublicCasting ? null : await getCurrentAppProfile();
        if (!isPublicCasting && (!profile || profile.role !== 'admin')) {
          throw new Error('Accès administrateur requis pour téléverser ce média.');
        }

        if (!pathname.startsWith(`pmm/${scope}/`)) {
          throw new Error('Chemin de stockage non autorisé.');
        }

        return {
          allowedContentTypes: kind === 'video' ? VIDEO_TYPES : IMAGE_TYPES,
          maximumSizeInBytes: kind === 'video' ? VIDEO_MAX : IMAGE_MAX,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: profile?.userId || null,
            kind,
            scope,
            publicCasting: isPublicCasting,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Le module appelant persiste l'URL dans ses données métier.
      },
    });

    return NextResponse.json(response);
  } catch (cause: any) {
    return NextResponse.json(
      { error: cause?.message || "Impossible d'autoriser le téléversement." },
      { status: 400 },
    );
  }
}
