/**
 * AdminFirebaseSetup.tsx
 * Page admin pour créer/migrer les comptes Firebase Auth des utilisateurs
 * qui n'ont pas encore de compte Firebase (jury, staff, admin).
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { rtdb } from '../firebase';
import { ref, get, update, set } from 'firebase/database';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { JuryMember, RegistrationStaff } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserStatus {
  id: string;
  name: string;
  email?: string;
  firebaseUid?: string;
  role: 'jury' | 'registration' | 'admin';
  hasFirebase: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sanitizeEmail = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');

// ─── Composant ────────────────────────────────────────────────────────────────

const AdminFirebaseSetup: React.FC = () => {
  const { data, saveData } = useData();
  const { createUserWithRole } = useAuth();

  const [juryStatuses, setJuryStatuses] = useState<UserStatus[]>([]);
  const [staffStatuses, setStaffStatuses] = useState<UserStatus[]>([]);
  const [adminStatus, setAdminStatus] = useState<{ exists: boolean; email: string } | null>(null);

  const [migrating, setMigrating] = useState<string | null>(null);
  const [migratingAll, setMigratingAll] = useState(false);
  const [log, setLog] = useState<{ id: string; ok: boolean; msg: string }[]>([]);

  // Formulaire inline par utilisateur
  const [emailOverrides, setEmailOverrides] = useState<Record<string, string>>({});
  const [passwordOverrides, setPasswordOverrides] = useState<Record<string, string>>({});

  // ── Charger les statuts ──────────────────────────────────────────────────

  useEffect(() => {
    if (!data) return;

    const jury: UserStatus[] = (data.juryMembers ?? []).map((j: JuryMember) => ({
      id: j.id,
      name: j.name,
      email: j.email || `${sanitizeEmail(j.name)}@perfectmodels.online`,
      firebaseUid: j.firebaseUid,
      role: 'jury',
      hasFirebase: !!j.firebaseUid,
    }));

    const staff: UserStatus[] = (data.registrationStaff ?? []).map((s: RegistrationStaff) => ({
      id: s.id,
      name: s.name,
      email: s.email || `${sanitizeEmail(s.name)}@perfectmodels.online`,
      firebaseUid: s.firebaseUid,
      role: 'registration',
      hasFirebase: !!s.firebaseUid,
    }));

    setJuryStatuses(jury);
    setStaffStatuses(staff);

    // Vérifier admin
    checkAdminAccount();
  }, [data]);

  const checkAdminAccount = async () => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, 'admin@perfectmodels.online');
      setAdminStatus({ exists: methods.length > 0, email: 'admin@perfectmodels.online' });
    } catch {
      setAdminStatus({ exists: false, email: 'admin@perfectmodels.online' });
    }
  };

  const addLog = (id: string, ok: boolean, msg: string) =>
    setLog((prev) => [{ id, ok, msg }, ...prev.slice(0, 49)]);

  // ── Créer un compte individuel ────────────────────────────────────────────

  const handleCreateOne = async (user: UserStatus) => {
    const email = emailOverrides[user.id]?.trim() || user.email || '';
    const password = passwordOverrides[user.id]?.trim();

    if (!email) { addLog(user.id, false, `${user.name}: email manquant`); return; }
    if (!password || password.length < 6) {
      addLog(user.id, false, `${user.name}: mot de passe requis (min 6 caractères)`);
      return;
    }

    setMigrating(user.id);
    try {
      const result = await createUserWithRole(email, password, user.role, {
        id: user.id,
        name: user.name,
      });

      if (result.success) {
        addLog(user.id, true, `${user.name} → compte Firebase créé (${email})`);
        // Rafraîchir
        if (user.role === 'jury') {
          setJuryStatuses((prev) =>
            prev.map((j) => (j.id === user.id ? { ...j, hasFirebase: true, email } : j))
          );
        } else {
          setStaffStatuses((prev) =>
            prev.map((s) => (s.id === user.id ? { ...s, hasFirebase: true, email } : s))
          );
        }
        setPasswordOverrides((prev) => { const n = { ...prev }; delete n[user.id]; return n; });
      } else {
        addLog(user.id, false, `${user.name}: ${result.error}`);
      }
    } finally {
      setMigrating(null);
    }
  };

  // ── Migrer tous ceux qui n'ont pas de compte ──────────────────────────────

  const handleMigrateAll = async () => {
    const allUsers = [...juryStatuses, ...staffStatuses].filter((u) => !u.hasFirebase);
    if (allUsers.length === 0) { alert('✅ Tous les comptes sont déjà sur Firebase Auth.'); return; }
    if (!window.confirm(`Créer ${allUsers.length} compte(s) Firebase ?\n\nLe mot de passe initial sera le username de l'utilisateur.`)) return;

    setMigratingAll(true);
    let ok = 0, err = 0;

    for (const user of allUsers) {
      const email = user.email || '';
      // Récupérer le password depuis RTDB
      const snap = await get(ref(rtdb, `${user.role === 'jury' ? 'juryMembers' : 'registrationStaff'}/${user.id}`));
      const raw = snap.val();
      const password = raw?.password || raw?.username || '';

      if (!email || !password) { err++; addLog(user.id, false, `${user.name}: email ou mot de passe manquant`); continue; }

      const result = await createUserWithRole(email, password, user.role, { id: user.id, name: user.name });
      if (result.success) {
        ok++;
        addLog(user.id, true, `${user.name} → ${email}`);
        if (user.role === 'jury') {
          setJuryStatuses((prev) => prev.map((j) => (j.id === user.id ? { ...j, hasFirebase: true } : j)));
        } else {
          setStaffStatuses((prev) => prev.map((s) => (s.id === user.id ? { ...s, hasFirebase: true } : s)));
        }
      } else {
        err++;
        addLog(user.id, false, `${user.name}: ${result.error}`);
      }
    }

    alert(`Migration terminée : ${ok} succès${err > 0 ? `, ${err} erreur(s)` : ''}`);
    setMigratingAll(false);
  };

  // ── Créer le compte admin ─────────────────────────────────────────────────

  const [adminPassword, setAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const handleCreateAdmin = async () => {
    if (!adminPassword || adminPassword.length < 6) {
      addLog('admin', false, 'Mot de passe admin requis (min 6 caractères)');
      return;
    }
    setCreatingAdmin(true);
    try {
      await createUserWithEmailAndPassword(auth, 'admin@perfectmodels.online', adminPassword);
      // Créer le nœud users/{uid}
      const currentUser = auth.currentUser;
      if (currentUser) {
        await set(ref(rtdb, `users/${currentUser.uid}`), {
          role: 'admin',
          profileId: 'admin',
          name: 'Admin',
          email: 'admin@perfectmodels.online',
          createdAt: new Date().toISOString(),
        });
      }
      addLog('admin', true, 'Compte admin Firebase créé : admin@perfectmodels.online');
      setAdminStatus({ exists: true, email: 'admin@perfectmodels.online' });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        addLog('admin', false, 'Le compte admin existe déjà dans Firebase Auth');
        setAdminStatus({ exists: true, email: 'admin@perfectmodels.online' });
      } else {
        addLog('admin', false, `Erreur admin: ${error.message}`);
      }
    } finally {
      setCreatingAdmin(false);
      setAdminPassword('');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const pendingCount =
    [...juryStatuses, ...staffStatuses].filter((u) => !u.hasFirebase).length +
    (adminStatus?.exists === false ? 1 : 0);

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin — Configuration Firebase" noIndex />
      <div className="container mx-auto px-6 max-w-5xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-6 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair text-pm-gold">Configuration Firebase Auth</h1>
            <p className="text-pm-off-white/50 text-sm mt-1">
              Créez les comptes Firebase pour jury, staff et admin.
            </p>
          </div>
          {pendingCount > 0 && (
            <button
              onClick={handleMigrateAll}
              disabled={migratingAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <ArrowUpTrayIcon className={`w-4 h-4 ${migratingAll ? 'animate-bounce' : ''}`} />
              Migrer tout ({pendingCount} en attente)
            </button>
          )}
        </div>

        {/* ── Compte Admin ─────────────────────────────────────────────── */}
        <Section title="Compte Admin" icon={<ShieldCheckIcon className="w-5 h-5" />}>
          <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-lg bg-pm-dark/50 border border-pm-gold/10">
            <div>
              <p className="font-semibold">admin@perfectmodels.online</p>
              {adminStatus === null ? (
                <p className="text-xs text-pm-off-white/40 mt-0.5">Vérification…</p>
              ) : adminStatus.exists ? (
                <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> Compte Firebase actif
                </p>
              ) : (
                <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" /> Aucun compte Firebase
                </p>
              )}
            </div>
            {adminStatus && !adminStatus.exists && (
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Mot de passe admin"
                  className="admin-input w-48 text-sm"
                  minLength={6}
                />
                <button
                  onClick={handleCreateAdmin}
                  disabled={creatingAdmin}
                  className="px-4 py-2 bg-pm-gold text-pm-dark font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm"
                >
                  {creatingAdmin ? 'Création…' : 'Créer'}
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* ── Jury ─────────────────────────────────────────────────────── */}
        <Section title={`Jury (${juryStatuses.length})`} icon={<UserCircleIcon className="w-5 h-5" />}>
          <UserTable
            users={juryStatuses}
            migrating={migrating}
            emailOverrides={emailOverrides}
            passwordOverrides={passwordOverrides}
            onEmailChange={(id, val) => setEmailOverrides((p) => ({ ...p, [id]: val }))}
            onPasswordChange={(id, val) => setPasswordOverrides((p) => ({ ...p, [id]: val }))}
            onCreateOne={handleCreateOne}
          />
        </Section>

        {/* ── Staff ────────────────────────────────────────────────────── */}
        <Section title={`Staff Enregistrement (${staffStatuses.length})`} icon={<KeyIcon className="w-5 h-5" />}>
          <UserTable
            users={staffStatuses}
            migrating={migrating}
            emailOverrides={emailOverrides}
            passwordOverrides={passwordOverrides}
            onEmailChange={(id, val) => setEmailOverrides((p) => ({ ...p, [id]: val }))}
            onPasswordChange={(id, val) => setPasswordOverrides((p) => ({ ...p, [id]: val }))}
            onCreateOne={handleCreateOne}
          />
        </Section>

        {/* ── Log ──────────────────────────────────────────────────────── */}
        {log.length > 0 && (
          <Section title="Journal des opérations" icon={null}>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded ${
                    entry.ok ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'
                  }`}
                >
                  {entry.ok ? (
                    <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ExclamationTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {entry.msg}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

// ─── Sous-composants ─────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mb-8">
    <h2 className="flex items-center gap-2 text-lg font-bold text-pm-gold mb-3">
      {icon}
      {title}
    </h2>
    <div className="bg-black border border-pm-gold/10 rounded-lg overflow-hidden">
      {children}
    </div>
  </div>
);

const UserTable: React.FC<{
  users: UserStatus[];
  migrating: string | null;
  emailOverrides: Record<string, string>;
  passwordOverrides: Record<string, string>;
  onEmailChange: (id: string, val: string) => void;
  onPasswordChange: (id: string, val: string) => void;
  onCreateOne: (user: UserStatus) => void;
}> = ({ users, migrating, emailOverrides, passwordOverrides, onEmailChange, onPasswordChange, onCreateOne }) => {
  if (users.length === 0) {
    return <p className="text-center p-6 text-pm-off-white/40 text-sm">Aucun utilisateur.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-pm-dark/50 border-b border-pm-gold/10">
        <tr>
          <th className="p-3 text-xs uppercase tracking-wider text-pm-off-white/40">Nom</th>
          <th className="p-3 text-xs uppercase tracking-wider text-pm-off-white/40">Email Firebase</th>
          <th className="p-3 text-xs uppercase tracking-wider text-pm-off-white/40">Mot de passe</th>
          <th className="p-3 text-xs uppercase tracking-wider text-pm-off-white/40">Statut</th>
          <th className="p-3"></th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} className="border-b border-pm-dark hover:bg-pm-dark/40">
            <td className="p-3 font-semibold">{user.name}</td>
            <td className="p-3">
              {user.hasFirebase ? (
                <span className="text-pm-off-white/50 font-mono text-xs">{user.email}</span>
              ) : (
                <input
                  type="email"
                  value={emailOverrides[user.id] ?? user.email ?? ''}
                  onChange={(e) => onEmailChange(user.id, e.target.value)}
                  className="admin-input w-full text-xs"
                  placeholder="email@perfectmodels.online"
                />
              )}
            </td>
            <td className="p-3">
              {user.hasFirebase ? (
                <span className="text-pm-off-white/30 text-xs">—</span>
              ) : (
                <input
                  type="password"
                  value={passwordOverrides[user.id] ?? ''}
                  onChange={(e) => onPasswordChange(user.id, e.target.value)}
                  className="admin-input w-full text-xs"
                  placeholder="Min 6 caractères"
                  minLength={6}
                />
              )}
            </td>
            <td className="p-3">
              {user.hasFirebase ? (
                <span className="flex items-center gap-1 text-green-400 text-xs font-bold">
                  <CheckCircleIcon className="w-3.5 h-3.5" /> Firebase
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" /> En attente
                </span>
              )}
            </td>
            <td className="p-3 text-right">
              {!user.hasFirebase && (
                <button
                  onClick={() => onCreateOne(user)}
                  disabled={migrating === user.id}
                  className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {migrating === user.id ? 'Création…' : 'Créer compte'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminFirebaseSetup;
