import 'server-only';

import { getCollection } from './app-data';
import { PUBLIC_COLLECTIONS } from './data-policy';

const PUBLIC_KEYS = Array.from(PUBLIC_COLLECTIONS).filter((key) => key !== 'seoConfig');

export async function getPublicAppState(): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    PUBLIC_KEYS.map(async (key) => {
      try {
        return [key, await getCollection(key)] as const;
      } catch {
        return [key, null] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}
