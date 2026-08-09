import { neon } from '@neondatabase/serverless';

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured.');
  return neon(connectionString);
}

export async function sqlQuery<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
  const sql = getSql();
  return (await sql.query(query, params)) as T[];
}
