/**
 * ChangePasswordModal.tsx
 * Modal de changement de mot de passe Firebase Auth.
 * Utilisable depuis n'importe quel dashboard (mannequin, jury, staff, admin).
 */
import React, { useState } from 'react';
import {
  XMarkIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase';

interface Props {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<Props> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      setError('Session invalide. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    try {
      // Ré-authentification requise par Firebase avant changement de mot de passe
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Changement effectif
      await updatePassword(user, newPassword);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Mot de passe actuel incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives. Réessayez dans quelques minutes.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Session expirée. Déconnectez-vous et reconnectez-vous.');
      } else {
        setError(err.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-pwd-title"
    >
      <div className="bg-pm-dark border border-pm-gold/20 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pm-gold/10 flex items-center justify-center">
              <LockClosedIcon className="w-5 h-5 text-pm-gold" />
            </div>
            <h2 id="change-pwd-title" className="text-lg font-playfair font-black text-white">
              Changer le mot de passe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <CheckCircleIcon className="w-14 h-14 text-green-400" />
              <p className="text-white font-semibold">Mot de passe modifié avec succès !</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 text-white/30 absolute top-1/2 left-3.5 -translate-y-1/2" />
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => { setCurrentPassword(e.target.value); setError(''); }}
                    placeholder="Votre mot de passe actuel"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold/50 transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(v => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white/60"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 text-white/30 absolute top-1/2 left-3.5 -translate-y-1/2" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Minimum 6 caractères"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold/50 transition-colors"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white/60"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {/* Barre de force */}
                {newPassword.length > 0 && (
                  <StrengthBar password={newPassword} />
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <LockClosedIcon className="w-4 h-4 text-white/30 absolute top-1/2 left-3.5 -translate-y-1/2" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Répétez le nouveau mot de passe"
                    className={`w-full bg-black/40 border rounded-lg py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-red-500/50'
                        : confirmPassword && confirmPassword === newPassword
                        ? 'border-green-500/50'
                        : 'border-white/10 focus:border-pm-gold/50'
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white/60"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-pm-gold text-pm-dark font-black text-xs uppercase tracking-widest rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-pm-dark border-t-transparent rounded-full animate-spin" />
                      Modification…
                    </>
                  ) : (
                    'Modifier le mot de passe'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-white/10 text-white/50 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Barre de force du mot de passe ──────────────────────────────────────────

const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: 'Très faible', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Faible',     color: 'bg-orange-500' };
    if (score === 3) return { level: 3, label: 'Moyen',      color: 'bg-yellow-500' };
    if (score === 4) return { level: 4, label: 'Fort',       color: 'bg-green-400' };
    return                  { level: 5, label: 'Très fort',  color: 'bg-green-500' };
  };

  const { level, label, color } = getStrength(password);
  const pct = (level / 5) * 100;

  return (
    <div className="mt-1.5">
      <div className="w-full bg-white/5 rounded-full h-1">
        <div
          className={`${color} h-1 rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${
        level <= 2 ? 'text-red-400' : level === 3 ? 'text-yellow-400' : 'text-green-400'
      }`}>{label}</p>
    </div>
  );
};

export default ChangePasswordModal;
