'use client';

// Adaptateur de transition pour les pages legacy. La création réelle des comptes
// mannequin est effectuée côté serveur par /api/admin/casting/provision via Supabase Auth.
export async function createUserWithEmailAndPassword(_auth: unknown, _email: string, _password: string) {
  return { user: { uid: '' } };
}
