'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const input = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10';
const label = 'mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/65';

export default function LoginForm() {
  const baseId = useId();
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
    setResetSent(false);
    const result = await login(identifier, password);
    setBusy(false);
    if (!result.success) return setError(result.error || 'Connexion impossible.');
    router.replace(search.get('next') || '/profil');
    router.refresh();
  };

  const forgot = async () => {
    if (!identifier.includes('@')) return setError('Saisissez votre adresse e-mail dans le premier champ pour recevoir le lien de réinitialisation.');
    setBusy(true);
    setError('');
    setResetSent(false);
    const result = await resetPassword(identifier);
    setBusy(false);
    if (!result.success) return setError(result.error || 'Envoi impossible.');
    setResetSent(true);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-lg py-8 sm:px-4" aria-describedby={error ? `${baseId}-error` : undefined}>
      <p className="editorial-kicker text-pm-coral">Espace membre</p>
      <h1 className="mt-5 font-playfair text-5xl font-black italic leading-none sm:text-6xl">Connexion</h1>
      <p className="mt-5 max-w-md text-sm leading-7 text-pm-ink/60">Utilisez l’adresse e-mail ou l’identifiant associé à votre compte PMM.</p>

      <div className="mt-10 space-y-5">
        <div><label htmlFor={`${baseId}-identifier`} className={label}>E-mail ou identifiant</label><input id={`${baseId}-identifier`} name="username" autoComplete="username" inputMode="email" required placeholder="vous@exemple.com ou identifiant" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={input} /></div>
        <div><label htmlFor={`${baseId}-password`} className={label}>Mot de passe</label><input id={`${baseId}-password`} name="password" autoComplete="current-password" required type="password" placeholder="Votre mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} className={input} /></div>
      </div>

      <div aria-live="assertive" aria-atomic="true">{error && <p id={`${baseId}-error`} role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}</div>
      <div aria-live="polite" aria-atomic="true">{resetSent && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">Si un compte correspond à cette adresse, les instructions de réinitialisation ont été envoyées.</p>}</div>

      <button disabled={busy} className="control-button mt-8 min-h-12 w-full disabled:cursor-wait disabled:opacity-50">{busy ? 'Connexion…' : 'Se connecter'}</button>
      <button type="button" disabled={busy} onClick={() => void forgot()} className="mt-5 min-h-11 w-full rounded-full text-center text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/55 transition hover:bg-pm-peach hover:text-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral disabled:opacity-50">Mot de passe oublié ?</button>

      <div className="mt-10 border-t border-pm-ink/10 pt-6 text-center">
        <Link href="/" className="inline-flex min-h-11 items-center px-3 text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/50 transition hover:text-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral">Retour au site</Link>
      </div>
    </form>
  );
}
