import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Connexion | Perfect Models Management', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-pm-dark px-5 py-16 text-pm-off-white">
      <Suspense fallback={<div className="text-sm text-white/40">Chargement…</div>}><LoginForm /></Suspense>
    </main>
  );
}
