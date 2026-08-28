import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';

export const metadata: Metadata = { title: "Analyse d'image IA | PMM", robots: { index: false, follow: false } };

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) redirect('/login');
  if (!hasAdminPermission(profile, 'imageAnalysis')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  return (
    <main className="min-h-screen bg-pm-dark px-6 py-24 text-pm-off-white">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-pm-gold">Administration</p>
        <h1 className="font-playfair text-4xl font-black italic">Analyse d&apos;Image IA</h1>
        <p className="mt-6 text-white/40">Fonctionnalité disponible prochainement.</p>
      </div>
    </main>
  );
}
