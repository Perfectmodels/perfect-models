'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const input = 'w-full border-0 border-b border-pm-ink/15 bg-transparent px-0 py-4 text-sm text-pm-ink outline-none transition placeholder:text-pm-ink/30 focus:border-pm-coral';

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
    event.preventDefault();
    setBusy(true);
    setError('');
    const result = await login(identifier, password);
    setBusy(false);
    if (!result.success) return setError(result.error || 'Connexion impossible.');
    router.replace(search.get('next') || '/profil');
    router.refresh();
  };

  const forgot = async () => {
    if (!identifier.includes('@')) return setError('Saisissez votre adresse email pour recevoir le lien de réinitialisation.');
    setBusy(true);
    setError('');
    const result = await resetPassword(identifier);
    setBusy(false);
    if (!result.success) return setError(result.error || 'Envoi impossible.');
    setResetSent(true);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-lg py-8 sm:px-4">
      <p className="editorial-kicker text-pm-coral">Espace membre</p>
      <h2 className="mt-5 font-playfair text-5xl font-black italic leading-none sm:text-6xl">Connexion</h2>
      <p className="mt-5 max-w-md text-sm leading-7 text-pm-ink/48">Utilisez l’adresse email ou l’identifiant associé à votre compte PMM.</p>

      <div className="mt-10 space-y-4">
        <input autoComplete="username" required placeholder="Email ou identifiant" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={input} />
        <input autoComplete="current-password" required type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
      </div>

      {error && <p className="mt-5 rounded-r-xl border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {resetSent && <p className="mt-5 rounded-r-xl border-l-2 border-pm-teal bg-pm-sage px-4 py-3 text-sm text-pm-teal">Un lien de réinitialisation vous a été envoyé.</p>}

      <button disabled={busy} className="control-button mt-8 w-full disabled:cursor-wait disabled:opacity-50">{busy ? 'Connexion…' : 'Se connecter'}</button>
      <button type="button" onClick={() => void forgot()} className="mt-5 w-full text-center text-[10px] font-bold uppercase tracking-[.16em] text-pm-ink/40 transition hover:text-pm-wine">Mot de passe oublié ?</button>

      <div className="mt-10 border-t border-pm-ink/10 pt-6 text-center">
        <Link href="/" className="text-[9px] font-black uppercase tracking-[.22em] text-pm-ink/35 transition hover:text-pm-wine">Retour au site</Link>
      </div>
    </form>
  );
}
