import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Connexion | Perfect Models Management', robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden border-r border-pm-ink/10 bg-pm-peach p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute -left-16 bottom-0 font-playfair text-[18rem] font-black italic leading-none text-pm-wine/[.05]">PMM</div>
          <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full bg-pm-gold-light/55 blur-3xl" />
          <p className="editorial-kicker relative text-pm-wine">Perfect Models Management</p>
          <div className="relative max-w-xl pb-10">
            <h1 className="font-playfair text-7xl font-black italic leading-[.9] tracking-[-.05em] xl:text-8xl">Votre espace. Votre carrière.</h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-pm-ink/55">Accédez à votre profil, vos informations agence et aux outils réservés aux membres Perfect Models Management.</p>
          </div>
        </section>
        <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <Suspense fallback={<div className="text-sm text-pm-ink/40">Chargement…</div>}><LoginForm /></Suspense>
        </section>
      </div>
    </main>
  );
}
