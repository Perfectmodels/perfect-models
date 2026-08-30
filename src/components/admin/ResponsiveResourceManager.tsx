'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Check, ChevronLeft, ChevronRight, Database, Eye, Loader2, Pencil,
  Plus, Search, SlidersHorizontal, Trash2, X,
} from 'lucide-react';
import type { CrudField } from '@/lib/resource-registry';
import StructuredDataField, { StructuredDataPreview } from './StructuredDataField';

type Row = Record<string, unknown>;
type FormValue = string | boolean;
type EditorState = { mode: 'create' | 'edit'; row?: Row };

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

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZES = [15, 25, 50] as const;
const RELATION_FIELDS = ['model_id','model_ids','user_id','auth_user_id','recipient_user_id','jury_user_id','author_user_id','casting_application_id','post_id','thread_id','course_id'];

function labelFor(name: string, fields: readonly CrudField[]) {
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
      try { return JSON.stringify(JSON.parse(resolved)); } catch { return JSON.stringify({}); }
    }
    return JSON.stringify(resolved);
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

function displayTitle(row: Row, primaryKey: string) {
  for (const key of ['name','title','full_name','display_name','subject','campaign','quote_number','invoice_number','email']) {
    if (row[key]) return String(row[key]);
  }
  return String(row[primaryKey] || 'Dossier');
}

function compactValue(value: unknown, column: string) {
  if (value === null || value === undefined || value === '') return <span className="text-pm-ink/35">—</span>;
  if (typeof value === 'boolean') return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${value ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>{value ? 'Oui' : 'Non'}</span>;
  if (typeof value === 'object') {
    const count = Array.isArray(value) ? value.length : Object.keys(value as object).length;
    return <span className="inline-flex rounded-full bg-pm-peach px-2.5 py-1 text-[10px] font-extrabold text-pm-wine">{count} élément{count > 1 ? 's' : ''}</span>;
  }
  if (column === 'status' || column === 'stage' || column === 'decision') return <span className="inline-flex rounded-full bg-pm-peach px-2.5 py-1 text-[10px] font-extrabold text-pm-wine">{String(value)}</span>;
  if (column.endsWith('_at') || ['event_date','birth_date','period','issued_at','due_at','starts_on','ends_on'].includes(column)) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return <span className="line-clamp-2 break-words">{String(value)}</span>;
}

function inputHints(field: CrudField) {
  if (field.type === 'email') return { autoComplete: 'email', inputMode: 'email' as const };
  if (field.type === 'tel') return { autoComplete: 'tel', inputMode: 'tel' as const };
  if (field.name === 'first_name') return { autoComplete: 'given-name' };
  if (['last_name','name','full_name','display_name'].includes(field.name)) return { autoComplete: 'name' };
  if (field.name === 'birth_date') return { autoComplete: 'bday' };
  if (['location','city'].includes(field.name)) return { autoComplete: 'address-level2' };
  if (field.type === 'url') return { inputMode: 'url' as const };
  if (field.type === 'number') return { inputMode: 'decimal' as const };
  return { autoComplete: 'off' };
}

function FieldInput({ field, value, onChange, editing, relationOptions, inputId, describedBy }: {
  field: CrudField;
  value: FormValue;
  onChange: (value: FormValue) => void;
  editing: boolean;
  relationOptions: Array<{ label: string; value: string }>;
  inputId: string;
  describedBy?: string;
}) {
  const disabled = Boolean(editing && field.createOnly);
  const inputClass = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/15 disabled:cursor-not-allowed disabled:bg-pm-ink/[.035] disabled:text-pm-ink/45';
  const options = relationOptions.length ? relationOptions : [...(field.options || [])];

  if (field.type === 'json') {
    return <div id={inputId} aria-describedby={describedBy}><StructuredDataField fieldName={field.name} value={String(value || '{}')} onChange={onChange} disabled={disabled} /></div>;
  }
  if (field.type === 'boolean') {
    return <button id={inputId} type="button" role="switch" aria-checked={Boolean(value)} aria-describedby={describedBy} disabled={disabled} onClick={() => onChange(!Boolean(value))} className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${value ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-pm-ink/15 bg-white text-pm-ink/65'}`}><span>{value ? 'Activé' : 'Désactivé'}</span><span aria-hidden="true" className={`relative h-6 w-11 rounded-full ${value ? 'bg-emerald-600' : 'bg-pm-ink/20'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${value ? 'left-6' : 'left-1'}`} /></span></button>;
  }
  if (field.name === 'model_ids' && options.length) {
    const selected = new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean));
    return <select id={inputId} multiple value={[...selected]} disabled={disabled} aria-describedby={describedBy} onChange={(event) => onChange(Array.from(event.currentTarget.selectedOptions).map((option) => option.value).join(', '))} className={`${inputClass} min-h-40`}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  }
  if (field.type === 'select' || options.length) {
    const current = String(value || '');
    const normalized = options.some((option) => option.value === current) || !current ? options : [{ label: current, value: current }, ...options];
    return <select id={inputId} value={current} disabled={disabled} required={field.required} aria-describedby={describedBy} onChange={(event) => onChange(event.target.value)} className={inputClass}><option value="">Sélectionner…</option>{normalized.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  }
  if (field.type === 'textarea') return <textarea id={inputId} value={String(value)} disabled={disabled} required={field.required} aria-describedby={describedBy} rows={5} placeholder={field.placeholder} onChange={(event) => onChange(event.target.value)} className={`${inputClass} resize-y leading-6`} />;
  const htmlType = field.type === 'tags' || field.type === 'number-list' ? 'text' : field.type;
  return <input id={inputId} type={htmlType} value={String(value)} disabled={disabled} required={field.required} aria-describedby={describedBy} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder || (field.type === 'tags' ? 'Séparez les valeurs par des virgules' : undefined)} onChange={(event) => onChange(event.target.value)} className={inputClass} {...inputHints(field)} />;
}

export default function ResponsiveResourceManager({ resource, title, primaryKey, columns, fields, initialRows, initialTotal, canCreate = true, canDelete = true }: Props) {
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
  const [relations, setRelations] = useState<Record<string, Array<{ label: string; value: string }>>>({});
  const firstLoad = useRef(true);
  const formBaseId = useId();

  const statusOptions = useMemo(() => fields.find((field) => field.name === 'status')?.options || [], [fields]);
  const visibleColumns = useMemo(() => columns.slice(0, 6), [columns]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const loadRows = async (signal?: AbortSignal) => {
    setLoading(true); setError('');
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
    } catch (cause) {
      if ((cause as Error)?.name !== 'AbortError') setError(cause instanceof Error ? cause.message : 'Chargement impossible.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => void loadRows(controller.signal), query ? 260 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, query, status, sort, order, resource]);

  useEffect(() => {
    const names = fields.map((field) => field.name).filter((name) => RELATION_FIELDS.includes(name));
    if (!names.length) return;
    const controller = new AbortController();
    void fetch(`/api/admin/form-options?fields=${encodeURIComponent(names.join(','))}`, { credentials: 'include', cache: 'no-store', signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : {})
      .then((payload) => setRelations(payload.options || {})).catch(() => {});
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

  const openCreate = () => { setValues(initialValues(fields)); setEditor({ mode: 'create' }); setError(''); setNotice(''); };
  const openEdit = (row: Row) => { setValues(initialValues(fields, row)); setEditor({ mode: 'edit', row }); setError(''); setNotice(''); };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!editor) return;
    setBusy(true); setError(''); setNotice('');
    try {
      for (const field of fields) {
        if (editor.mode === 'edit' && field.createOnly) continue;
        const value = values[field.name];
        if (field.required && (value === undefined || value === null || String(value).trim() === '')) throw new Error(`${field.label} est obligatoire.`);
        if (field.type === 'json' && String(value).trim()) { try { JSON.parse(String(value)); } catch { throw new Error(`${field.label} contient une donnée structurée invalide.`); } }
      }
      const creating = editor.mode === 'create';
      const id = editor.row?.[primaryKey];
      const endpoint = creating ? `/api/admin/resources/${encodeURIComponent(resource)}` : `/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`;
      const response = await fetch(endpoint, { method: creating ? 'POST' : 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Enregistrement impossible.');
      setEditor(null); setNotice(creating ? 'Dossier créé.' : 'Dossier mis à jour.');
      if (creating) setPage(1);
      await loadRows();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    const id = deleting[primaryKey]; if (id === undefined || id === null) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, { method: 'DELETE', credentials: 'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Suppression impossible.');
      setDeleting(null); setNotice('Dossier supprimé.');
      if (rows.length === 1 && page > 1) setPage((current) => current - 1); else await loadRows();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Suppression impossible.'); }
    finally { setBusy(false); }
  };

  return <section className="text-pm-ink" aria-busy={loading}>
    <div className="rounded-[1.8rem] border border-pm-ink/[.08] bg-white shadow-[0_16px_50px_rgba(91,46,37,.05)]">
      <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-pm-coral"><Database size={14} /> Centre de traitement</p><h3 className="mt-2 font-playfair text-3xl font-semibold">{title}</h3><p className="mt-2 text-sm text-pm-ink/50">{total} dossier{total !== 1 ? 's' : ''} · affichage adaptatif sans tableau défilant</p></div>
        {canCreate && <button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pm-ink px-5 text-xs font-black uppercase tracking-[.08em] text-white"><Plus size={15} /> Nouveau dossier</button>}
      </div>
      <div className="grid gap-3 border-t border-pm-ink/[.07] bg-pm-ivory/55 p-4 sm:p-5 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(0,.45fr))]">
        <label className="relative"><span className="sr-only">Rechercher</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/35" size={16}/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Rechercher un dossier…" className="min-h-11 w-full rounded-xl border border-pm-ink/12 bg-white pl-10 pr-3 text-sm outline-none focus:border-pm-coral" /></label>
        {statusOptions.length ? <label><span className="sr-only">Statut</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-h-11 w-full rounded-xl border border-pm-ink/12 bg-white px-3 text-sm outline-none"><option value="">Tous les statuts</option>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> : <div className="hidden lg:block" />}
        <label><span className="sr-only">Trier par</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="min-h-11 w-full rounded-xl border border-pm-ink/12 bg-white px-3 text-sm outline-none"><option value="">Tri par défaut</option>{columns.map((column) => <option key={column} value={column}>{labelFor(column, fields)}</option>)}</select></label>
        <button type="button" onClick={() => setOrder((current) => current === 'desc' ? 'asc' : 'desc')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-pm-ink/12 bg-white px-3 text-xs font-black uppercase tracking-[.06em] text-pm-ink/60"><SlidersHorizontal size={14}/>{order === 'desc' ? 'Plus récent' : 'Plus ancien'}</button>
      </div>
    </div>

    <div className="mt-4" aria-live="polite">{notice && <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"><Check size={17}/>{notice}</div>}{error && !editor && <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"><AlertTriangle size={17}/>{error}</div>}</div>

    <div className="relative mt-4">
      {loading && <div className="absolute inset-x-0 -top-1 z-10 h-1 overflow-hidden rounded-full bg-pm-peach"><span className="block h-full w-full animate-pulse bg-pm-coral motion-reduce:animate-none" /></div>}
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {rows.map((row, index) => <article key={String(row[primaryKey] ?? index)} className="min-w-0 rounded-[1.45rem] border border-pm-ink/[.08] bg-white p-4 shadow-[0_10px_35px_rgba(91,46,37,.04)] sm:p-5">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-pm-coral">Dossier</p><h4 className="mt-1 truncate font-playfair text-2xl font-semibold">{displayTitle(row, primaryKey)}</h4></div>{row.status ? compactValue(row.status, 'status') : null}</div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">{visibleColumns.filter((column) => column !== 'status' && row[column] !== undefined).slice(0, 4).map((column) => <div key={column} className="min-w-0 rounded-xl bg-pm-ivory px-3 py-2.5"><dt className="text-[9px] font-black uppercase tracking-[.08em] text-pm-ink/35">{labelFor(column, fields)}</dt><dd className="mt-1 min-w-0 text-sm text-pm-ink/70">{compactValue(row[column], column)}</dd></div>)}</dl>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-pm-ink/[.07] pt-4"><button type="button" onClick={() => setViewing(row)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pm-ink/12 px-4 text-xs font-bold"><Eye size={14}/> Consulter</button><button type="button" onClick={() => openEdit(row)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-peach px-4 text-xs font-black text-pm-wine"><Pencil size={14}/> Modifier</button>{canDelete && <button type="button" onClick={() => setDeleting(row)} className="ml-auto grid h-10 w-10 place-items-center rounded-full text-red-600 hover:bg-red-50" aria-label="Supprimer"><Trash2 size={15}/></button>}</div>
        </article>)}
      </div>
      {!rows.length && !loading && <div className="rounded-[1.5rem] border border-dashed border-pm-ink/12 bg-white px-5 py-14 text-center"><Database className="mx-auto text-pm-ink/20" size={34}/><p className="mt-3 font-bold text-pm-ink/55">Aucun dossier</p><p className="mt-1 text-sm text-pm-ink/40">Modifiez les filtres ou créez un premier dossier.</p></div>}
      <div className="mt-4 flex flex-col gap-3 rounded-[1.3rem] bg-pm-paper px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-3 text-sm text-pm-ink/50"><span>{total ? ((safePage - 1) * pageSize) + 1 : 0}–{Math.min(safePage * pageSize, total)} sur {total}</span><label>Afficher <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="ml-1 rounded-lg border border-pm-ink/12 bg-white px-2 py-1.5">{PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}</select></label></div><nav className="flex items-center justify-between gap-2 sm:justify-end" aria-label="Pagination"><button type="button" disabled={safePage === 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12 disabled:opacity-30" aria-label="Page précédente"><ChevronLeft size={16}/></button><span className="text-xs font-black uppercase tracking-[.06em] text-pm-ink/45">{safePage} / {totalPages}</span><button type="button" disabled={safePage >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12 disabled:opacity-30" aria-label="Page suivante"><ChevronRight size={16}/></button></nav></div>
    </div>

    {editor && <div className="fixed inset-0 z-[100] flex items-end justify-end bg-pm-ink/50 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={`${formBaseId}-title`}><div className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-pm-paper shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-[2rem]"><div className="flex items-start justify-between border-b border-pm-ink/10 px-5 py-5 sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-pm-coral">{editor.mode === 'create' ? 'Nouveau dossier' : 'Mise à jour'}</p><h2 id={`${formBaseId}-title`} className="mt-2 font-playfair text-3xl font-semibold">{editor.mode === 'create' ? 'Créer' : 'Modifier'} · {title}</h2></div><button type="button" disabled={busy} onClick={() => setEditor(null)} className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12" aria-label="Fermer"><X size={18}/></button></div><form onSubmit={save} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7"><div className="grid gap-5 sm:grid-cols-2">{fields.map((field) => { const inputId = `${formBaseId}-${field.name}`; const helpId = field.help ? `${inputId}-help` : undefined; return <div key={field.name} className={field.wide || field.type === 'json' ? 'sm:col-span-2' : ''}><label htmlFor={field.type === 'json' ? undefined : inputId} className="mb-2 block text-xs font-black uppercase tracking-[.06em] text-pm-ink/55">{field.label}{field.required ? <span className="text-pm-coral"> *</span> : null}</label><FieldInput field={field} value={values[field.name] ?? ''} editing={editor.mode === 'edit'} relationOptions={relations[field.name] || []} inputId={inputId} describedBy={helpId} onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))} />{field.help && <p id={helpId} className="mt-2 text-xs leading-5 text-pm-ink/45">{field.help}</p>}</div>; })}</div>{error && <div role="alert" className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"><AlertTriangle size={17}/>{error}</div>}</div><div className="flex flex-wrap items-center justify-end gap-2 border-t border-pm-ink/10 bg-white px-5 py-4 sm:px-7"><button type="button" disabled={busy} onClick={() => setEditor(null)} className="min-h-10 rounded-full border border-pm-ink/12 px-4 text-sm font-bold">Annuler</button><button type="submit" disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-ink px-5 text-sm font-black text-white disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin"/> : <Check size={15}/>} Enregistrer</button></div></form></div></div>}

    {viewing && <div className="fixed inset-0 z-[100] grid place-items-end bg-pm-ink/50 sm:p-4 md:place-items-center" role="dialog" aria-modal="true"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-pm-coral">Fiche dossier</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{displayTitle(viewing, primaryKey)}</h2></div><button type="button" onClick={() => setViewing(null)} className="grid h-10 w-10 place-items-center rounded-full border border-pm-ink/12" aria-label="Fermer"><X size={18}/></button></div><dl className="mt-6 grid gap-3 sm:grid-cols-2">{fields.filter((field) => viewing[field.name] !== undefined).map((field) => <div key={field.name} className={`min-w-0 rounded-xl bg-pm-ivory p-3 ${field.wide || field.type === 'json' ? 'sm:col-span-2' : ''}`}><dt className="text-[9px] font-black uppercase tracking-[.08em] text-pm-wine/50">{field.label}</dt><dd className="mt-2 break-words text-sm leading-6 text-pm-ink/70">{field.type === 'json' || typeof viewing[field.name] === 'object' ? <StructuredDataPreview value={viewing[field.name]} /> : compactValue(viewing[field.name], field.name)}</dd></div>)}</dl><div className="mt-6 flex justify-end"><button type="button" onClick={() => { const row = viewing; setViewing(null); openEdit(row); }} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-ink px-5 text-xs font-black uppercase tracking-[.06em] text-white"><Pencil size={14}/> Modifier</button></div></div></div>}

    {deleting && <div className="fixed inset-0 z-[110] grid place-items-center bg-pm-ink/55 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.7rem] bg-white p-6 shadow-2xl"><p className="text-[9px] font-black uppercase tracking-[.15em] text-red-600">Suppression</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Supprimer ce dossier ?</h2><p className="mt-3 text-sm leading-6 text-pm-ink/55">{displayTitle(deleting, primaryKey)} sera supprimé de Supabase. Cette action ne peut pas être annulée.</p>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setDeleting(null)} className="min-h-10 rounded-full border border-pm-ink/12 px-4 text-sm font-bold">Annuler</button><button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin"/> : <Trash2 size={15}/>} Supprimer</button></div></div></div>}
  </section>;
}
