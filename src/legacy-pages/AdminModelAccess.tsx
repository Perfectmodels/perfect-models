import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, MagnifyingGlassIcon, ShieldCheckIcon,
  UserCircleIcon, KeyIcon, CheckCircleIcon, XCircleIcon,
  ArrowUpTrayIcon, ChevronDownIcon, ChevronUpIcon,
  ArrowPathIcon, ExclamationTriangleIcon, UsersIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { UserPermissions, DEFAULT_PERMISSIONS } from '../types';
import { rtdb } from '../firebase';
import { ref, update } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

// ─── Types locaux ──────────────────────────────────────────────────────────────

type UserRole = 'student' | 'jury' | 'registration';

interface UnifiedUser {
  id: string;
  name: string;
  email?: string;
  firebaseUid?: string;
  username?: string;
  role: UserRole;
  permissions: UserPermissions;
  lastLogin?: string;
  level?: string;
  imageUrl?: string;
}

// ─── Config des permissions affichables ───────────────────────────────────────

const PERMISSION_CONFIG: {
  key: keyof UserPermissions;
  label: string;
  description: string;
  roles: UserRole[];
  icon: string;
}[] = [
  { key: 'isActive',               label: 'Compte actif',          description: 'Autoriser la connexion',             roles: ['student','jury','registration'], icon: '🔑' },
  { key: 'canAccessFormation',      label: 'Formation avancée',     description: 'Accès aux modules de formation',     roles: ['student'],                       icon: '📚' },
  { key: 'canAccessClassroom',      label: 'Classroom',             description: 'Accès aux cours de base',           roles: ['student'],                       icon: '🎓' },
  { key: 'canAccessForum',          label: 'Forum',                 description: 'Participation au forum de classe',   roles: ['student'],                       icon: '💬' },
  { key: 'canViewPhotoshootBriefs', label: 'Briefings',             description: 'Consultation des briefings photo',  roles: ['student'],                       icon: '📸' },
  { key: 'canViewResults',          label: 'Résultats & scores',    description: 'Voir ses propres résultats',        roles: ['student'],                       icon: '📊' },
  { key: 'canEditProfile',          label: 'Modifier le profil',    description: 'Modifier le profil public',         roles: ['student'],                       icon: '✏️' },
  { key: 'canScoreCasting',         label: 'Notation casting',      description: 'Accès à la notation des castings',  roles: ['jury'],                          icon: '⭐' },
  { key: 'canViewAllCandidates',    label: 'Voir candidatures',     description: 'Consulter toutes les candidatures', roles: ['jury'],                          icon: '👥' },
  { key: 'canRegisterCandidates',   label: 'Enregistrement',        description: 'Enregistrer des candidats on-site', roles: ['registration'],                  icon: '📝' },
  { key: 'canPrintList',            label: 'Impression',            description: 'Imprimer la liste de passage',      roles: ['registration'],                  icon: '🖨️' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Mannequin',
  jury: 'Jury',
  registration: 'Staff',
};

const ROLE_COLORS: Record<UserRole, string> = {
  student: 'text-pm-gold bg-pm-gold/10 border-pm-gold/30',
  jury: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  registration: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

// ─── Composant principal ───────────────────────────────────────────────────────

const AdminModelAccess: React.FC = () => {
  const { data, saveData } = useData();
  const { createUserWithRole } = useAuth();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | UserRole>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<string | null>(null);
  const [migratingAll, setMigratingAll] = useState(false);

  // Construire la liste unifiée de tous les utilisateurs
  const allUsers = useMemo((): UnifiedUser[] => {
    const models = (data?.models ?? []).map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      firebaseUid: m.firebaseUid,
      username: m.username,
      role: 'student' as UserRole,
      permissions: { ...DEFAULT_PERMISSIONS.student, ...(m.permissions ?? {}) },
      lastLogin: m.lastLogin,
      level: m.level,
      imageUrl: m.imageUrl,
    }));

    const jury = (data?.juryMembers ?? []).map(j => ({
      id: j.id,
      name: j.name,
      email: j.email,
      firebaseUid: j.firebaseUid,
      username: j.username,
      role: 'jury' as UserRole,
      permissions: { ...DEFAULT_PERMISSIONS.jury },
      lastLogin: undefined,
      level: undefined,
      imageUrl: undefined,
    }));

    const staff = (data?.registrationStaff ?? []).map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      firebaseUid: s.firebaseUid,
      username: s.username,
      role: 'registration' as UserRole,
      permissions: { ...DEFAULT_PERMISSIONS.registration },
      lastLogin: undefined,
      level: undefined,
      imageUrl: undefined,
    }));

    return [...models, ...jury, ...staff];
  }, [data]);

  const filtered = useMemo(() => {
    let list = activeTab === 'all' ? allUsers : allUsers.filter(u => u.role === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allUsers, activeTab, search]);

  const stats = useMemo(() => ({
    total: allUsers.length,
    students: allUsers.filter(u => u.role === 'student').length,
    jury: allUsers.filter(u => u.role === 'jury').length,
    staff: allUsers.filter(u => u.role === 'registration').length,
    withFirebase: allUsers.filter(u => u.firebaseUid).length,
    active: allUsers.filter(u => u.permissions.isActive !== false).length,
  }), [allUsers]);

  // Sauvegarder les permissions d'un utilisateur
  const savePermissions = useCallback(async (user: UnifiedUser, permissions: UserPermissions) => {
    if (!data) return;
    setSavingId(user.id);
    try {
      if (user.role === 'student') {
        const updated = data.models.map(m => m.id === user.id ? { ...m, permissions } : m);
        await saveData({ ...data, models: updated });
        // Sync Firestore accounts si firebaseUid connu
        if (user.firebaseUid) {
          const fs = getFirestore();
          await setDoc(doc(fs, 'accounts', user.firebaseUid), { permissions }, { merge: true });
        }
      } else if (user.role === 'jury') {
        await update(ref(rtdb, `juryMembers/${user.id}`), { permissions });
        if (user.firebaseUid) {
          const fs = getFirestore();
          await setDoc(doc(fs, 'accounts', user.firebaseUid), { permissions }, { merge: true });
        }
      } else {
        await update(ref(rtdb, `registrationStaff/${user.id}`), { permissions });
        if (user.firebaseUid) {
          const fs = getFirestore();
          await setDoc(doc(fs, 'accounts', user.firebaseUid), { permissions }, { merge: true });
        }
      }
    } catch (err) {
      console.error('Erreur sauvegarde permissions:', err);
    } finally {
      setSavingId(null);
    }
  }, [data, saveData]);

  // Réinitialiser le mot de passe par email
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(email);
      setTimeout(() => setResetEmailSent(null), 4000);
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    }
  }, []);

  // Migration Firebase en masse
  const handleMigrateAll = useCallback(async () => {
    if (!data) return;
    const toMigrate = allUsers.filter(u => !u.firebaseUid && u.email);
    if (toMigrate.length === 0) { alert('✅ Tous les utilisateurs sont déjà sur Firebase Auth.'); return; }
    if (!confirm(`Créer ${toMigrate.length} compte(s) Firebase manquants ?`)) return;
    setMigratingAll(true);
    let ok = 0, err = 0;
    for (const u of toMigrate) {
      const result = await createUserWithRole(u.email!, 'Pmm2026', u.role, { id: u.id, name: u.name });
      if (result.success) ok++; else err++;
    }
    alert(`Migration: ${ok} succès, ${err} erreur(s)`);
    setMigratingAll(false);
  }, [allUsers, createUserWithRole, data]);

  const TABS = [
    { id: 'all' as const,          label: `Tous (${stats.total})`,          icon: UsersIcon },
    { id: 'student' as UserRole,   label: `Mannequins (${stats.students})`, icon: UserCircleIcon },
    { id: 'jury' as UserRole,      label: `Jury (${stats.jury})`,           icon: ShieldCheckIcon },
    { id: 'registration' as UserRole, label: `Staff (${stats.staff})`,      icon: KeyIcon },
  ];

  return (
    <div className="bg-pm-dark text-pm-off-white min-h-screen py-20">
      <SEO title="Admin — Gestion des Utilisateurs" noIndex />
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold/70 hover:text-pm-gold mb-4 text-sm">
            <ChevronLeftIcon className="w-4 h-4" /> Retour au tableau de bord
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-playfair font-black text-pm-gold">Gestion des Utilisateurs</h1>
              <p className="text-pm-off-white/40 text-sm mt-1">Rôles, permissions et accès Firebase pour tous les comptes</p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/firebase-setup" className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-bold rounded-lg transition-colors">
                <ShieldCheckIcon className="w-4 h-4" /> Config Firebase
              </Link>
              <button onClick={handleMigrateAll} disabled={migratingAll} className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                <ArrowUpTrayIcon className={`w-4 h-4 ${migratingAll ? 'animate-bounce' : ''}`} />
                {migratingAll ? 'Migration…' : 'Migrer manquants'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Total',       value: stats.total,       color: 'text-white' },
            { label: 'Mannequins',  value: stats.students,    color: 'text-pm-gold' },
            { label: 'Jury',        value: stats.jury,        color: 'text-purple-400' },
            { label: 'Staff',       value: stats.staff,       color: 'text-blue-400' },
            { label: 'Firebase ✓',  value: stats.withFirebase,color: 'text-green-400' },
            { label: 'Actifs',      value: stats.active,      color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className={`text-3xl font-playfair font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 flex-wrap">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg border transition-all ${
                    activeTab === tab.id
                      ? 'bg-pm-gold text-pm-dark border-pm-gold'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <MagnifyingGlassIcon className="w-4 h-4 text-white/30 absolute top-1/2 left-3 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold/50 transition-colors" />
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="glass-card p-12 text-center text-white/30">Aucun utilisateur trouvé.</div>
          )}
          {filtered.map(user => (
            <UserRow
              key={`${user.role}-${user.id}`}
              user={user}
              expanded={expandedId === `${user.role}-${user.id}`}
              onToggle={() => setExpandedId(
                expandedId === `${user.role}-${user.id}` ? null : `${user.role}-${user.id}`
              )}
              onSave={savePermissions}
              onResetPassword={handleResetPassword}
              saving={savingId === user.id}
              resetSent={resetEmailSent === user.email}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Ligne utilisateur ─────────────────────────────────────────────────────────

interface UserRowProps {
  user: UnifiedUser;
  expanded: boolean;
  onToggle: () => void;
  onSave: (user: UnifiedUser, perms: UserPermissions) => Promise<void>;
  onResetPassword: (email: string) => void;
  saving: boolean;
  resetSent: boolean;
}

const UserRow: React.FC<UserRowProps> = ({ user, expanded, onToggle, onSave, onResetPassword, saving, resetSent }) => {
  const [localPerms, setLocalPerms] = useState<UserPermissions>(user.permissions);
  const [dirty, setDirty] = useState(false);

  const togglePerm = (key: keyof UserPermissions) => {
    setLocalPerms(prev => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave(user, localPerms);
    setDirty(false);
  };

  const handleCancel = () => {
    setLocalPerms(user.permissions);
    setDirty(false);
  };

  const relevantPerms = PERMISSION_CONFIG.filter(p => p.roles.includes(user.role));
  const isActive = localPerms.isActive !== false;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      !isActive ? 'border-red-500/20 opacity-60' : 'border-white/5 hover:border-white/10'
    }`}>
      {/* En-tête de la ligne */}
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
          {user.imageUrl
            ? <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
            : <UserCircleIcon className="w-6 h-6 text-white/30" />
          }
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-white text-sm">{user.name}</p>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
            {user.level && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border text-white/50 border-white/10">
                {user.level}
              </span>
            )}
            {!isActive && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border text-red-400 border-red-500/30 bg-red-500/10">
                Suspendu
              </span>
            )}
          </div>
          <p className="text-xs text-white/30 mt-0.5 truncate">{user.email || '—'}</p>
        </div>

        {/* Statuts rapides */}
        <div className="flex items-center gap-3 shrink-0">
          {user.firebaseUid
            ? <span className="hidden sm:flex items-center gap-1 text-[9px] font-black uppercase text-green-400"><CheckCircleIcon className="w-3.5 h-3.5" />Firebase</span>
            : <span className="hidden sm:flex items-center gap-1 text-[9px] font-black uppercase text-amber-400"><ExclamationTriangleIcon className="w-3.5 h-3.5" />Hors ligne</span>
          }
          <span className="text-[9px] text-white/20 hidden md:block">
            {relevantPerms.filter(p => localPerms[p.key] !== false).length}/{relevantPerms.length} perms
          </span>
          {expanded ? <ChevronUpIcon className="w-4 h-4 text-white/30" /> : <ChevronDownIcon className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {/* Panneau développé : permissions + actions */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-5 bg-black/20">

          {/* Permissions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold/70 mb-3">Permissions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {relevantPerms.map(perm => {
                const enabled = localPerms[perm.key] !== false;
                const isActiveKey = perm.key === 'isActive';
                return (
                  <button
                    key={perm.key}
                    onClick={() => togglePerm(perm.key)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      enabled
                        ? isActiveKey
                          ? 'bg-green-500/10 border-green-500/30 text-green-300'
                          : 'bg-white/5 border-white/10 text-white/80'
                        : isActiveKey
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-black/20 border-white/5 text-white/25'
                    }`}
                  >
                    <span className="text-lg shrink-0">{perm.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{perm.label}</p>
                      <p className="text-[10px] text-white/30 truncate">{perm.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full shrink-0 border-2 ${
                      enabled ? 'bg-green-400 border-green-400' : 'bg-transparent border-white/20'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Informations compte */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Matricule / ID</p>
              <p className="text-sm font-mono text-pm-gold/80">{user.username || user.id}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Firebase UID</p>
              <p className="text-xs font-mono text-white/40 truncate">{user.firebaseUid || 'Non migré'}</p>
            </div>
            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Dernière connexion</p>
              <p className="text-xs text-white/40">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'Jamais'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
            {dirty && (
              <>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white transition-colors disabled:opacity-50">
                  {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                  {saving ? 'Sauvegarde…' : 'Sauvegarder les permissions'}
                </button>
                <button onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white/40 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-white/5 transition-colors">
                  <XCircleIcon className="w-3.5 h-3.5" /> Annuler
                </button>
              </>
            )}

            {user.email && (
              <button onClick={() => onResetPassword(user.email!)}
                className={`flex items-center gap-2 px-4 py-2 border text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${
                  resetSent
                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                    : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                }`}>
                <KeyIcon className="w-3.5 h-3.5" />
                {resetSent ? 'Email envoyé !' : 'Réinitialiser mot de passe'}
              </button>
            )}

            {!user.firebaseUid && user.email && (
              <span className="flex items-center gap-2 px-4 py-2 border border-amber-500/20 text-amber-400/60 text-xs rounded-lg">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                Pas encore sur Firebase Auth
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModelAccess;
