export interface ImgBBUploadResult { url: string }

export interface ImgBBUploadOptions {
  scope?: string;
  onProgress?: (pct: number) => void;
}

const normalizeScope = (value?: string) =>
  String(value || 'media').replace(/[^a-z0-9/_-]+/gi, '-');

export function isDirectImgBBImageUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'i.ibb.co' && url.pathname.length > 1;
  } catch {
    return false;
  }
}

/**
 * Upload an image through the server-only ImgBB proxy.
 *
 * The string overload remains temporarily compatible with legacy callers that
 * used to pass a client-side API key. The key is deliberately ignored: secrets
 * now live exclusively in the `IMGBB_API_KEY` Vercel environment variable.
 */
export async function uploadToImgbb(
  file: File,
  optionsOrLegacyKey?: ImgBBUploadOptions | string,
  legacyProgress?: (pct: number) => void,
): Promise<string> {
  const options = typeof optionsOrLegacyKey === 'object' && optionsOrLegacyKey !== null
    ? optionsOrLegacyKey
    : { onProgress: legacyProgress };
  const onProgress = options.onProgress;

  onProgress?.(10);
  const form = new FormData();
  form.append('file', file);
  form.append('scope', normalizeScope(options.scope));

  const response = await fetch('/api/media/imgbb', {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.verified || !data?.accessible || !isDirectImgBBImageUrl(data?.url)) {
    throw new Error(data?.error || "L'image ImgBB n'a pas pu être vérifiée après téléversement.");
  }

  onProgress?.(100);
  return data.url;
}

export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
export const MAX_IMAGE_SIZE_MB = 4.5;

export function validateFile(file: File, _type: 'image' | 'video' | 'auto') {
  if (!ACCEPTED_IMAGE_TYPES.split(',').includes(file.type)) return 'Format image non accepté.';
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return `Fichier trop lourd (max ${MAX_IMAGE_SIZE_MB} Mo).`;
  return null;
}
