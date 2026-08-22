import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const VIDEO_MAX = 1024 * 1024 * 1024;

type ClientPayload = {
  kind?: 'video';
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

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const profile = await getCurrentAppProfile();
        if (!profile || profile.role !== 'admin') {
          throw new Error('Accès administrateur requis pour téléverser ce média.');
        }

        const payload = parsePayload(clientPayload);
        if (payload.kind !== 'video') {
          throw new Error('Les images doivent être téléversées via ImgBB.');
        }
        const kind = 'video' as const;
        const scope = String(payload.scope || 'media').replace(/[^a-z0-9/_-]+/gi, '-');

        if (!scope.startsWith('fashion-day/')) {
          throw new Error('Scope média non autorisé.');
        }
        if (!pathname.startsWith(`pmm/${scope}/`)) {
          throw new Error('Chemin de stockage non autorisé.');
        }

        return {
          allowedContentTypes: VIDEO_TYPES,
          maximumSizeInBytes: VIDEO_MAX,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: profile.userId,
            kind,
            scope,
          }),
        };
      },
      onUploadCompleted: async () => {
        // L'URL Blob est enregistrée avec l'édition Fashion Day par l'interface admin.
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
