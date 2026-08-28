import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const metadata: Metadata = { title: 'Assistant éditorial IA | PMM', robots: { index: false, follow: false } };

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) redirect('/login');

  return (
    <main className="min-h-screen bg-pm-dark px-6 py-24 text-pm-off-white">
      <div className="mx-auto max-w-5xl border-y border-white/10 py-14 sm:py-20">
        <p className="editorial-kicker text-pm-gold">Administration · Assistant éditorial</p>
        <h1 className="mt-5 max-w-3xl font-playfair text-5xl font-black italic leading-tight sm:text-7xl">Créer, enrichir et publier depuis le Journal.</h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/45">Les outils de génération assistée sont intégrés au flux éditorial du site. Ouvrez le module Journal pour préparer vos contenus, images et publications depuis une seule interface.</p>
        <Link href="/admin/blog" className="pmm-button mt-9 border-pm-gold bg-pm-gold text-black hover:bg-pm-gold-light">Ouvrir le Journal</Link>
      </div>
    </main>
  );
}
