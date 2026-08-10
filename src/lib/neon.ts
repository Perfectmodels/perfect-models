import { neon } from '@neondatabase/serverless';

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getSql() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error('No server-side Neon database connection is configured.');
  }
  return neon(connectionString);
}

export async function sqlQuery<T = Record<string, unknown>>(query: string, params: unknown[] = []): Promise<T[]> {
  const sql = getSql();
  return (await sql.query(query, params)) as T[];
}
