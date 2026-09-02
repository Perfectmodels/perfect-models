'use client';

import { useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, Search } from 'lucide-react';

type ModelVisibilityRow = {
  id: string;
  name: string;
  username?: string | null;
  image_url?: string | null;
  is_public: boolean;
  is_active: boolean;
  status: string;
};

export default function ModelVisibilityPanel({ initialModels }: { initialModels: ModelVisibilityRow[] }) {
  const [models, setModels] = useState(initialModels);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    if (!term) return models;
    return models.filter((model) => `${model.name} ${model.username || ''}`.toLocaleLowerCase('fr').includes(term));
  }, [models, query]);

  const publicCount = models.filter((model) => model.is_public && model.is_active && model.status !== 'inactive').length;

  async function toggle(model: ModelVisibilityRow) {
    setBusyId(model.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/resources/models/${encodeURIComponent(model.id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !model.is_public }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Mise à jour impossible.');
      setModels((current) => current.map((item) => item.id === model.id ? { ...item, is_public: Boolean(payload.data?.is_public) } : item));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-pm-ink/10 bg-white">
      <div className="grid gap-5 border-b border-pm-ink/[.08] bg-pm-peach/55 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="control-kicker">Visibilité publique</p>
          <h2 className="mt-1 font-playfair text-3xl font-semibold">Publier ou masquer un profil en un clic.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-pm-ink/50">Un profil masqué reste disponible dans l’ERP et conserve son compte, son historique et ses données. Il disparaît uniquement du roster et des fiches publiques.</p>
        </div>
        <div className="rounded-2xl bg-white px-5 py-4 text-right shadow-sm">
          <p className="font-playfair text-3xl font-semibold text-pm-wine">{publicCount}</p>
          <p className="text-[8px] font-black uppercase tracking-[.16em] text-pm-ink/40">Profils actuellement publics</p>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <label className="mb-5 flex min-h-11 items-center gap-3 rounded-xl border border-pm-ink/10 bg-pm-ivory px-4">
          <Search className="h-4 w-4 text-pm-wine/55" aria-hidden="true" />
          <span className="sr-only">Rechercher un mannequin</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher par nom ou identifiant…" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-pm-ink/30" />
        </label>

        {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((model) => {
            const busy = busyId === model.id;
            const trulyPublic = model.is_public && model.is_active && model.status !== 'inactive';
            return (
              <article key={model.id} className="flex items-center gap-3 rounded-2xl border border-pm-ink/[.08] bg-pm-ivory/70 p-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-pm-peach font-playfair font-bold text-pm-wine">
                  {model.image_url ? <img src={model.image_url} alt="" className="h-full w-full object-cover" /> : model.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-pm-ink">{model.name}</p>
                  <p className="truncate text-[9px] font-semibold uppercase tracking-[.1em] text-pm-ink/35">{model.username || model.id}</p>
                </div>
                <button type="button" role="switch" aria-checked={model.is_public} disabled={busy} onClick={() => void toggle(model)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-[9px] font-black uppercase tracking-[.08em] transition disabled:opacity-50 ${model.is_public ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-600'}`} title={model.is_public ? 'Masquer ce profil' : 'Publier ce profil'}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : trulyPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {model.is_public ? 'Public' : 'Masqué'}
                </button>
              </article>
            );
          })}
        </div>
        {!filtered.length && <p className="py-8 text-center text-sm text-pm-ink/40">Aucun profil ne correspond à cette recherche.</p>}
      </div>
    </section>
  );
}
