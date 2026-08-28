'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { authClient } from '@/lib/auth/client';

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const errorId = useId();
  const currentId = useId();
  const newId = useId();
  const confirmId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 12 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return setError('Utilisez au moins 12 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial.');
    }
    if (newPassword !== confirm) return setError('Les mots de passe ne correspondent pas.');
    if (newPassword === currentPassword) return setError("Choisissez un mot de passe différent de l'ancien.");
    setLoading(true);
    try {
      const result = await (authClient as any).changePassword({ currentPassword, newPassword, revokeOtherSessions: false });
      if (result?.error) throw new Error(result.error.message || 'Modification impossible.');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Modification impossible.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 pr-12 text-[15px] text-pm-ink outline-none transition focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10';
  const labelClass = 'mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/65';

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-pm-ink/75 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={error ? errorId : undefined}>
      <div className="w-full max-w-md rounded-[2rem] border border-pm-ink/10 bg-pm-paper shadow-2xl">
        <div className="flex items-center justify-between border-b border-pm-ink/10 p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-pm-peach text-pm-wine"><LockClosedIcon className="h-5 w-5" aria-hidden="true" /></span><h2 id={titleId} className="font-playfair text-3xl font-semibold text-pm-ink">Changer le mot de passe</h2></div>
          <button ref={closeRef} type="button" onClick={onClose} disabled={loading} aria-label="Fermer" className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15 text-pm-ink/55 hover:bg-pm-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral disabled:opacity-50"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center" role="status" aria-live="polite"><CheckCircleIcon className="mx-auto h-14 w-14 text-emerald-600" aria-hidden="true" /><p className="mt-3 font-semibold text-pm-ink">Mot de passe modifié.</p><button type="button" onClick={onClose} className="mt-6 min-h-11 rounded-full bg-pm-ink px-5 text-sm font-extrabold text-white">Fermer</button></div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <p className="text-sm leading-6 text-pm-ink/60">Le nouveau mot de passe doit comporter au moins 12 caractères et combiner majuscule, minuscule, chiffre et caractère spécial.</p>
              <PasswordField id={currentId} label="Mot de passe actuel" value={currentPassword} onChange={setCurrent} show={show} inputClass={inputClass} labelClass={labelClass} autoComplete="current-password" />
              <PasswordField id={newId} label="Nouveau mot de passe" value={newPassword} onChange={setNew} show={show} inputClass={inputClass} labelClass={labelClass} autoComplete="new-password" />
              <PasswordField id={confirmId} label="Confirmation" value={confirm} onChange={setConfirm} show={show} inputClass={inputClass} labelClass={labelClass} autoComplete="new-password" />
              <button type="button" onClick={() => setShow((value) => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-extrabold text-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral" aria-pressed={show}>{show ? <EyeSlashIcon className="h-4 w-4" aria-hidden="true" /> : <EyeIcon className="h-4 w-4" aria-hidden="true" />}{show ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}</button>
              {error && <p id={errorId} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-800">{error}</p>}
              <button disabled={loading} className="min-h-12 w-full rounded-full bg-pm-wine px-5 text-sm font-extrabold text-white transition hover:bg-pm-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-coral disabled:opacity-50">{loading ? 'Modification…' : 'Modifier le mot de passe'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, inputClass, labelClass, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; show: boolean; inputClass: string; labelClass: string; autoComplete: string }) {
  return <div><label htmlFor={id} className={labelClass}>{label}</label><input id={id} type={show ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} required autoComplete={autoComplete} /></div>;
}
