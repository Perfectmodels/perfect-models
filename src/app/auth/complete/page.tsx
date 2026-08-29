'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

function safeNext(value: string | null) { return value && value.startsWith('/') && !value.startsWith('//') ? value : '/auth/set-password'; }

export default function CompleteAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Validation de votre invitation…');

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
          setMessage('Confirmation reçue. Rattachement de votre profil mannequin…');
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
        if (active) setMessage('Ce lien est invalide, a expiré ou n’a pas pu terminer l’activation. Demandez un nouveau lien si nécessaire.');
      }
    }
    void complete();
    return () => { active = false; };
  }, [router, searchParams]);

  return <main className="grid min-h-screen place-items-center bg-pm-dark px-5 text-center text-pm-ivory"><div><div className="mx-auto grid h-14 w-14 place-items-center border border-pm-gold font-playfair text-xl text-pm-gold">PM</div><p className="mt-7 text-sm text-white/55">{message}</p></div></main>;
}
