'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

const input = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10';
const label = 'mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/65';

type Notice = { kind: 'success' | 'warning'; title: string; body: string } | null;

export default function LoginForm() {
  const baseId = useId();
  const { login, resetPassword } = useAuth();
  const { success: toastSuccess } = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busyAction, setBusyAction] = useState<'login' | 'reset' | null>(null);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const notice = useMemo<Notice>(() => {
    if (search.get('password_set') === '1') return { kind: 'success', title: 'Mot de passe enregistré', body: 'Votre nouveau mot de passe est prêt. Connectez-vous avec vos identifiants PMM.' };
    if (search.get('verified') === '1') return { kind: 'success', title: 'Adresse e-mail confirmée', body: 'Votre adresse a bien été validée. Vous pouvez maintenant vous connecter.' };
    if (search.get('auth_error') === 'expired_or_invalid_link') return { kind: 'warning', title: 'Lien expiré ou déjà utilisé', body: 'Demandez un nouveau lien de réinitialisation ou d’activation, puis utilisez le plus récent reçu.' };
    return null;
  }, [search]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) return setError('Saisissez votre adresse e-mail ou votre identifiant PMM.');
    if (!password) return setError('Saisissez votre mot de passe.');

    setBusyAction('login'); setError(''); setResetSent(false);
    const result = await login(cleanIdentifier, password);
    setBusyAction(null);
    if (!result.success) return setError(result.error || 'La connexion n’a pas pu être établie.');
    router.replace(search.get('next') || '/profil');
    router.refresh();
  };

  const forgot = async () => {
    const email = identifier.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Pour réinitialiser votre mot de passe, saisissez d’abord votre adresse e-mail complète dans le premier champ.');
    setBusyAction('reset'); setError(''); setResetSent(false);
    const result = await resetPassword(email);
    setBusyAction(null);
    if (!result.success) return setError(result.error || 'Le lien de réinitialisation n’a pas pu être envoyé.');
    setResetSent(true);
    toastSuccess('Instructions de réinitialisation envoyées.');
  };

  const busy = busyAction !== null;

  return (
    <form onSubmit={submit} className="w-full max-w-lg py-8 sm:px-4" aria-describedby={error ? `${baseId}-error` : undefined} noValidate>
      <p className="editorial-kicker text-pm-coral">Espace membre</p>
      <h1 className="mt-5 font-playfair text-5xl font-black italic leading-none sm:text-6xl">Connexion</h1>
      <p className="mt-5 max-w-md text-sm leading-7 text-pm-ink/60">Utilisez l’adresse e-mail ou l’identifiant associé à votre compte PMM.</p>

      {notice && <div role={notice.kind === 'warning' ? 'alert' : 'status'} className={`mt-7 rounded-2xl border px-4 py-4 ${notice.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
        <p className="text-sm font-extrabold">{notice.title}</p>
        <p className="mt-1 text-xs leading-5 opacity-75">{notice.body}</p>
      </div>}

      <div className="mt-10 space-y-5">
        <div>
          <label htmlFor={`${baseId}-identifier`} className={label}>E-mail ou identifiant</label>
          <input id={`${baseId}-identifier`} name="username" autoComplete="username" inputMode="email" required aria-invalid={Boolean(error && !identifier.trim())} placeholder="vous@exemple.com ou identifiant" value={identifier} onChange={(e) => { setIdentifier(e.target.value); if (error) setError(''); }} className={input} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor={`${baseId}-password`} className={`${label} mb-0`}>Mot de passe</label><button type="button" onClick={() => void forgot()} disabled={busy} className="text-[10px] font-extrabold uppercase tracking-[.08em] text-pm-wine transition hover:text-pm-coral disabled:opacity-40">Mot de passe oublié ?</button></div>
          <div className="relative"><input id={`${baseId}-password`} name="password" autoComplete="current-password" required type={showPassword ? 'text' : 'password'} aria-invalid={Boolean(error && !password)} placeholder="Votre mot de passe" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }} className={`${input} pr-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-pm-ink/45 transition hover:bg-pm-peach hover:text-pm-wine" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
        </div>
      </div>

      <div aria-live="assertive" aria-atomic="true">{error && <div id={`${baseId}-error`} role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"><p className="font-extrabold">Action impossible</p><p className="mt-1 text-xs leading-5 text-red-800/80">{error}</p></div>}</div>
      <div aria-live="polite" aria-atomic="true">{resetSent && <div role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"><p className="font-extrabold">Vérifiez votre boîte e-mail</p><p className="mt-1 text-xs leading-5 text-emerald-900/75">Si un compte correspond à cette adresse, les instructions ont été envoyées. Vérifiez aussi les courriers indésirables.</p></div>}</div>

      <button disabled={busy} className="control-button mt-8 min-h-12 w-full disabled:cursor-wait disabled:opacity-50">{busyAction === 'login' ? 'Connexion en cours…' : busyAction === 'reset' ? 'Envoi du lien…' : 'Se connecter'}</button>

      <div className="mt-7 rounded-2xl border border-pm-coral/20 bg-pm-peach/70 p-5 text-left">
        <p className="text-xs font-extrabold uppercase tracking-[.12em] text-pm-wine">Vous êtes déjà mannequin PMM ?</p>
        <p className="mt-2 text-sm leading-6 text-pm-ink/60">Si votre profil figure dans la liste de l’agence mais que vous n’avez pas encore de compte, activez votre espace personnel.</p>
        <Link href="/inscription/mannequin" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-pm-wine px-5 text-xs font-extrabold uppercase tracking-[.1em] text-white transition hover:bg-pm-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pm-coral">Activer mon compte mannequin</Link>
      </div>

      <div className="mt-8 border-t border-pm-ink/10 pt-6 text-center"><Link href="/" className="inline-flex min-h-11 items-center px-3 text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/50 transition hover:text-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral">Retour au site</Link></div>
    </form>
  );
}
