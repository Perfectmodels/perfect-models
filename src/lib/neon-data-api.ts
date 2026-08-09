export const NEON_DATA_API_URL =
  process.env.NEON_DATA_API_URL ||
  'https://ep-snowy-math-adl80x03.apirest.c-2.us-east-1.aws.neon.tech/neondb/rest/v1';

export async function neonDataApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${NEON_DATA_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Neon Data API ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`);
  }

  return (await response.json()) as T;
}
