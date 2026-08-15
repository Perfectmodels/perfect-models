// Helper optionnel pour créer l'administrateur via l'API Firebase du projet.
export async function createAdminFirebase() {
  const response = await fetch('/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: 'admin@perfectmodels.online',
      password: 'Pmm2026@',
      name: 'Administration PMM',
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok && response.status !== 400) throw new Error(data?.error || 'Création du compte administrateur impossible.');
  return data;
}
