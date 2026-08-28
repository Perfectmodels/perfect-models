'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, ChevronLeft, ChevronRight, Database, Eye, Loader2, Pencil,
  Plus, Search, SlidersHorizontal, Trash2, X,
} from 'lucide-react';
import type { CrudField } from '@/lib/resource-registry';

type Row = Record<string, unknown>;
type FormValue = string | boolean;
type EditorState = { mode: 'create' | 'edit'; row?: Row };
type RelationOption = { label: string; value: string };
type RelationOptions = Record<string, RelationOption[]>;

type Props = {
  resource: string;
  title: string;
  primaryKey: string;
  columns: readonly string[];
  fields: readonly CrudField[];
  initialRows: Row[];
  initialTotal: number;
  canCreate?: boolean;
  canDelete?: boolean;
};

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZES = [15, 25, 50, 100] as const;

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
  if (field.type === 'tags' || field.type === 'number-list') return Array.isArray(resolved) ? resolved.join(', ') : String(resolved);
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
  if (value === null || value === undefined || value === '') return <span className="text-pm-ink/35">—</span>;
  if (typeof value === 'boolean') return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${value ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>{value ? 'Oui' : 'Non'}</span>;
  if (column === 'status') return <span className="inline-flex rounded-full bg-pm-peach px-2.5 py-1 text-[10px] font-extrabold text-pm-wine">{String(value)}</span>;
  if (typeof value === 'object') {
    const count = Array.isArray(value) ? value.length : Object.keys(value as object).length;
    return <span className="rounded-lg bg-pm-ivory px-2 py-1 text-xs text-pm-ink/60">{count} élément{count > 1 ? 's' : ''}</span>;
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

function inputHints(field: CrudField) {
  if (field.type === 'email') return { autoComplete: 'email', inputMode: 'email' as const };
  if (field.type === 'tel') return { autoComplete: 'tel', inputMode: 'tel' as const };
  if (field.name === 'first_name') return { autoComplete: 'given-name' };
  if (field.name === 'last_name' || field.name === 'name' || field.name === 'full_name' || field.name === 'display_name') return { autoComplete: 'name' };
  if (field.name === 'birth_date') return { autoComplete: 'bday' };
  if (field.name === 'location' || field.name === 'city') return { autoComplete: 'address-level2' };
  if (field.type === 'url') return { inputMode: 'url' as const };
  if (field.type === 'number') return { inputMode: 'decimal' as const };
  return { autoComplete: 'off' };
}

function FieldInput({ field, value, onChange, editing, relations, inputId, describedBy }: {
  field: CrudField;
  value: FormValue;
  onChange: (value: FormValue) => void;
  editing: boolean;
  relations: RelationOptions;
  inputId: string;
  describedBy?: string;
}) {
  const disabled = Boolean(editing && field.createOnly);
  const inputClass = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/15 disabled:cursor-not-allowed disabled:bg-pm-ink/[.035] disabled:text-pm-ink/45';
  const relationOptions = relations[field.name] || [];

  if (field.type === 'boolean') {
    return <button id={inputId} type="button" role="switch" aria-checked={Boolean(value)} aria-describedby={describedBy} disabled={disabled} onClick={() => onChange(!Boolean(value))} className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pm-coral ${value ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-pm-ink/15 bg-white text-pm-ink/65'}`}><span>{value ? 'Activé' : 'Désactivé'}</span><span aria-hidden="true" className={`relative h-6 w-11 rounded-full transition ${value ? 'bg-emerald-600' : 'bg-pm-ink/20'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${value ? 'left-6' : 'left-1'}`} /></span></button>;
  }

  if (field.name === 'model_ids' && relationOptions.length) {
    const selected = new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean));
    return <select id={inputId} multiple value={[...selected]} disabled={disabled} aria-describedby={describedBy} onChange={(event) => onChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value).join(', '))} className={`${inputClass} min-h-40`}>
      {relationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>;
  }

  if (relationOptions.length) {
    return <select id={inputId} value={String(value || '')} disabled={disabled} required={field.required} aria-describedby={describedBy} onChange={(event) => onChange(event.target.value)} className={inputClass}>
      <option value="">Sélectionner…</option>
      {relationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>;
  }

  if (field.type === 'select') {
    const options = [...(field.options || [])];
    const current = String(value || '');
    if (current && !options.some((option) => option.value === current)) options.unshift({ label: current, value: current });
    return <select id={inputId} value={current} disabled={disabled} required={field.required} aria-describedby={describedBy} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Sélectionner…</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  }

  if (field.type === 'textarea' || field.type === 'json') {
    return <textarea id={inputId} value={String(value)} disabled={disabled} required={field.required} aria-describedby={describedBy} spellCheck={field.type !== 'json'} rows={field.type === 'json' ? 7 : 5} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y ${field.type === 'json' ? 'font-mono text-xs leading-6' : 'leading-6'}`} />;
  }

  const htmlType = field.type === 'tags' || field.type === 'number-list' ? 'text' : field.type;
  const hints = inputHints(field);
  return <input id={inputId} type={htmlType} value={String(value)} disabled={disabled} required={field.required} aria-describedby={describedBy} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder || (field.type === 'tags' ? 'Séparez les valeurs par des virgules' : undefined)} onChange={(event) => onChange(event.target.value)} className={inputClass} {...hints} />;
}

export default function PaginatedResourceManager({ resource, title, primaryKey, columns, fields, initialRows, initialTotal, canCreate = true, canDelete = true }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [values, setValues] = useState<Record<string, FormValue>>({});
  const [viewing, setViewing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [relations, setRelations] = useState<RelationOptions>({});
  const firstLoad = useRef(true);
  const formBaseId = useId();

  const statusOptions = useMemo(() => fields.find((field) => field.name === 'status')?.options || [], [fields]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const loadRows = async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), order });
      if (query.trim()) params.set('q', query.trim());
      if (status) params.set('status', status);
      if (sort) params.set('sort', sort);
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}?${params}`, { credentials: 'include', cache: 'no-store', signal });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Chargement impossible.');
      setRows(Array.isArray(payload.data) ? payload.data : []);
      setTotal(Number(payload.pagination?.total || 0));
    } catch (loadError) {
      if ((loadError as Error)?.name !== 'AbortError') setError(loadError instanceof Error ? loadError.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void loadRows(controller.signal), query ? 280 : 0);
    return () => { window.clearTimeout(timeout); controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, query, status, sort, order, resource]);

  useEffect(() => {
    const relationFields = fields.map((field) => field.name).filter((name) => ['model_id', 'model_ids', 'user_id', 'auth_user_id', 'recipient_user_id', 'jury_user_id', 'author_user_id', 'casting_application_id', 'post_id', 'thread_id', 'course_id'].includes(name));
    if (!relationFields.length) return;
    const controller = new AbortController();
    void fetch(`/api/admin/form-options?fields=${encodeURIComponent(relationFields.join(','))}`, { credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : {})
      .then((payload) => setRelations(payload.options || {}))
      .catch(() => {});
    return () => controller.abort();
  }, [fields]);

  useEffect(() => {
    if (!editor && !viewing && !deleting) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || busy) return;
      setEditor(null); setViewing(null); setDeleting(null); setError('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editor, viewing, deleting, busy]);

  const openCreate = () => { setError(''); setNotice(''); setValues(initialValues(fields)); setEditor({ mode: 'create' }); };
  const openEdit = (row: Row) => { setError(''); setNotice(''); setValues(initialValues(fields, row)); setEditor({ mode: 'edit', row }); };
  const closeEditor = () => { if (!busy) { setEditor(null); setError(''); } };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;
    setBusy(true); setError(''); setNotice('');
    try {
      for (const field of fields) {
        if (editor.mode === 'edit' && field.createOnly) continue;
        const value = values[field.name];
        if (field.required && (value === undefined || value === null || String(value).trim() === '')) throw new Error(`${field.label} est obligatoire.`);
        if (field.type === 'json' && String(value).trim()) { try { JSON.parse(String(value)); } catch { throw new Error(`${field.label} contient un JSON invalide.`); } }
      }
      const id = editor.row?.[primaryKey];
      const creating = editor.mode === 'create';
      const endpoint = creating ? `/api/admin/resources/${encodeURIComponent(resource)}` : `/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`;
      const response = await fetch(endpoint, { method: creating ? 'POST' : 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Enregistrement impossible.');
      setEditor(null);
      setNotice(creating ? 'Enregistrement créé dans Supabase.' : 'Modifications enregistrées dans Supabase.');
      if (creating) setPage(1);
      await loadRows();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Enregistrement impossible.'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    const id = deleting[primaryKey];
    if (id === undefined || id === null) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Suppression impossible.');
      setDeleting(null); setNotice('Enregistrement supprimé de Supabase.');
      if (rows.length === 1 && page > 1) setPage((current) => current - 1); else await loadRows();
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible.'); }
    finally { setBusy(false); }
  };

  return (
    <section className="text-pm-ink" aria-busy={loading}>
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 overflow-hidden rounded-[2rem] bg-pm-paper shadow-[0_18px_55px_rgba(91,46,37,.07)]">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
            <div><div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.2em] text-pm-coral"><Database size={14} aria-hidden="true" /> Données opérationnelles · Supabase</div><h1 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">{title}</h1><p className="mt-2 text-sm text-pm-ink/60">{total} enregistrement{total !== 1 ? 's' : ''} · pagination serveur, recherche, tri et CRUD réel</p></div>
            {canCreate && <button type="button" onClick={openCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pm-ink px-6 py-3 text-xs font-extrabold uppercase tracking-[.12em] text-white transition hover:bg-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pm-coral"><Plus size={16} aria-hidden="true" /> Ajouter</button>}
          </div>

          <div className="grid gap-3 border-t border-pm-ink/[.07] bg-white/60 p-4 sm:px-8 lg:grid-cols-[minmax(250px,1fr)_auto_auto_auto]">
            <label className="relative block"><span className="sr-only">Rechercher dans {title}</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/40" size={17} aria-hidden="true" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Rechercher…" autoComplete="off" className="min-h-12 w-full rounded-full border border-pm-ink/15 bg-pm-ivory py-3 pl-11 pr-5 text-sm outline-none placeholder:text-pm-ink/40 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10" /></label>
            {statusOptions.length > 0 && <label className="relative block"><span className="sr-only">Filtrer par statut</span><SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/40" size={15} aria-hidden="true" /><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-h-12 min-w-48 appearance-none rounded-full border border-pm-ink/15 bg-pm-ivory py-3 pl-10 pr-8 text-sm text-pm-ink/70 outline-none focus-visible:border-pm-coral"><option value="">Tous les statuts</option>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
            <label><span className="sr-only">Trier par</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="min-h-12 rounded-full border border-pm-ink/15 bg-pm-ivory px-4 text-sm text-pm-ink/70 outline-none focus-visible:border-pm-coral"><option value="">Tri par défaut</option>{columns.map((column) => <option key={column} value={column}>{fieldLabel(column, fields)}</option>)}</select></label>
            <button type="button" onClick={() => { setOrder((current) => current === 'desc' ? 'asc' : 'desc'); setPage(1); }} className="min-h-12 rounded-full border border-pm-ink/15 bg-pm-ivory px-4 text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/65" aria-label={`Tri ${order === 'desc' ? 'décroissant' : 'croissant'}`}>{order === 'desc' ? '↓ Récent' : '↑ Ancien'}</button>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {notice && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"><Check size={18} aria-hidden="true" /> {notice}</div>}
          {error && !editor && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"><AlertTriangle size={18} aria-hidden="true" /> {error}</div>}
        </div>

        <div className="relative overflow-hidden rounded-[1.7rem] border border-pm-ink/[.09] bg-white shadow-[0_18px_55px_rgba(91,46,37,.06)]">
          {loading && <div className="absolute inset-x-0 top-0 z-20 flex h-1 overflow-hidden bg-pm-peach"><span className="w-full animate-pulse bg-pm-coral motion-reduce:animate-none" /></div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <caption className="sr-only">Liste paginée : {title}</caption>
              <thead className="border-b border-pm-ink/10 bg-pm-peach text-[11px] font-extrabold uppercase tracking-[.1em] text-pm-wine"><tr>{columns.map((column) => <th key={column} scope="col" className="px-4 py-4">{fieldLabel(column, fields)}</th>)}<th scope="col" className="sticky right-0 bg-pm-peach px-4 py-4 text-right">Actions</th></tr></thead>
              <tbody>{rows.map((row, index) => <tr key={String(row[primaryKey] ?? index)} className="border-b border-pm-ink/[.06] align-middle last:border-0 hover:bg-pm-ivory/75">{columns.map((column) => <td key={column} className="max-w-[280px] px-4 py-4 text-pm-ink/70">{compactValue(row[column], column)}</td>)}<td className="sticky right-0 whitespace-nowrap bg-white/95 px-4 py-3 text-right"><div className="inline-flex gap-1"><button type="button" onClick={() => setViewing(row)} aria-label={`Consulter ${String(row[primaryKey] || '')}`} className="grid h-11 w-11 place-items-center rounded-full text-pm-ink/55 hover:bg-pm-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral"><Eye size={17} /></button><button type="button" onClick={() => openEdit(row)} aria-label={`Modifier ${String(row[primaryKey] || '')}`} className="grid h-11 w-11 place-items-center rounded-full text-pm-wine hover:bg-pm-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral"><Pencil size={17} /></button>{canDelete && <button type="button" onClick={() => { setDeleting(row); setError(''); }} aria-label={`Supprimer ${String(row[primaryKey] || '')}`} className="grid h-11 w-11 place-items-center rounded-full text-red-600 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"><Trash2 size={17} /></button>}</div></td></tr>)}</tbody>
            </table>
          </div>
          {!rows.length && !loading && <div className="px-5 py-16 text-center"><Database className="mx-auto text-pm-ink/20" size={36} aria-hidden="true" /><p className="mt-4 text-base font-bold text-pm-ink/55">Aucun résultat</p><p className="mt-1 text-sm text-pm-ink/45">Modifiez les filtres ou créez un premier enregistrement.</p></div>}
          <div className="flex flex-col gap-3 border-t border-pm-ink/[.07] bg-pm-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><p className="text-sm text-pm-ink/55">{total ? ((safePage - 1) * pageSize) + 1 : 0}–{Math.min(safePage * pageSize, total)} sur {total}</p><label className="text-sm text-pm-ink/55">Afficher <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="ml-1 rounded-lg border border-pm-ink/15 bg-white px-2 py-1.5">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div><nav className="flex items-center gap-2" aria-label="Pagination"><button type="button" disabled={safePage === 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15 disabled:opacity-35" aria-label="Page précédente"><ChevronLeft size={17} /></button><span className="min-w-28 text-center text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/55">Page {safePage} / {totalPages}</span><button type="button" disabled={safePage >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15 disabled:opacity-35" aria-label="Page suivante"><ChevronRight size={17} /></button></nav></div>
        </div>
      </div>

      {editor && <div className="fixed inset-0 z-[100] flex items-end justify-end bg-pm-ink/50 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={`${formBaseId}-title`}><div className="flex h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-pm-paper shadow-2xl sm:h-[calc(100vh-2rem)] sm:rounded-[2rem]"><div className="flex items-start justify-between border-b border-pm-ink/10 px-5 py-5 sm:px-8"><div><p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-pm-coral">{editor.mode === 'create' ? 'Nouvel enregistrement' : 'Mise à jour'}</p><h2 id={`${formBaseId}-title`} className="mt-2 font-playfair text-3xl font-semibold">{editor.mode === 'create' ? 'Ajouter' : 'Modifier'} · {title}</h2></div><button type="button" onClick={closeEditor} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15" aria-label="Fermer"><X size={19} /></button></div><form onSubmit={save} noValidate={false} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8"><div className="grid gap-5 sm:grid-cols-2">{fields.map((field, index) => { const inputId = `${formBaseId}-${field.name}`; const helpId = field.help ? `${inputId}-help` : undefined; return <div key={field.name} className={field.wide ? 'sm:col-span-2' : ''}><label htmlFor={inputId} className="mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/65">{field.label} {field.required && <span className="text-pm-coral" aria-label="obligatoire">*</span>}</label><FieldInput field={field} value={values[field.name] ?? ''} editing={editor.mode === 'edit'} relations={relations} inputId={inputId} describedBy={helpId} onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))} />{field.help && <p id={helpId} className="mt-2 text-sm leading-5 text-pm-ink/50">{field.help}</p>}{index === 0 && field.createOnly && editor.mode === 'edit' && <p className="mt-2 text-xs text-pm-ink/45">Cet identifiant est verrouillé après création.</p>}</div>; })}</div>{error && <div role="alert" className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"><AlertTriangle size={18} aria-hidden="true" /> {error}</div>}</div><div className="flex items-center justify-end gap-3 border-t border-pm-ink/10 bg-white px-5 py-4 sm:px-8"><button type="button" disabled={busy} onClick={closeEditor} className="min-h-11 rounded-full border border-pm-ink/15 px-5 text-sm font-bold disabled:opacity-50">Annuler</button><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-ink px-6 text-sm font-extrabold text-white disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" /> : <Check size={16} />} {busy ? 'Enregistrement…' : editor.mode === 'create' ? 'Créer' : 'Enregistrer'}</button></div></form></div></div>}

      {viewing && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-pm-ink/50 p-4" role="dialog" aria-modal="true" aria-label={`Consulter ${title}`}><div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-pm-paper shadow-2xl"><div className="flex items-center justify-between border-b border-pm-ink/10 px-6 py-5"><h2 className="font-playfair text-3xl font-semibold">Fiche · {title}</h2><button type="button" onClick={() => setViewing(null)} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15" aria-label="Fermer"><X size={18} /></button></div><dl className="grid max-h-[65vh] gap-px overflow-y-auto bg-pm-ink/[.06] sm:grid-cols-2">{Object.entries(viewing).map(([key, value]) => <div key={key} className={`bg-pm-paper px-6 py-4 ${typeof value === 'object' && value !== null ? 'sm:col-span-2' : ''}`}><dt className="text-[11px] font-extrabold uppercase tracking-[.08em] text-pm-ink/50">{fieldLabel(key, fields)}</dt><dd className={`mt-2 break-words text-sm leading-6 text-pm-ink/75 ${typeof value === 'object' && value !== null ? 'whitespace-pre-wrap rounded-xl bg-white p-3 font-mono text-xs' : ''}`}>{detailValue(value)}</dd></div>)}</dl><div className="flex justify-end gap-3 border-t border-pm-ink/10 bg-white px-6 py-4"><button type="button" onClick={() => setViewing(null)} className="min-h-11 rounded-full border border-pm-ink/15 px-5 text-sm font-bold">Fermer</button><button type="button" onClick={() => { const row = viewing; setViewing(null); openEdit(row); }} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-ink px-5 text-sm font-extrabold text-white"><Pencil size={15} /> Modifier</button></div></div></div>}

      {deleting && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-pm-ink/60 p-4" role="alertdialog" aria-modal="true" aria-labelledby={`${formBaseId}-delete-title`}><div className="w-full max-w-md rounded-[2rem] bg-pm-paper p-7 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600"><AlertTriangle size={24} /></div><h2 id={`${formBaseId}-delete-title`} className="mt-5 font-playfair text-3xl font-semibold">Confirmer la suppression</h2><p className="mt-3 text-sm leading-6 text-pm-ink/60">Cette action supprime définitivement l’enregistrement de Supabase.</p>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="mt-6 flex justify-center gap-3"><button type="button" disabled={busy} onClick={() => setDeleting(null)} className="min-h-11 rounded-full border border-pm-ink/15 px-5 text-sm font-bold">Annuler</button><button type="button" disabled={busy} onClick={remove} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-extrabold text-white disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" /> : <Trash2 size={16} />} Supprimer</button></div></div></div>}
    </section>
  );
}
