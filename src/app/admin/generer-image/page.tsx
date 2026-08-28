import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import ArticleGenerator from '@/components/ArticleGenerator';

export const metadata: Metadata = { title: "Génération d'image IA | PMM", robots: { index: false, follow: false } };

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) redirect('/login');
  return (
    <main className="min-h-screen bg-pm-dark px-6 py-24 text-pm-off-white">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-pm-gold">Administration</p>
        <h1 className="mb-8 font-playfair text-4xl font-black italic">Génération d&apos;Image IA</h1>
        <ArticleGenerator />
      </div>
    </main>
  );
}
