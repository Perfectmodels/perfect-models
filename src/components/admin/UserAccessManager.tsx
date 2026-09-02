'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Search, ShieldCheck, UserCog } from 'lucide-react';
import { ADMIN_PERMISSION_LABELS, type AdminPagePermissions } from '@/types';

type AppRole = 'admin' | 'manager' | 'student' | 'jury' | 'registration' | 'jury-contest';
type UserRow = {
  uid: string;
  email: string;
  name: string;
  identifier: string;
  role: AppRole;
  modelId?: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  adminPermissions: AdminPagePermissions;
};

const ROLE_OPTIONS: Array<{ value: AppRole; label: string; description: string }> = [
  { value: 'admin', label: 'Administrateur', description: 'Accès total au back-office et aux réglages sensibles.' },
  { value: 'manager', label: 'Manager', description: 'Accès délégué, limité aux modules autorisés ci-dessous.' },
  { value: 'student', label: 'Mannequin / Étudiant', description: 'Espace personnel, formation et profil mannequin.' },
  { value: 'jury', label: 'Jury casting', description: 'Évaluation et notation des candidatures.' },
  { value: 'registration', label: 'Équipe accueil', description: 'Enregistrement et opérations d’accueil.' },
  { value: 'jury-contest', label: 'Jury concours', description: 'Accès limité aux outils de concours.' },
];

const PERMISSION_KEYS = Object.keys(ADMIN_PERMISSION_LABELS) as Array<keyof AdminPagePermissions>;

export default function UserAccessManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [role, setRole] = useState<AppRole>('student');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<AdminPagePermissions>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Chargement des comptes impossible.');
      const next = Array.isArray(payload.users) ? payload.users : [];
      setUsers(next);
      if (!selectedId && next[0]) setSelectedId(next[0].uid);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement des comptes impossible.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const selected = useMemo(() => users.find((user) => user.uid === selectedId) || null, [users, selectedId]);
  useEffect(() => {
    if (!selected) return;
    setRole(selected.role);
    setIsActive(selected.isActive);
    setPermissions(selected.adminPermissions || {});
    setNotice('');
    setError('');
  }, [selected]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    if (!term) return users;
    return users.filter((user) => `${user.name} ${user.email} ${user.identifier} ${user.role}`.toLocaleLowerCase('fr').includes(term));
  }, [users, query]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: selected.uid, role, isActive, adminPermissions: role === 'manager' ? permissions : {} }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Mise à jour impossible.');
      if (payload.user) setUsers((current) => current.map((user) => user.uid === selected.uid ? payload.user : user));
      else await load();
      setNotice('Accès mis à jour. Le nouveau rôle sera appliqué lors de la prochaine vérification de session.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
      <aside className="overflow-hidden rounded-[1.8rem] border border-pm-ink/[.08] bg-white">
        <div className="border-b border-pm-ink/[.08] p-5 sm:p-6">
          <p className="control-kicker">Comptes existants</p>
          <h2 className="mt-1 font-playfair text-3xl font-semibold">Utilisateurs</h2>
          <label className="mt-5 flex min-h-11 items-center gap-3 rounded-xl border border-pm-ink/10 bg-pm-ivory px-4">
            <Search className="h-4 w-4 text-pm-wine/55" />
            <span className="sr-only">Rechercher un compte</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, email, identifiant…" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-pm-ink/30" />
          </label>
        </div>
        <div className="max-h-[650px] overflow-y-auto p-2">
          {loading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-pm-ink/40"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>}
          {!loading && filtered.map((user) => (
            <button key={user.uid} type="button" onClick={() => setSelectedId(user.uid)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${selectedId === user.uid ? 'bg-pm-peach text-pm-wine' : 'hover:bg-pm-ivory'}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${user.role === 'admin' ? 'bg-pm-wine text-white' : 'bg-pm-ink/5 text-pm-wine'}`}><UserCog className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm">{user.name}</strong>
                <span className="block truncate text-[10px] text-pm-ink/40">{user.email || user.identifier}</span>
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-[.08em] text-pm-ink/45">{user.role}</span>
            </button>
          ))}
          {!loading && !filtered.length && <p className="py-10 text-center text-sm text-pm-ink/35">Aucun compte trouvé.</p>}
        </div>
      </aside>

      <div className="rounded-[1.8rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7 lg:p-9">
        {!selected ? <div className="grid min-h-80 place-items-center text-sm text-pm-ink/40">Sélectionnez un compte.</div> : <>
          <div className="flex flex-col gap-4 border-b border-pm-ink/[.08] pb-7 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="control-kicker">Rôle & autorisations</p>
              <h2 className="mt-1 font-playfair text-4xl font-semibold">{selected.name}</h2>
              <p className="mt-2 text-sm text-pm-ink/45">{selected.email} · {selected.identifier || 'sans identifiant'}</p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[.1em] ${selected.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800'}`}>{selected.isActive ? 'Compte actif' : 'Compte suspendu'}</span>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-[9px] font-black uppercase tracking-[.16em] text-pm-ink/45">Rôle applicatif</label>
              <select value={role} onChange={(event) => setRole(event.target.value as AppRole)} className="min-h-12 w-full rounded-xl border border-pm-ink/15 bg-pm-ivory px-4 text-sm font-semibold outline-none focus:border-pm-coral">
                {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <p className="mt-2 text-xs leading-5 text-pm-ink/40">{ROLE_OPTIONS.find((option) => option.value === role)?.description}</p>
            </div>
            <div>
              <label className="mb-2 block text-[9px] font-black uppercase tracking-[.16em] text-pm-ink/45">État du compte</label>
              <button type="button" role="switch" aria-checked={isActive} onClick={() => setIsActive((value) => !value)} className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-sm font-bold ${isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'}`}>
                <span>{isActive ? 'Actif' : 'Suspendu'}</span>
                <span className={`relative h-6 w-11 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-red-400'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${isActive ? 'left-6' : 'left-1'}`} /></span>
              </button>
              <p className="mt-2 text-xs leading-5 text-pm-ink/40">Suspendre un compte bloque son accès applicatif sans supprimer ses données.</p>
            </div>
          </div>

          {role === 'manager' && <section className="mt-8 rounded-[1.6rem] bg-pm-ivory p-5 sm:p-6">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-pm-wine" /><div><h3 className="font-playfair text-2xl font-semibold">Permissions du manager</h3><p className="text-xs text-pm-ink/40">Ces autorisations sont vérifiées côté serveur pour chaque module.</p></div></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PERMISSION_KEYS.map((key) => <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs font-semibold transition ${permissions[key] ? 'border-pm-coral/25 bg-pm-peach/65 text-pm-wine' : 'border-pm-ink/[.08] bg-white text-pm-ink/55'}`}><input type="checkbox" checked={Boolean(permissions[key])} onChange={(event) => setPermissions((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-pm-wine" />{ADMIN_PERMISSION_LABELS[key]}</label>)}
            </div>
          </section>}

          {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
          {notice && <p className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4" />{notice}</p>}

          <div className="mt-7 flex justify-end">
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-pm-wine px-6 text-xs font-black uppercase tracking-[.1em] text-white transition hover:bg-pm-ink disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Enregistrer les accès
            </button>
          </div>
        </>}
      </div>
    </section>
  );
}
