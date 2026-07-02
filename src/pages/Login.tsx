import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LockClosedIcon,
  UserIcon,
  XMarkIcon,
  PhoneIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { ModelMigrationRequest, useAuth } from '../contexts/AuthContext';
import { RecoveryRequest } from '../types';
import { motion } from 'framer-motion';
import { notifyAdmin } from '../utils/adminNotify';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface ActiveUser {
  name: string;
  role: string;
  loginTime: number;
}

const updateUserActivity = (name: string, role: string) => {
  const now = Date.now();
  const fifteen = 15 * 60 * 1000;
  const current: ActiveUser[] = JSON.parse(localStorage.getItem('pmm_active_users') || '[]');
  const filtered = current.filter((u) => u.name !== name && now - u.loginTime < fifteen);
  filtered.push({ name, role, loginTime: now });
  localStorage.setItem('pmm_active_users', JSON.stringify(filtered));
};

// ─── Composant principal ──────────────────────────────────────────────────────

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [migration, setMigration] = useState<ModelMigrationRequest | null>(null);
  const [migrationEmail, setMigrationEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { data, isInitialized, saveData } = useData();
  const { login, migrateModelToAuth, user, loading } = useAuth();

  // Redirect destination après login
  const from = (location.state as any)?.from?.pathname;

  // Si déjà connecté, rediriger immédiatement
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const roleRedirect: Record<string, string> = {
      admin: '/admin',
      student: '/profil',
      jury: '/jury/casting',
      registration: '/enregistrement/casting',
      'jury-contest': '/concours/jury',
    };

    const destination = from || roleRedirect[user.role] || '/';
    navigate(destination, { replace: true });
  }, [user, loading, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(identifier.trim(), password);

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
      return;
    }

    // Le useEffect ci-dessus prendra le relais dès que user est résolu par Firebase
    // On met à jour lastLogin et on notifie l'admin après que user soit disponible
    // (géré dans le useEffect via onAuthStateChanged → AuthContext)
    // Ici on peut juste laisser le flux se faire naturellement.
    // Note: isSubmitting reste true jusqu'à la redirection automatique.
  };

  const handleMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migration) return;
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
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
      setError(result.error || 'La migration du compte a échoué.');
      setIsMigrating(false);
      return;
    }

    notifyAdmin(
      'migration',
      `Compte migré : ${migration.name} (${migrationEmail})`,
      '/admin/model-access'
    ).catch(() => {});
    setMigration(null);
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    // La création Auth connecte le mannequin ; le useEffect redirige vers son profil.
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
    const updatedRequests = [...(data.recoveryRequests || []), newRequest];
    await saveData({ ...data, recoveryRequests: updatedRequests });
    notifyAdmin('contact', `Récupération accès: ${modelName}`, '/admin/recovery-requests').catch(() => {});
    setIsRecoveryModalOpen(false);
    alert('Votre demande a été envoyée. Vous serez contacté prochainement.');
  };

  return (
    <>
      <SEO title="Accès Privé" noIndex />
      <div
        className="bg-cover bg-center min-h-screen flex items-center justify-center p-4"
        style={{ backgroundImage: `url(${data?.siteImages.castingBg})` }}
      >
        <div className="absolute inset-0 bg-pm-dark/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-sm"
        >
          <div className="bg-black/50 border border-pm-gold/20 p-8 rounded-lg shadow-2xl shadow-black/50 text-center">
            <Link to="/">
              <img
                src={data?.siteConfig.logo}
                alt="Logo"
                className="h-20 w-auto mx-auto mb-6 bg-black rounded-full border-2 border-pm-gold p-1"
              />
            </Link>
            <h1 className="text-3xl font-playfair text-pm-gold mb-2">Accès Privé</h1>
            <p className="text-pm-off-white/70 mb-8">Bienvenue sur votre espace personnel.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Identifiant */}
              <div className="relative">
                <UserIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  placeholder="Identifiant, nom ou email"
                  className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Mot de passe */}
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Mot de passe"
                  className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold transition-colors"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <p className="text-red-400 text-sm !mt-4">{error}</p>}

              <button
                type="submit"
                disabled={!isInitialized || isSubmitting}
                className="w-full group flex items-center justify-center gap-2 px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-white !mt-8 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-pm-dark border-t-transparent rounded-full animate-spin" />
                    <span>Connexion…</span>
                  </>
                ) : (
                  <>
                    <span>{isInitialized ? 'Connexion' : 'Chargement…'}</span>
                    <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 space-y-2">
              <p className="text-xs text-pm-off-white/50">
                Ancien compte mannequin ? Connectez-vous avec vos accès habituels :
                la migration vous sera proposée automatiquement.
              </p>
              <button
                onClick={() => setIsRecoveryModalOpen(true)}
                className="text-xs text-pm-off-white/60 hover:text-pm-gold hover:underline block w-full"
              >
                Coordonnées oubliées ?
              </button>
              <button
                onClick={() => navigate('/login/phone')}
                className="flex items-center justify-center gap-1 text-xs text-green-400 hover:text-green-300 hover:underline w-full"
              >
                <PhoneIcon className="w-3 h-3" />
                Connexion par SMS
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {isRecoveryModalOpen && (
        <RecoveryModal
          onClose={() => setIsRecoveryModalOpen(false)}
          onSubmit={handleSubmitRecovery}
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
  <div
    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="migration-title"
  >
    <div className="bg-pm-dark border border-pm-gold/30 rounded-lg shadow-2xl w-full max-w-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 id="migration-title" className="text-xl font-playfair text-pm-gold">
            Sécuriser votre compte
          </h2>
          <button type="button" onClick={onClose} className="text-pm-off-white/70 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-3 p-3 mb-5 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-green-200">
            Identité confirmée pour <strong>{migration.name}</strong>. Créez maintenant vos accès
            Firebase sécurisés.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-pm-off-white/50 mb-1">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="admin-input"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-pm-off-white/50 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => onNewPasswordChange(event.target.value)}
              className="admin-input"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-pm-off-white/50 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => onConfirmPasswordChange(event.target.value)}
              className="admin-input"
              minLength={6}
              autoComplete="new-password"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all hover:bg-white disabled:opacity-50"
          >
            {loading ? 'Création du compte…' : 'Créer et continuer'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

// ─── Modal récupération d'accès ───────────────────────────────────────────────

const RecoveryModal: React.FC<{
  onClose: () => void;
  onSubmit: (name: string, phone: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [modelName, setModelName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(modelName, phone);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-pm-dark border border-pm-gold/30 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-playfair text-pm-gold">Demande de Coordonnées</h2>
            <button onClick={onClose} className="text-pm-off-white/70 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-pm-off-white/70 mb-6">
            Entrez votre nom et votre numéro de téléphone. L'administrateur vous contactera pour
            vous fournir vos accès.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Votre nom complet"
                className="admin-input pl-12"
                required
              />
            </div>
            <div className="relative">
              <PhoneIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Votre numéro de téléphone"
                className="admin-input pl-12"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-white mt-4"
            >
              Envoyer la demande
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
