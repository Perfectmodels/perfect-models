'use client';

import { useEffect, useState } from 'react';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { useAuth } from '@/contexts/AuthContext';

export default function FirstLoginSecurityPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [changing, setChanging] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === 'student' && user.mustChangePassword) setVisible(true);
  }, [user?.role, user?.mustChangePassword]);

  const postpone = async () => {
    setSaving(true);
    try {
      await fetch('/api/auth/password-changed', { method: 'POST', credentials: 'include' });
    } finally {
      setVisible(false);
      setSaving(false);
    }
  };

  if (changing) {
    return <ChangePasswordModal onClose={() => { setChanging(false); setVisible(false); }} />;
  }
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-pm-gold/25 bg-[#0b0b0b] p-7 shadow-2xl sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-pm-gold/10 text-pm-gold">
          <ShieldCheckIcon className="h-6 w-6" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-pm-gold">Première connexion</p>
        <h2 className="mt-2 font-playfair text-3xl font-black text-white">Sécurisez votre espace PMM</h2>
        <p className="mt-4 text-sm leading-6 text-white/55">
          Votre compte a été créé avec le mot de passe temporaire reçu par email. Vous pouvez le remplacer maintenant par un mot de passe personnel, ou conserver ce mot de passe pour le moment.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pm-gold px-5 py-3.5 text-xs font-black uppercase tracking-widest text-pm-dark transition hover:bg-white"
          >
            <LockClosedIcon className="h-4 w-4" />
            Changer maintenant
          </button>
          <button
            type="button"
            onClick={postpone}
            disabled={saving}
            className="rounded-xl border border-white/10 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white/60 transition hover:border-pm-gold/30 hover:text-white disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Plus tard'}
          </button>
        </div>
        <p className="mt-5 text-[11px] leading-5 text-white/30">
          Vous pourrez toujours modifier votre mot de passe depuis « Sécurité » dans votre tableau de bord.
        </p>
      </div>
    </div>
  );
}
