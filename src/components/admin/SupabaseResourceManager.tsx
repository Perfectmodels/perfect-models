'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle, Check, ChevronLeft, ChevronRight, Database, Eye, Pencil,
  Plus, Search, SlidersHorizontal, Trash2, X,
} from 'lucide-react';
import type { CrudField } from '@/lib/resource-registry';

type Row = Record<string, unknown>;
type FormValue = string | boolean;
type EditorState = { mode: 'create' | 'edit'; row?: Row };

const PAGE_SIZE = 15;

function fieldLabel(name: string, fields: readonly CrudField[]) {
  return fields.find((field) => field.name === name)?.label || name.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function dateValue(value: unknown, includeTime: boolean) {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  if (!includeTime) return date.toISOString().slice(0, 10);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toFormValue(field: CrudField, value: unknown): FormValue {
  const resolved = value ?? field.defaultValue ?? (field.type === 'boolean' ? false : '');
  if (field.type === 'boolean') return Boolean(resolved);
  if (field.type === 'json') {
    if (typeof resolved === 'string') {
      try { return JSON.stringify(JSON.parse(resolved), null, 2); } catch { return resolved; }
    }
    return JSON.stringify(resolved, null, 2);
  }
  if (field.type === 'tags' || field.type === 'number-list') {
    return Array.isArray(resolved) ? resolved.join(', ') : String(resolved);
  }
  if (field.type === 'date') return dateValue(resolved, false);
  if (field.type === 'datetime-local') return dateValue(resolved, true);
  return String(resolved);
}

function initialValues(fields: readonly CrudField[], row?: Row) {
  return fields.reduce<Record<string, FormValue>>((values, field) => {
    values[field.name] = toFormValue(field, row?.[field.name]);
    return values;
  }, {});
}

function compactValue(value: unknown, column: string) {
  if (value === null || value === undefined || value === '') return <span className="text-pm-ink/25">—</span>;
  if (typeof value === 'boolean') {
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${value ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
        {value ? 'Oui' : 'Non'}
      </span>
    );
  }
  if (column === 'status') {
    return <span className="inline-flex rounded-full bg-pm-peach px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-pm-wine">{String(value)}</span>;
  }
  if (typeof value === 'object') {
    const count = Array.isArray(value) ? value.length : Object.keys(value as object).length;
    return <span className="rounded-lg bg-pm-ivory px-2 py-1 text-xs text-pm-ink/50">{count} élément{count > 1 ? 's' : ''}</span>;
  }
  if (column.endsWith('_at') || column === 'event_date' || column === 'birth_date') {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return <span className="line-clamp-2 break-words">{String(value)}</span>;
}

function detailValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function FieldInput({ field, value, onChange, editing }: {
  field: CrudField;
  value: FormValue;
  onChange: (value: FormValue) => void;
  editing: boolean;
}) {
  const disabled = Boolean(editing && field.createOnly);
  const inputClass = 'w-full rounded-2xl border border-pm-ink/10 bg-white px-4 py-3 text-sm text-pm-ink outline-none transition placeholder:text-pm-ink/25 focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:cursor-not-allowed disabled:bg-pm-ink/[.035] disabled:text-pm-ink/35';

  if (field.type === 'boolean') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(value)}
        disabled={disabled}
        onClick={() => onChange(!Boolean(value))}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${value ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-pm-ink/10 bg-white text-pm-ink/55'}`}
      >
        <span>{value ? 'Activé' : 'Désactivé'}</span>
        <span className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-emerald-500' : 'bg-pm-ink/15'}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${value ? 'left-6' : 'left-1'}`} />
        </span>
      </button>
    );
  }

  if (field.type === 'select') {
    const options = [...(field.options || [])];
    const current = String(value || '');
    if (current && !options.some((option) => option.value === current)) options.unshift({ label: current, value: current });
    return (
      <select value={current} disabled={disabled} required={field.required} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        <option value="">Sélectionner…</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    );
  }

  if (field.type === 'textarea' || field.type === 'json') {
    return (
      <textarea
        value={String(value)}
        disabled={disabled}
        required={field.required}
        spellCheck={field.type !== 'json'}
        rows={field.type === 'json' ? 8 : 5}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} resize-y ${field.type === 'json' ? 'font-mono text-xs leading-6' : 'leading-6'}`}
      />
    );
  }

  const htmlType = field.type === 'tags' || field.type === 'number-list' ? 'text' : field.type;
  return (
    <input
      type={htmlType}
      value={String(value)}
      disabled={disabled}
      required={field.required}
      min={field.min}
      max={field.max}
      step={field.step}
      placeholder={field.placeholder || (field.type === 'tags' ? 'ex. mode, éditorial, beauté' : undefined)}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
}

export default function SupabaseResourceManager({
  resource,
  title,
  primaryKey,
  columns,
  fields,
  initialRows,
  canCreate = true,
  canDelete = true,
}: {
  resource: string;
  title: string;
  primaryKey: string;
  columns: readonly string[];
  fields: readonly CrudField[];
  initialRows: Row[];
  canCreate?: boolean;
  canDelete?: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [values, setValues] = useState<Record<string, FormValue>>({});
  const [viewing, setViewing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const statusOptions = useMemo(() => {
    return [...new Set(rows.map((row) => row.status).filter(Boolean).map(String))].sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !needle || JSON.stringify(row).toLowerCase().includes(needle);
      const matchesStatus = !status || String(row.status || '') === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, rows, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const openCreate = () => {
    setError('');
    setNotice('');
    setValues(initialValues(fields));
    setEditor({ mode: 'create' });
  };

  const openEdit = (row: Row) => {
    setError('');
    setNotice('');
    setValues(initialValues(fields, row));
    setEditor({ mode: 'edit', row });
  };

  const closeEditor = () => {
    if (busy) return;
    setEditor(null);
    setError('');
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError('');
    setNotice('');

    try {
      for (const field of fields) {
        if (editor.mode === 'edit' && field.createOnly) continue;
        const value = values[field.name];
        if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
          throw new Error(`${field.label} est obligatoire.`);
        }
        if (field.type === 'json' && String(value).trim()) {
          try { JSON.parse(String(value)); } catch { throw new Error(`${field.label} contient un JSON invalide.`); }
        }
      }

      const id = editor.row?.[primaryKey];
      const creating = editor.mode === 'create';
      const endpoint = creating
        ? `/api/admin/resources/${encodeURIComponent(resource)}`
        : `/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`;
      const response = await fetch(endpoint, {
        method: creating ? 'POST' : 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Enregistrement impossible.');
      const saved = payload.data as Row;

      if (creating) setRows((current) => [saved, ...current]);
      else setRows((current) => current.map((row) => String(row[primaryKey]) === String(id) ? saved : row));
      setEditor(null);
      setNotice(creating ? 'L’enregistrement a été créé dans Supabase.' : 'Les modifications ont été enregistrées dans Supabase.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const id = deleting[primaryKey];
    if (id === undefined || id === null) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, {
        method: 'DELETE', credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Suppression impossible.');
      setRows((current) => current.filter((row) => String(row[primaryKey]) !== String(id)));
      setDeleting(null);
      setNotice('L’enregistrement a été supprimé de Supabase.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="text-pm-ink">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 overflow-hidden rounded-[2rem] bg-pm-paper shadow-[0_18px_55px_rgba(91,46,37,.07)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.3em] text-pm-coral">
                <Database size={13} aria-hidden="true" /> Données opérationnelles · Supabase
              </div>
              <h1 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">{title}</h1>
              <p className="mt-2 text-sm text-pm-ink/45">
                {rows.length} enregistrement{rows.length !== 1 ? 's' : ''} · création, consultation, modification et suppression en temps réel
              </p>
            </div>
            {canCreate && (
              <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-full bg-pm-ink px-6 py-3.5 text-[9px] font-black uppercase tracking-[.18em] text-white transition hover:-translate-y-0.5 hover:bg-pm-wine hover:shadow-lg">
                <Plus size={15} aria-hidden="true" /> Ajouter
              </button>
            )}
          </div>

          <div className="grid gap-3 border-t border-pm-ink/[.06] bg-white/55 p-4 sm:grid-cols-[1fr_auto] sm:px-8">
            <label className="relative block">
              <span className="sr-only">Rechercher dans {title}</span>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/30" size={17} aria-hidden="true" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Rechercher un nom, un e-mail, un identifiant…" className="w-full rounded-full border border-pm-ink/10 bg-pm-ivory py-3 pl-11 pr-5 text-sm outline-none placeholder:text-pm-ink/30 focus:border-pm-coral/60" />
            </label>
            {statusOptions.length > 0 && (
              <label className="relative block">
                <span className="sr-only">Filtrer par statut</span>
                <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/30" size={15} aria-hidden="true" />
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-w-48 appearance-none rounded-full border border-pm-ink/10 bg-pm-ivory py-3 pl-10 pr-8 text-sm text-pm-ink/65 outline-none focus:border-pm-coral/60">
                  <option value="">Tous les statuts</option>
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>

        {notice && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <Check size={17} aria-hidden="true" /> {notice}
          </div>
        )}
        {error && !editor && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={17} aria-hidden="true" /> {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[1.7rem] border border-pm-ink/[.08] bg-white/75 shadow-[0_18px_55px_rgba(91,46,37,.06)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="border-b border-pm-ink/10 bg-pm-peach text-[9px] font-black uppercase tracking-[.15em] text-pm-wine/65">
                <tr>
                  {columns.map((column) => <th key={column} className="px-4 py-4">{fieldLabel(column, fields)}</th>)}
                  <th className="sticky right-0 bg-pm-peach px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={String(row[primaryKey] ?? index)} className="border-b border-pm-ink/[.06] align-middle transition last:border-0 hover:bg-pm-ivory/80">
                    {columns.map((column) => <td key={column} className="max-w-[260px] px-4 py-4 text-pm-ink/62">{compactValue(row[column], column)}</td>)}
                    <td className="sticky right-0 whitespace-nowrap bg-white/95 px-4 py-3 text-right shadow-[-12px_0_18px_rgba(255,255,255,.8)]">
                      <div className="inline-flex items-center gap-1">
                        <button type="button" onClick={() => setViewing(row)} aria-label="Consulter" title="Consulter" className="rounded-full p-2.5 text-pm-ink/45 transition hover:bg-pm-peach hover:text-pm-wine"><Eye size={16} /></button>
                        <button type="button" onClick={() => openEdit(row)} aria-label="Modifier" title="Modifier" className="rounded-full p-2.5 text-pm-wine transition hover:bg-pm-peach"><Pencil size={16} /></button>
                        {canDelete && <button type="button" onClick={() => { setDeleting(row); setError(''); }} aria-label="Supprimer" title="Supprimer" className="rounded-full p-2.5 text-red-500/70 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!visibleRows.length && (
            <div className="px-5 py-16 text-center">
              <Database className="mx-auto text-pm-ink/15" size={34} aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-pm-ink/45">Aucun résultat</p>
              <p className="mt-1 text-xs text-pm-ink/30">Modifiez votre recherche ou créez un premier enregistrement.</p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-pm-ink/[.07] bg-pm-paper/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-pm-ink/40">
                {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} sur {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-full border border-pm-ink/10 p-2 text-pm-ink/55 transition hover:bg-white disabled:opacity-30" aria-label="Page précédente"><ChevronLeft size={16} /></button>
                <span className="min-w-24 text-center text-[10px] font-black uppercase tracking-wider text-pm-ink/45">Page {safePage} / {totalPages}</span>
                <button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-full border border-pm-ink/10 p-2 text-pm-ink/55 transition hover:bg-white disabled:opacity-30" aria-label="Page suivante"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editor && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end bg-pm-ink/45 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label={`${editor.mode === 'create' ? 'Ajouter' : 'Modifier'} ${title}`}>
          <div className="flex h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] border border-pm-ink/10 bg-pm-paper shadow-2xl sm:h-[calc(100vh-2rem)] sm:rounded-[2rem]">
            <div className="flex items-start justify-between gap-4 border-b border-pm-ink/[.07] px-5 py-5 sm:px-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[.25em] text-pm-coral">{editor.mode === 'create' ? 'Nouvel enregistrement' : 'Mise à jour'}</p>
                <h2 className="mt-2 font-playfair text-3xl font-semibold">{editor.mode === 'create' ? 'Ajouter' : 'Modifier'} · {title}</h2>
              </div>
              <button type="button" onClick={closeEditor} className="rounded-full border border-pm-ink/10 p-2.5 text-pm-ink/45 transition hover:bg-white hover:text-pm-wine" aria-label="Fermer"><X size={18} /></button>
            </div>

            <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map((field) => (
                    <label key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
                      <span className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-[.13em] text-pm-ink/55">
                        {field.label} {field.required && <span className="text-pm-coral">*</span>}
                      </span>
                      <FieldInput field={field} value={values[field.name] ?? ''} editing={editor.mode === 'edit'} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} />
                      {field.help && <span className="mt-1.5 block text-xs leading-5 text-pm-ink/38">{field.help}</span>}
                    </label>
                  ))}
                </div>
                {error && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle size={17} aria-hidden="true" /> {error}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-pm-ink/[.07] bg-white/65 px-5 py-4 sm:px-8">
                <button type="button" disabled={busy} onClick={closeEditor} className="rounded-full border border-pm-ink/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider text-pm-ink/60 transition hover:bg-white disabled:opacity-50">Annuler</button>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-pm-ink px-6 py-3 text-[9px] font-black uppercase tracking-wider text-white transition hover:bg-pm-wine disabled:opacity-50">
                  <Check size={14} aria-hidden="true" /> {busy ? 'Enregistrement…' : editor.mode === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pm-ink/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Consulter ${title}`}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-pm-ink/10 bg-pm-paper shadow-2xl">
            <div className="flex items-center justify-between border-b border-pm-ink/[.07] px-6 py-5">
              <div><p className="text-[9px] font-black uppercase tracking-[.25em] text-pm-coral">Fiche complète</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{title}</h2></div>
              <button type="button" onClick={() => setViewing(null)} className="rounded-full border border-pm-ink/10 p-2.5 text-pm-ink/45 hover:bg-white" aria-label="Fermer"><X size={18} /></button>
            </div>
            <dl className="grid max-h-[65vh] gap-px overflow-y-auto bg-pm-ink/[.06] sm:grid-cols-2">
              {Object.entries(viewing).map(([key, value]) => (
                <div key={key} className={`bg-pm-paper px-6 py-4 ${typeof value === 'object' && value !== null ? 'sm:col-span-2' : ''}`}>
                  <dt className="text-[9px] font-black uppercase tracking-[.15em] text-pm-ink/35">{fieldLabel(key, fields)}</dt>
                  <dd className={`mt-2 break-words text-sm leading-6 text-pm-ink/70 ${typeof value === 'object' && value !== null ? 'whitespace-pre-wrap rounded-xl bg-white p-3 font-mono text-xs' : ''}`}>{detailValue(value)}</dd>
                </div>
              ))}
            </dl>
            <div className="flex justify-end gap-3 border-t border-pm-ink/[.07] bg-white/60 px-6 py-4">
              <button type="button" onClick={() => setViewing(null)} className="rounded-full border border-pm-ink/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider">Fermer</button>
              <button type="button" onClick={() => { const row = viewing; setViewing(null); openEdit(row); }} className="inline-flex items-center gap-2 rounded-full bg-pm-ink px-5 py-3 text-[9px] font-black uppercase tracking-wider text-white"><Pencil size={13} /> Modifier</button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-pm-ink/55 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="Confirmer la suppression">
          <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-pm-paper p-7 text-center shadow-2xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><Trash2 size={24} /></span>
            <h2 className="mt-5 font-playfair text-2xl font-semibold">Supprimer cet élément ?</h2>
            <p className="mt-3 text-sm leading-6 text-pm-ink/50">Cette action supprimera définitivement l’enregistrement de la table Supabase. Elle ne peut pas être annulée.</p>
            {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" disabled={busy} onClick={() => { setDeleting(null); setError(''); }} className="rounded-full border border-pm-ink/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider">Annuler</button>
              <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-full bg-red-600 px-5 py-3 text-[9px] font-black uppercase tracking-wider text-white disabled:opacity-50">{busy ? 'Suppression…' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
