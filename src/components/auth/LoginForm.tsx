'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const { login, resetPassword } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    const result = await login(identifier, password);
    setBusy(false);
    if (!result.success) return setError(result.error || 'Connexion impossible.');
    router.replace(search.get('next') || '/profil');
    router.refresh();
  };
  const forgot = async () => {
    if (!identifier.includes('@')) return setError('Saisissez votre adresse email pour recevoir le lien de réinitialisation.');
    setBusy(true); setError('');
    const result = await resetPassword(identifier);
    setBusy(false);
    if (!result.success) return setError(result.error || 'Envoi impossible.');
    setResetSent(true);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-md border border-white/10 bg-black/30 p-7 sm:p-9">
      <p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Supabase Auth</p>
      <h1 className="mt-4 font-playfair text-4xl font-bold">Espace privé</h1>
      <p className="mt-3 text-sm leading-7 text-white/40">Connectez-vous avec votre identifiant ou votre email PMM.</p>
      <div className="mt-8 space-y-4">
        <input autoComplete="username" required placeholder="Email ou identifiant" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-pm-gold/60" />
        <input autoComplete="current-password" required type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-pm-gold/60" />
      </div>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      {resetSent && <p className="mt-4 text-sm text-pm-gold">Lien de réinitialisation envoyé.</p>}
      <button disabled={busy} className="mt-6 w-full bg-pm-gold px-5 py-3 text-[10px] font-black uppercase tracking-[.2em] text-black disabled:opacity-50">{busy ? 'Connexion…' : 'Se connecter'}</button>
      <button type="button" onClick={() => void forgot()} className="mt-4 w-full text-center text-xs text-white/40 hover:text-pm-gold">Mot de passe oublié ?</button>
      <Link href="/" className="mt-8 block text-center text-[9px] font-bold uppercase tracking-wider text-white/25 hover:text-white">Retour au site</Link>
    </form>
  );
}
