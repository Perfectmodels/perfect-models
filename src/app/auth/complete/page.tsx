'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

function safeNext(value: string | null) { return value && value.startsWith('/') && !value.startsWith('//') ? value : '/auth/set-password'; }

type State = { kind: 'loading' | 'error'; message: string };

export default function CompleteAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>({ kind: 'loading', message: 'Validation sécurisée de votre lien…' });

  useEffect(() => {
    let active = true;
    async function complete() {
      try {
        const supabase = createSupabaseBrowserClient();
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');
        const code = searchParams.get('code');
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) throw error || new Error('Session absente.');
        if (data.user.app_metadata?.account_source === 'model-self-signup') {
          if (active) setState({ kind: 'loading', message: 'E-mail confirmé. Nous rattachons maintenant votre profil mannequin à votre espace PMM…' });
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;
          if (!token) throw new Error('Session de confirmation absente.');
          const response = await fetch('/api/auth/model-signup/finalize', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || 'Rattachement impossible.');
          if (active) router.replace(result.redirect || '/profil');
          return;
        }
        if (active) router.replace(safeNext(searchParams.get('next')));
      } catch (error) {
        console.error('[auth/complete]', error);
        if (active) setState({ kind: 'error', message: 'Ce lien est invalide, a expiré ou a déjà été utilisé. Utilisez le lien le plus récent reçu ou demandez-en un nouveau.' });
      }
    }
    void complete();
    return () => { active = false; };
  }, [router, searchParams]);

  return <main className="grid min-h-screen place-items-center bg-pm-ivory px-5 py-12 text-pm-ink">
    <section className="w-full max-w-lg rounded-[2rem] border border-pm-ink/10 bg-white p-7 text-center shadow-[0_28px_85px_rgba(74,31,50,.12)] sm:p-10">
      <Image src="/logopmm.jpg" alt="Perfect Models Management" width={84} height={84} className="mx-auto h-20 w-20 rounded-full border-4 border-pm-peach object-cover" priority />
      {state.kind === 'loading' ? <>
        <LoaderCircle className="mx-auto mt-7 h-7 w-7 animate-spin text-pm-coral" />
        <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-pm-wine">Activation sécurisée</p>
        <h1 className="mt-2 font-playfair text-3xl font-bold">Finalisation de votre compte</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-pm-ink/60" aria-live="polite">{state.message}</p>
      </> : <>
        <div className="mx-auto mt-7 grid h-12 w-12 place-items-center rounded-full bg-amber-50 text-amber-700"><AlertTriangle size={22}/></div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-amber-700">Lien non validé</p>
        <h1 className="mt-2 font-playfair text-3xl font-bold">Nous n’avons pas pu terminer l’activation</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-pm-ink/60" role="alert">{state.message}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2"><Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full bg-pm-wine px-5 text-xs font-extrabold uppercase tracking-[.08em] text-white">Retour à la connexion</Link><Link href="/inscription/mannequin" className="inline-flex min-h-11 items-center justify-center rounded-full border border-pm-ink/15 bg-white px-5 text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink">Activation mannequin</Link></div>
      </>}
    </section>
  </main>;
}
