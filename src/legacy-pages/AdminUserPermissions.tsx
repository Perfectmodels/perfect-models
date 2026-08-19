import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import {
  AdminPagePermissions,
  ADMIN_PERMISSION_LABELS,
} from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminUser {
  uid: string;
  email: string;
  name: string;
  identifier: string;
  permissions: Partial<AdminPagePermissions>;
  isSuper: boolean;
}

// Groupes de permissions pour l'UI
const PERMISSION_GROUPS: { label: string; keys: (keyof AdminPagePermissions)[] }[] = [
  {
    label: 'Navigation principale',
    keys: ['dashboard'],
  },
  {
    label: 'Talents & Équipe',
    keys: ['models', 'absences', 'modelAccess', 'classroomProgress', 'recovery'],
  },
  {
    label: 'Contenu éditorial',
    keys: ['magazine', 'news', 'comments', 'gallery', 'mediaLibrary'],
  },
  {
    label: 'Productions',
    keys: ['fashionDayEvents', 'fashionDayApplications', 'artisticDirection', 'beautyContests'],
  },
  {
    label: 'Opérations',
    keys: ['castingApplications', 'castingResults', 'bookings', 'payments', 'absences'],
  },
  {
    label: 'Communication',
    keys: ['messages', 'mailing', 'liveChat'],
  },
  {
    label: 'Formation',
    keys: ['classroom'],
  },
  {
    label: 'Outils IA',
    keys: ['imageAnalysis', 'imageGeneration'],
  },
  {
    label: 'Administration',
    keys: ['agency', 'settings', 'userPermissions'],
  },
];

// Dédupliquer (absences est dans 2 groupes)
const seen = new Set<string>();
const PERM_GROUPS_DEDUPED = PERMISSION_GROUPS.map(g => ({
  ...g,
  keys: g.keys.filter(k => {
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }),
})).filter(g => g.keys.length > 0);

// ── Composant principal ───────────────────────────────────────────────────────

const AdminUserPermissions: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [draft, setDraft] = useState<Partial<AdminPagePermissions>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Charger la liste
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/permissions', { credentials: 'include', cache: 'no-store' });
      const json = await res.json();
      setUsers(json.users ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Sélectionner un utilisateur
  const select = useCallback((u: AdminUser) => {
    setSelected(u);
    setDraft({ ...u.permissions });
    setSaveMsg(null);
  }, []);

  // Toggle une permission dans le brouillon
  const toggle = useCallback((key: keyof AdminPagePermissions) => {
    setDraft(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Tout cocher / décocher
  const toggleAll = useCallback((value: boolean) => {
    const all = {} as Partial<AdminPagePermissions>;
    (Object.keys(ADMIN_PERMISSION_LABELS) as (keyof AdminPagePermissions)[]).forEach(k => { all[k] = value; });
    setDraft(all);
  }, []);

  // Sauvegarder
  const save = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: selected.uid, permissions: draft }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur serveur');
      setSaveMsg({ type: 'ok', text: 'Permissions sauvegardées.' });
      // Mettre à jour la liste locale
      setUsers(prev => prev.map(u => u.uid === selected.uid ? { ...u, permissions: draft } : u));
      setSelected(prev => prev ? { ...prev, permissions: draft } : prev);
    } catch (e: any) {
      setSaveMsg({ type: 'err', text: e.message || 'Erreur lors de la sauvegarde.' });
    } finally {
      setSaving(false);
    }
  }, [selected, draft]);

  const filtered = useMemo(() =>
    users.filter(u =>
      !search || `${u.name} ${u.email} ${u.identifier}`.toLowerCase().includes(search.toLowerCase())
    ),
    [users, search]
  );

  const activeCount = Object.values(draft).filter(Boolean).length;
  const totalPerms = Object.keys(ADMIN_PERMISSION_LABELS).length;

  return (
    <div className="min-h-screen bg-pm-dark text-pm-off-white">
      <SEO title="Admin — Permissions utilisateurs" noIndex />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6">
        {/* Header */}
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-pm-gold/70 hover:text-pm-gold transition"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Tableau de bord
        </Link>

        <div className="mb-8">
          <p className="text-xs uppercase tracking-[.3em] text-pm-gold/70">Administration</p>
          <h1 className="mt-2 font-playfair text-4xl font-black text-white">Permissions utilisateurs</h1>
          <p className="mt-2 text-sm text-white/40">
            Contrôlez l'accès de chaque administrateur délégué aux différentes sections du panel.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">

          {/* ── Liste des utilisateurs ───────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-pm-gold/40"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.08]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <ArrowPathIcon className="h-6 w-6 animate-spin text-pm-gold/50" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-6 text-center text-sm text-white/30">Aucun compte admin trouvé.</p>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {filtered.map(u => (
                    <button
                      key={u.uid}
                      onClick={() => select(u)}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-pm-gold/[0.05] ${selected?.uid === u.uid ? 'bg-pm-gold/[0.07] border-l-2 border-pm-gold' : ''}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                        {u.isSuper
                          ? <ShieldCheckIcon className="h-4 w-4 text-pm-gold" />
                          : <UserCircleIcon className="h-4 w-4 text-white/50" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-pm-off-white">{u.name}</p>
                        <p className="truncate text-xs text-white/35">{u.identifier} · {u.email}</p>
                      </div>
                      {u.isSuper ? (
                        <span className="shrink-0 rounded-full bg-pm-gold/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pm-gold">
                          Super
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs text-white/25">
                          {Object.values(u.permissions).filter(Boolean).length}/{totalPerms}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={load}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs text-white/40 hover:text-white/70 transition"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" /> Actualiser
            </button>
          </div>

          {/* ── Panneau de permissions ───────────────────────────────────── */}
          {selected ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#14110d]/80">
              {/* En-tête utilisateur */}
              <div className="border-b border-white/[0.08] px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-playfair text-2xl font-bold text-pm-off-white">{selected.name}</h2>
                      {selected.isSuper && (
                        <span className="rounded-full bg-pm-gold/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pm-gold">
                          Super-admin
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-white/40">{selected.email} · {selected.identifier}</p>
                  </div>

                  {/* Compteur + actions rapides */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/35">
                      <span className="font-bold text-pm-gold-light">{activeCount}</span>/{totalPerms} permissions actives
                    </span>
                    <button
                      onClick={() => toggleAll(true)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-green-300 hover:border-green-500/30 transition"
                    >
                      Tout activer
                    </button>
                    <button
                      onClick={() => toggleAll(false)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:text-red-300 hover:border-red-500/30 transition"
                    >
                      Tout désactiver
                    </button>
                  </div>
                </div>

                {selected.isSuper && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-pm-gold/20 bg-pm-gold/5 px-4 py-3">
                    <LockClosedIcon className="h-4 w-4 shrink-0 text-pm-gold" />
                    <p className="text-xs text-pm-gold/80">
                      Cet utilisateur est super-administrateur — il a accès à toutes les sections sans restriction. Les permissions ci-dessous ne s'appliquent pas.
                    </p>
                  </div>
                )}
              </div>

              {/* Grille des permissions par groupe */}
              <div className="divide-y divide-white/[0.06]">
                {PERM_GROUPS_DEDUPED.map(group => (
                  <div key={group.label} className="px-6 py-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[.25em] text-white/35">
                      {group.label}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {group.keys.map(key => {
                        const enabled = !!draft[key];
                        return (
                          <button
                            key={key}
                            onClick={() => !selected.isSuper && toggle(key)}
                            disabled={selected.isSuper}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition
                              ${selected.isSuper
                                ? 'cursor-default opacity-50 border-white/[0.05] bg-white/[0.02]'
                                : enabled
                                  ? 'border-green-500/30 bg-green-500/[0.07] hover:bg-green-500/[0.12]'
                                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20'
                              }`}
                          >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border
                              ${enabled ? 'border-green-500 bg-green-500' : 'border-white/20 bg-transparent'}`}
                            >
                              {enabled
                                ? <CheckIcon className="h-3 w-3 text-white" />
                                : <XMarkIcon className="h-3 w-3 text-white/20" />
                              }
                            </span>
                            <span className={`text-xs font-medium ${enabled ? 'text-green-300' : 'text-white/45'}`}>
                              {ADMIN_PERMISSION_LABELS[key]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer — sauvegarde */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] px-6 py-4">
                {saveMsg ? (
                  <p className={`flex items-center gap-1.5 text-sm ${saveMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                    {saveMsg.type === 'ok'
                      ? <CheckIcon className="h-4 w-4" />
                      : <XMarkIcon className="h-4 w-4" />
                    }
                    {saveMsg.text}
                  </p>
                ) : (
                  <p className="text-xs text-white/30">Les modifications sont effectives à la prochaine connexion de l'utilisateur.</p>
                )}

                <button
                  onClick={save}
                  disabled={saving || selected.isSuper}
                  className="flex items-center gap-2 rounded-lg bg-pm-gold px-5 py-2.5 text-sm font-bold text-[#1d1607] transition hover:bg-pm-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <><ArrowPathIcon className="h-4 w-4 animate-spin" /> Sauvegarde…</>
                  ) : (
                    <><ShieldCheckIcon className="h-4 w-4" /> Sauvegarder</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#14110d]/60 p-12 text-center">
              <ShieldExclamationIcon className="mb-4 h-12 w-12 text-white/15" />
              <p className="font-playfair text-xl text-pm-off-white">Sélectionnez un compte</p>
              <p className="mt-2 max-w-xs text-sm text-white/35">
                Choisissez un administrateur dans la liste pour configurer ses permissions d'accès.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserPermissions;
