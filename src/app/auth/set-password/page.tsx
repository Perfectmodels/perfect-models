'use client';

import { FormEvent, useState } from 'react';

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 12) {
      setError('Choisissez un mot de passe d’au moins 12 caractères.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Impossible de définir le mot de passe.');

      // L'utilisateur saisira ensuite ses nouveaux identifiants sur le portail PMM.
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => undefined);
      window.location.assign('/login?password_set=1');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible de définir le mot de passe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pm-dark px-5 py-16 text-pm-off-white flex items-center justify-center">
      <section className="w-full max-w-lg rounded-2xl border border-pm-gold/20 bg-black/40 p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Perfect Models Management" className="mx-auto h-16 w-16 mb-5" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-pm-gold">Sécurité du compte</p>
          <h1 className="mt-3 font-playfair text-3xl sm:text-4xl font-black text-white">Créer votre mot de passe</h1>
          <p className="mt-3 text-sm leading-7 text-white/50">
            Utilisez un mot de passe unique pour votre espace Perfect Models Management.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Nouveau mot de passe</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={12}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-pm-gold"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">Confirmer le mot de passe</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              minLength={12}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-pm-gold"
            />
          </label>

          <div className="rounded-xl border border-pm-gold/15 bg-pm-gold/5 p-4 text-xs leading-6 text-white/45">
            Minimum 12 caractères avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial.
          </div>

          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pm-gold px-6 py-3.5 text-xs font-black uppercase tracking-[0.22em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Enregistrement…' : 'Enregistrer mon mot de passe'}
          </button>
        </form>
      </section>
    </main>
  );
}