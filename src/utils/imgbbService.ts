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
 * The server validates the ImgBB API response and direct i.ibb.co URL. CDN
 * reachability is intentionally not a hard requirement because newly uploaded
 * images can take a few seconds to propagate even after ImgBB reports success.
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

  if (!response.ok || !data?.verified || !isDirectImgBBImageUrl(data?.url)) {
    throw new Error(data?.error || "L'image ImgBB n'a pas pu être validée après téléversement.");
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
