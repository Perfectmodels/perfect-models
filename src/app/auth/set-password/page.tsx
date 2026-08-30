'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { Check, Eye, EyeOff, X } from 'lucide-react';

const input = 'w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-pm-ink outline-none transition focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10';

function rules(value: string) {
  return [
    ['12 caractères minimum', value.length >= 12],
    ['Une majuscule', /[A-Z]/.test(value)],
    ['Une minuscule', /[a-z]/.test(value)],
    ['Un chiffre', /\d/.test(value)],
    ['Un caractère spécial', /[^A-Za-z0-9]/.test(value)],
  ] as const;
}

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const passwordRules = useMemo(() => rules(password), [password]);
  const validPassword = passwordRules.every(([, valid]) => valid);
  const matches = confirmation.length > 0 && password === confirmation;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!validPassword) return setError('Votre mot de passe ne respecte pas encore tous les critères de sécurité.');
    if (!matches) return setError('La confirmation ne correspond pas au nouveau mot de passe.');

    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Le mot de passe n’a pas pu être enregistré.');
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => undefined);
      window.location.assign('/login?password_set=1');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Le mot de passe n’a pas pu être enregistré.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-14 text-pm-ink sm:py-20">
      <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-pm-ink/10 bg-white shadow-[0_30px_90px_rgba(76,38,51,.12)]">
        <div className="grid lg:grid-cols-[.8fr_1.2fr]">
          <aside className="bg-pm-wine p-7 text-white sm:p-9">
            <Image src="/logopmm.jpg" alt="Perfect Models Management" width={88} height={88} className="h-20 w-20 rounded-full border-4 border-white/20 object-cover" priority />
            <p className="mt-8 text-[10px] font-black uppercase tracking-[.22em] text-pm-gold-light">Sécurité du compte</p>
            <h1 className="mt-3 font-playfair text-4xl font-black leading-tight">Choisissez votre mot de passe</h1>
            <p className="mt-4 text-sm leading-7 text-white/70">Ce mot de passe protège votre espace Perfect Models Management. Utilisez une combinaison unique que vous n’employez pas ailleurs.</p>
          </aside>

          <form onSubmit={submit} className="p-6 sm:p-9" noValidate>
            <div>
              <label htmlFor="new-password" className="mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/60">Nouveau mot de passe</label>
              <div className="relative"><input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} required className={`${input} pr-12`} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-pm-ink/45 hover:bg-pm-peach" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl bg-pm-ivory p-4 sm:grid-cols-2">
              {passwordRules.map(([text, valid]) => <p key={text} className={`flex items-center gap-2 text-xs font-semibold ${valid ? 'text-emerald-700' : 'text-pm-ink/45'}`}>{valid ? <Check size={15}/> : <span className="h-[15px] w-[15px] rounded-full border border-pm-ink/20"/>}{text}</p>)}
            </div>

            <div className="mt-5">
              <label htmlFor="confirm-password" className="mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/60">Confirmer le mot de passe</label>
              <div className="relative"><input id="confirm-password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError(''); }} required className={`${input} pr-12 ${confirmation && !matches ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : confirmation && matches ? 'border-emerald-300' : ''}`} aria-invalid={Boolean(confirmation && !matches)} /><button type="button" onClick={() => setShowConfirmation((value) => !value)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-pm-ink/45 hover:bg-pm-peach" aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}>{showConfirmation ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
              {confirmation && <p className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${matches ? 'text-emerald-700' : 'text-red-700'}`}>{matches ? <Check size={14}/> : <X size={14}/>} {matches ? 'Les mots de passe correspondent.' : 'Les mots de passe ne correspondent pas.'}</p>}
            </div>

            <div aria-live="assertive">{error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p className="font-extrabold">Vérification nécessaire</p><p className="mt-1 text-xs leading-5 text-red-800/80">{error}</p></div>}</div>

            <button type="submit" disabled={loading || !validPassword || !matches} className="mt-7 min-h-12 w-full rounded-full bg-pm-wine px-6 text-xs font-black uppercase tracking-[.16em] text-white transition hover:bg-pm-ink disabled:cursor-not-allowed disabled:opacity-40">{loading ? 'Enregistrement sécurisé…' : 'Enregistrer mon mot de passe'}</button>
            <p className="mt-4 text-center text-[11px] leading-5 text-pm-ink/40">Une fois enregistré, vous serez redirigé vers la connexion avec une confirmation claire.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
