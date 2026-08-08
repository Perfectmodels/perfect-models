import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  LockClosedIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { ModelMigrationRequest, useAuth } from '../contexts/AuthContext';
import { RecoveryRequest } from '../types';
import { notifyAdmin } from '../utils/adminNotify';

const REMEMBERED_IDENTIFIER_KEY = 'pmm_login_identifier';

const roleRedirect: Record<string, string> = {
  admin: '/admin',
  student: '/profil',
  jury: '/jury/casting',
  registration: '/enregistrement/casting',
  'jury-contest': '/concours/jury',
};

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(() => localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberIdentifier, setRememberIdentifier] = useState(
    () => Boolean(localStorage.getItem(REMEMBERED_IDENTIFIER_KEY))
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [migration, setMigration] = useState<ModelMigrationRequest | null>(null);
  const [migrationEmail, setMigrationEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { data, isInitialized, saveData } = useData();
  const { login, migrateModelToAuth, resetPassword, user, loading } = useAuth();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  useEffect(() => {
    if (loading || !user) return;
    navigate(from || roleRedirect[user.role] || '/', { replace: true });
  }, [user, loading, navigate, from]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) return;

    setError('');
    setResetMessage('');
    setIsSubmitting(true);

    if (rememberIdentifier) {
      localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, cleanIdentifier);
    } else {
      localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
    }

    const result = await login(cleanIdentifier, password);

    if (!result.success) {
      if (result.migrationRequired && result.migration) {
        setMigration(result.migration);
        setMigrationEmail(result.migration.suggestedEmail);
        setIsSubmitting(false);
        return;
      }
      setError(result.error || 'Identifiant ou mot de passe incorrect.');
      setPassword('');
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    const result = await resetPassword(email.trim().toLowerCase());
    if (!result.success) {
      throw new Error(result.error || "Impossible d'envoyer le lien de réinitialisation.");
    }
  };

  const handleMigration = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!migration) return;
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setError('');
    setIsMigrating(true);
    const result = await migrateModelToAuth(
      migration.modelId,
      migrationEmail,
      newPassword,
      password
    );

    if (!result.success) {
      setError(result.error || 'La sécurisation du compte a échoué.');
      setIsMigrating(false);
      return;
    }

    notifyAdmin(
      'migration',
      `Compte sécurisé : ${migration.name} (${migrationEmail})`,
      '/admin/model-access'
    ).catch(() => {});
    setMigration(null);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmitRecovery = async (modelName: string, phone: string) => {
    if (!data) return;
    const newRequest: RecoveryRequest = {
      id: Date.now().toString(),
      modelName,
      phone,
      timestamp: new Date().toISOString(),
      status: 'Nouveau',
    };
    await saveData({
      ...data,
      recoveryRequests: [...(data.recoveryRequests || []), newRequest],
    });
    notifyAdmin(
      'contact',
      `Récupération accès : ${modelName}`,
      '/admin/recovery-requests'
    ).catch(() => {});
  };

  const backgroundImage = data?.siteImages?.castingBg;
  const logo = data?.siteConfig?.logo || '/logo.svg';

  return (
    <>
      <SEO title="Connexion | Espace PMM" noIndex />
      <main className="relative min-h-screen overflow-hidden bg-[#080808] text-white">
        <div className="absolute inset-0 lg:hidden">
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt=""
              className="h-full w-full object-cover opacity-20"
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#080808]/90 to-[#080808]" />
        </div>

        <div className="relative grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative hidden min-h-screen overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between">
            {backgroundImage ? (
              <img
                src={backgroundImage}
                alt="Univers Perfect Models Management"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/50 to-black/90" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="relative z-10 flex items-center justify-between p-10 xl:p-14">
              <Link
                to="/"
                className="inline-flex items-center gap-3 text-sm font-medium text-white/75 transition hover:text-white"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Retour au site
              </Link>
              <span className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-md">
                Espace privé
              </span>
            </div>

            <div className="relative z-10 max-w-2xl p-10 xl:p-14">
              <div className="mb-8 h-px w-16 bg-pm-gold" />
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-pm-gold">
                Perfect Models Management
              </p>
              <h1 className="max-w-xl font-playfair text-5xl leading-[1.02] text-white xl:text-6xl">
                Votre carrière, vos outils, votre espace.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/68">
                Accédez à votre profil, vos formations, vos activités de casting et aux outils de gestion réservés à votre rôle au sein de l'agence.
              </p>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                {[
                  ['Profils', 'Accès sécurisé'],
                  ['Formation', 'Suivi personnel'],
                  ['Casting', 'Outils métiers'],
                ].map(([title, subtitle]) => (
                  <div key={title} className="border-t border-white/15 pt-4">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-white/45">{subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-full max-w-[470px]"
            >
              <div className="mb-9 flex items-center justify-between lg:hidden">
                <Link to="/" aria-label="Retour à l'accueil">
                  <img src={logo} alt="Perfect Models Management" className="h-14 w-auto" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs text-white/60 transition hover:text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Site public
                </Link>
              </div>

              <div className="mb-9 hidden lg:block">
                <Link to="/" className="inline-flex items-center">
                  <img src={logo} alt="Perfect Models Management" className="h-16 w-auto" />
                </Link>
              </div>

              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pm-gold/20 bg-pm-gold/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-pm-gold">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Connexion sécurisée
                </div>
                <h2 className="font-playfair text-4xl text-white sm:text-[2.75rem]">Bienvenue</h2>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  Connectez-vous avec l'identifiant associé à votre espace PMM.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="identifier" className="mb-2 block text-sm font-medium text-white/78">
                    Identifiant ou adresse email
                  </label>
                  <div className="group relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition group-focus-within:text-pm-gold" />
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(event) => {
                        setIdentifier(event.target.value);
                        setError('');
                      }}
                      placeholder="Ex. nom@perfectmodels.online"
                      className="w-full rounded-xl border border-white/12 bg-white/[0.045] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-pm-gold/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-pm-gold/10"
                      required
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label htmlFor="password" className="block text-sm font-medium text-white/78">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsRecoveryModalOpen(true)}
                      className="text-xs font-medium text-pm-gold transition hover:text-white"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="group relative">
                    <LockClosedIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35 transition group-focus-within:text-pm-gold" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError('');
                      }}
                      placeholder="Votre mot de passe"
                      className="w-full rounded-xl border border-white/12 bg-white/[0.045] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-pm-gold/70 focus:bg-white/[0.06] focus:ring-4 focus:ring-pm-gold/10"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white focus:outline-none focus:text-pm-gold"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 text-xs text-white/55">
                  <input
                    type="checkbox"
                    checked={rememberIdentifier}
                    onChange={(event) => setRememberIdentifier(event.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-pm-gold focus:ring-pm-gold/30"
                  />
                  Mémoriser mon identifiant sur cet appareil
                </label>

                {error && (
                  <div role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-200">
                    {error}
                  </div>
                )}
                {resetMessage && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-5 text-emerald-200">
                    {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isInitialized || isSubmitting || loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-pm-gold px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-pm-dark transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-pm-gold/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting || loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-pm-dark/30 border-t-pm-dark" />
                      Connexion…
                    </>
                  ) : (
                    <>
                      {isInitialized ? 'Se connecter' : 'Initialisation…'}
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.24em] text-white/30">Autre accès</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={() => navigate('/login/phone')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.025] px-5 py-3.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:bg-white/[0.05] hover:text-white"
              >
                <PhoneIcon className="h-4 w-4" />
                Continuer avec un numéro de téléphone
              </button>

              <div className="mt-8 rounded-xl border border-white/8 bg-white/[0.025] p-4">
                <div className="flex gap-3">
                  <KeyIcon className="mt-0.5 h-5 w-5 shrink-0 text-pm-gold/80" />
                  <div>
                    <p className="text-sm font-medium text-white/80">Ancien accès mannequin ?</p>
                    <p className="mt-1 text-xs leading-5 text-white/42">
                      Utilisez vos identifiants habituels. Si votre compte doit être sécurisé ou mis à jour, la procédure vous sera proposée automatiquement.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-[11px] leading-5 text-white/30">
                Accès réservé aux membres et équipes autorisés de Perfect Models Management.
              </p>
            </motion.div>
          </section>
        </div>
      </main>

      {isRecoveryModalOpen && (
        <RecoveryModal
          initialEmail={identifier.includes('@') ? identifier : ''}
          onClose={() => setIsRecoveryModalOpen(false)}
          onPasswordReset={handlePasswordReset}
          onAccessRequest={handleSubmitRecovery}
          onSuccess={(message) => setResetMessage(message)}
        />
      )}

      {migration && (
        <MigrationModal
          migration={migration}
          email={migrationEmail}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          error={error}
          loading={isMigrating}
          onEmailChange={setMigrationEmail}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleMigration}
          onClose={() => {
            setMigration(null);
            setNewPassword('');
            setConfirmPassword('');
            setError('');
          }}
        />
      )}
    </>
  );
};

interface ModalShellProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({ title, description, onClose, children }) => (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    role="dialog"
    aria-modal="true"
    aria-labelledby="account-modal-title"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
        <div>
          <h2 id="account-modal-title" className="font-playfair text-2xl text-white">{title}</h2>
          {description && <p className="mt-1 text-sm leading-5 text-white/45">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-lg p-2 text-white/45 transition hover:bg-white/5 hover:text-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </div>
);

const MigrationModal: React.FC<{
  migration: ModelMigrationRequest;
  email: string;
  newPassword: string;
  confirmPassword: string;
  error: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}> = ({
  migration,
  email,
  newPassword,
  confirmPassword,
  error,
  loading,
  onEmailChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onClose,
}) => (
  <ModalShell
    title="Sécuriser votre compte"
    description="Une mise à jour unique est nécessaire pour continuer à utiliser votre espace."
    onClose={onClose}
  >
    <div className="mb-5 flex gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
      <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      <p className="text-sm leading-5 text-emerald-100/80">
        Identité confirmée pour <strong className="text-white">{migration.name}</strong>. Définissez vos nouveaux accès sécurisés.
      </p>
    </div>
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Adresse email">
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className="login-modal-input"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Nouveau mot de passe" hint="8 caractères minimum">
        <input
          type="password"
          value={newPassword}
          onChange={(event) => onNewPasswordChange(event.target.value)}
          className="login-modal-input"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </Field>
      <Field label="Confirmer le mot de passe">
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          className="login-modal-input"
          minLength={8}
          autoComplete="new-password"
          required
        />
      </Field>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-pm-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-pm-dark transition hover:bg-white disabled:opacity-50"
      >
        {loading ? 'Mise à jour…' : 'Sécuriser et continuer'}
      </button>
    </form>
  </ModalShell>
);

const RecoveryModal: React.FC<{
  initialEmail: string;
  onClose: () => void;
  onPasswordReset: (email: string) => Promise<void>;
  onAccessRequest: (name: string, phone: string) => Promise<void>;
  onSuccess: (message: string) => void;
}> = ({ initialEmail, onClose, onPasswordReset, onAccessRequest, onSuccess }) => {
  const [mode, setMode] = useState<'email' | 'support'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [modelName, setModelName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'email') {
        await onPasswordReset(email);
        onSuccess('Si cette adresse correspond à un compte, les instructions de réinitialisation ont été envoyées.');
      } else {
        await onAccessRequest(modelName, phone);
        onSuccess("Votre demande d'accès a été transmise à l'équipe PMM.");
      }
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      title="Récupérer mon accès"
      description="Choisissez la méthode correspondant à votre situation."
      onClose={onClose}
    >
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-white/[0.035] p-1">
        <button
          type="button"
          onClick={() => { setMode('email'); setError(''); }}
          className={`rounded-lg px-3 py-2.5 text-xs font-medium transition ${mode === 'email' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Par email
        </button>
        <button
          type="button"
          onClick={() => { setMode('support'); setError(''); }}
          className={`rounded-lg px-3 py-2.5 text-xs font-medium transition ${mode === 'support' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Contacter PMM
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'email' ? (
          <Field label="Adresse email du compte">
            <div className="relative">
              <EnvelopeIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="votre@email.com"
                className="login-modal-input pl-11"
                autoComplete="email"
                required
              />
            </div>
          </Field>
        ) : (
          <>
            <Field label="Nom complet">
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={modelName}
                  onChange={(event) => setModelName(event.target.value)}
                  placeholder="Votre nom complet"
                  className="login-modal-input pl-11"
                  required
                />
              </div>
            </Field>
            <Field label="Numéro de téléphone">
              <div className="relative">
                <PhoneIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+241 …"
                  className="login-modal-input pl-11"
                  autoComplete="tel"
                  required
                />
              </div>
            </Field>
          </>
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-pm-gold px-6 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-pm-dark transition hover:bg-white disabled:opacity-50"
        >
          {loading ? 'Traitement…' : mode === 'email' ? 'Envoyer le lien' : 'Envoyer la demande'}
        </button>
      </form>
    </ModalShell>
  );
};

const Field: React.FC<{
  label: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-white/70">
      {label}
      {hint && <span className="text-[11px] font-normal text-white/30">{hint}</span>}
    </span>
    {children}
  </label>
);

export default Login;
