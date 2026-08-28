'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { useAuth } from '@/contexts/AuthContext';

export default function FirstLoginSecurityPrompt() {
  const { user } = useAuth();
  const titleId = useId();
  const descriptionId = useId();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && user.mustChangePassword) setVisible(true);
  }, [user?.role, user?.mustChangePassword]);

  useEffect(() => {
    if (!visible || changing) return;
    primaryRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVisible(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, changing]);

  if (changing) {
    return <ChangePasswordModal onClose={() => { setChanging(false); setVisible(false); }} />;
  }
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-pm-ink/75 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <div className="w-full max-w-lg rounded-[2rem] border border-pm-ink/10 bg-pm-paper p-7 text-pm-ink shadow-2xl sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-pm-peach text-pm-wine"><ShieldCheckIcon className="h-6 w-6" aria-hidden="true" /></div>
        <p className="text-xs font-extrabold uppercase tracking-[.14em] text-pm-coral">Première connexion</p>
        <h2 id={titleId} className="mt-2 font-playfair text-4xl font-semibold">Sécurisez votre espace PMM</h2>
        <p id={descriptionId} className="mt-4 text-sm leading-7 text-pm-ink/65">Votre compte a été créé avec un mot de passe temporaire reçu par e-mail. Remplacez-le idéalement maintenant par un mot de passe personnel et unique.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button ref={primaryRef} type="button" onClick={() => setChanging(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pm-wine px-5 py-3 text-xs font-extrabold uppercase tracking-[.08em] text-white transition hover:bg-pm-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-coral"><LockClosedIcon className="h-4 w-4" aria-hidden="true" />Changer maintenant</button>
          <button type="button" onClick={() => setVisible(false)} className="min-h-12 rounded-full border border-pm-ink/15 px-5 py-3 text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/65 transition hover:bg-pm-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-coral">Me le rappeler plus tard</button>
        </div>
        <p className="mt-5 text-xs leading-5 text-pm-ink/45">Le rappel restera actif tant que le mot de passe temporaire n’aura pas été remplacé. Vous pouvez aussi le modifier depuis la section Sécurité.</p>
      </div>
    </div>
  );
}
