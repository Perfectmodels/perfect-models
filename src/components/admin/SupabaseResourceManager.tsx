'use client';

import { useMemo, useState } from 'react';

function printable(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function SupabaseResourceManager({
  resource,
  title,
  primaryKey,
  columns,
  initialRows,
}: {
  resource: string;
  title: string;
  primaryKey: string;
  columns: readonly string[];
  initialRows: Record<string, any>[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [draft, setDraft] = useState('{}');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(needle));
  }, [query, rows]);

  const reload = async () => {
    const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}`, { cache: 'no-store', credentials: 'include' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Chargement impossible');
    setRows(Array.isArray(payload.data) ? payload.data : []);
  };

  const startCreate = () => {
    setError('');
    setEditing({});
    setDraft('{}');
  };

  const startEdit = (row: Record<string, any>) => {
    setError('');
    setEditing(row);
    setDraft(JSON.stringify(row, null, 2));
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const body = JSON.parse(draft);
      const id = editing?.[primaryKey];
      const endpoint = id === undefined || id === null || id === ''
        ? `/api/admin/resources/${encodeURIComponent(resource)}`
        : `/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`;
      const response = await fetch(endpoint, {
        method: id === undefined || id === null || id === '' ? 'POST' : 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Enregistrement impossible');
      await reload();
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row: Record<string, any>) => {
    const id = row[primaryKey];
    if (id === undefined || id === null) return;
    if (!window.confirm('Supprimer définitivement cet élément ?')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, {
        method: 'DELETE', credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Suppression impossible');
      setRows((current) => current.filter((item) => String(item[primaryKey]) !== String(id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="text-pm-ink">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex flex-col gap-5 rounded-[2rem] bg-pm-paper p-6 shadow-[0_18px_55px_rgba(91,46,37,.07)] lg:flex-row lg:items-end lg:justify-between lg:p-8">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-coral">Supabase · Source de vérité</p>
            <h1 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">{title}</h1>
            <p className="mt-2 text-sm text-pm-ink/42">{rows.length} enregistrement{rows.length > 1 ? 's' : ''} · table normalisée</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher…" className="min-w-64 rounded-full border border-pm-ink/10 bg-pm-ivory px-5 py-3 text-sm outline-none placeholder:text-pm-ink/30 focus:border-pm-coral/60" />
            <button type="button" onClick={startCreate} className="rounded-full bg-pm-ink px-6 py-3 text-[9px] font-black uppercase tracking-[.18em] text-white transition hover:bg-pm-wine">Ajouter</button>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="overflow-x-auto rounded-[1.7rem] border border-pm-ink/[.08] bg-white/70 shadow-[0_18px_55px_rgba(91,46,37,.06)]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-pm-ink/10 bg-pm-peach text-[9px] font-black uppercase tracking-[.17em] text-pm-wine/65">
              <tr>{columns.map((column) => <th key={column} className="px-4 py-4">{column.replace(/_/g, ' ')}</th>)}<th className="px-4 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr key={String(row[primaryKey] ?? index)} className="border-b border-pm-ink/[.06] align-top transition hover:bg-pm-ivory">
                  {columns.map((column) => <td key={column} className="max-w-xs px-4 py-4 text-pm-ink/62"><span className="line-clamp-3 break-words">{printable(row[column])}</span></td>)}
                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <button type="button" onClick={() => startEdit(row)} className="mr-4 font-semibold text-pm-wine hover:underline">Modifier</button>
                    <button type="button" disabled={busy} onClick={() => void remove(row)} className="text-red-600/70 hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <p className="px-5 py-12 text-center text-sm text-pm-ink/35">Aucune donnée enregistrée.</p>}
        </div>
      </div>

      {editing !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pm-ink/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[2rem] border border-pm-ink/10 bg-pm-paper p-5 text-pm-ink shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4"><h2 className="font-playfair text-2xl font-semibold">{editing[primaryKey] ? 'Modifier' : 'Ajouter'} · {title}</h2><button onClick={() => setEditing(null)} className="text-pm-ink/45 hover:text-pm-wine">Fermer</button></div>
            <p className="mb-3 text-xs leading-5 text-pm-ink/42">Édition structurée JSON. Les champs correspondent directement aux colonnes de la table Supabase, sans collection intermédiaire.</p>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck={false} className="h-[55vh] w-full resize-none rounded-[1.2rem] border border-pm-ink/10 bg-pm-ivory p-4 font-mono text-xs leading-6 text-pm-ink outline-none focus:border-pm-coral/60" />
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-3"><button onClick={() => setEditing(null)} className="rounded-full border border-pm-ink/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider">Annuler</button><button disabled={busy} onClick={() => void save()} className="rounded-full bg-pm-ink px-5 py-3 text-[9px] font-black uppercase tracking-wider text-white disabled:opacity-50">{busy ? 'Enregistrement…' : 'Enregistrer'}</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
