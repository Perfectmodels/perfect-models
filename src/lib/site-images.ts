import 'server-only';

import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type SiteImages = Record<string, string>;

function normalize(value: unknown): SiteImages {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, typeof item === 'string' ? item.trim() : ''] as const)
      .filter(([, item]) => Boolean(item)),
  );
}

export async function getPublicSiteImages(): Promise<SiteImages> {
  noStore();
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'siteImages')
    .maybeSingle();

  if (error) {
    console.error('[site-images] lecture impossible', error);
    return {};
  }
  return normalize(data?.value);
}

export function imageOverride(images: SiteImages, key: string, fallback = '') {
  return String(images[key] || fallback || '').trim();
}

export function imageOverrides(images: SiteImages, keys: string[], fallbacks: Array<string | undefined> = []) {
  return keys
    .map((key, index) => imageOverride(images, key, String(fallbacks[index] || '')))
    .filter(Boolean);
}
