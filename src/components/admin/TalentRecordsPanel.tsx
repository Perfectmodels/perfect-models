'use client';

import { useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import ImgBBMultiUploader from '@/components/ImgBBMultiUploader';
import ImgBBUploader from '@/components/ImgBBUploader';
import type { CrudField } from '@/lib/resource-registry';
import { formatDate, formatMoney, formatStatus, statusTone } from '@/lib/admin-formatters';

type Row = Record<string, unknown>;
type FormValue = string | boolean;

type Props = {
  resource: string;
  title: string;
  description?: string;
  rows: Row[];
  fields: readonly CrudField[];
  columns: readonly string[];
  fixedValues: Record<string, unknown>;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  createLabel?: string;
  emptyLabel?: string;
  maxVisible?: number;
  autoEdit?: boolean;
  entityLabel?: string;
};

const IMAGE_LIST_FIELDS = new Set(['images', 'photos', 'gallery_images']);
function isImageUrlField(name:string){return /(^|_)(image|photo|logo|avatar|thumbnail)_url$/i.test(name)||['image_url','cover_image_url','logo_url'].includes(name);}

function dateInput(value: unknown, includeTime: boolean) {
  if (!value) return '';
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  if (!includeTime) return parsed.toISOString().slice(0, 10);
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formValue(field: CrudField, value: unknown): FormValue {
  const resolved = value ?? field.defaultValue ?? (field.type === 'boolean' ? false : '');
  if (field.type === 'boolean') return Boolean(resolved);
  if (field.type === 'date') return dateInput(resolved, false);
  if (field.type === 'datetime-local') return dateInput(resolved, true);
  if (field.type === 'tags' || field.type === 'number-list') return Array.isArray(resolved) ? resolved.join(', ') : String(resolved || '');
  if (field.type === 'json') return typeof resolved === 'string' ? resolved : JSON.stringify(resolved);
  return String(resolved ?? '');
}

function formValues(fields: readonly CrudField[], row?: Row) {
  return fields.reduce<Record<string, FormValue>>((values, field) => {
    values[field.name] = formValue(field, row?.[field.name]);
    return values;
  }, {});
}

function rowTitle(row: Row, fields: readonly CrudField[]) {
  if (row.first_name || row.last_name) return [row.first_name, row.last_name].filter(Boolean).join(' ');
  for (const key of ['title', 'name', 'subject', 'quote_number', 'invoice_number', 'campaign', 'collaborator_name', 'project_title', 'reference']) {
    if (row[key]) return String(row[key]);
  }
  for (const key of ['model_id', 'invoice_id', 'selection_id', 'casting_id', 'booking_id', 'client_id', 'transaction_type']) {
    const field=fields.find((candidate)=>candidate.name===key);
    const resolved=optionLabel(field,row[key]);
    if(resolved)return resolved;
  }
  if(row.status&&row.starts_at)return `${formatStatus(row.status)} · ${formatDate(row.starts_at)}`;
  if(row.status)return formatStatus(row.status);
  return 'Dossier';
}

function optionLabel(field: CrudField | undefined, value: unknown) {
  return field?.options?.find((option) => String(option.value) === String(value))?.label || '';
}

function displayValue(row: Row, column: string, fields: readonly CrudField[]) {
  const value = row[column];
  const field = fields.find((candidate) => candidate.name === column);
  const option = optionLabel(field, value);
  if (option) return option;
  if (value === null || value === undefined || value === '') return '—';
  if (column.endsWith('_id')) return 'Dossier lié indisponible';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (field?.type === 'date' || field?.type === 'datetime-local' || column.endsWith('_at') || column.endsWith('_on')) return formatDate(value, field?.type === 'datetime-local');
  if (column.endsWith('_rate')) return `${value} %`;
  if (field?.type === 'number' && /(amount|fee|budget|income|expense|total)/i.test(column)) return formatMoney(value, String(row.currency || 'XAF'));
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  if (typeof value === 'object') return `${Object.keys(value as object).length} élément(s)`;
  return String(value);
}

export default function TalentRecordsPanel({
  resource, title, description, rows: initialRows, fields, columns, fixedValues,
  canCreate = true, canEdit = true, canDelete = false, createLabel = 'Ajouter', emptyLabel = 'Aucun dossier.', maxVisible = 8, autoEdit = false,
  entityLabel = 'talent',
}: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [editor, setEditor] = useState<{ mode:'create'|'edit'; row?:Row } | null>(() => autoEdit && initialRows[0] ? { mode:'edit', row:initialRows[0] } : null);
  const [values, setValues] = useState<Record<string, FormValue>>(() => autoEdit && initialRows[0] ? formValues(fields, initialRows[0]) : {});
  const [viewing, setViewing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const formId = useId();
  const visibleRows = expanded ? rows : rows.slice(0, maxVisible);
  const visibleColumns = useMemo(() => columns.filter((column) => !Object.prototype.hasOwnProperty.call(fixedValues, column)).slice(0, 5), [columns, fixedValues]);

  function openCreate() {
    setValues(formValues(fields));
    setEditor({ mode:'create' });
    setError('');
    setNotice('');
  }

  function openEdit(row: Row) {
    setValues(formValues(fields, row));
    setEditor({ mode:'edit', row });
    setError('');
    setNotice('');
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      for (const field of fields) {
        const value = values[field.name];
        if (field.required && (value === undefined || value === null || String(value).trim() === '')) throw new Error(`${field.label} est obligatoire.`);
      }
      const creating = editor.mode === 'create';
      const id = editor.row?.id;
      const endpoint = creating ? `/api/admin/resources/${encodeURIComponent(resource)}` : `/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`;
      const response = await fetch(endpoint, {
        method: creating ? 'POST' : 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ ...values, ...fixedValues }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Enregistrement impossible.');
      if (creating) setRows((current) => [payload.data, ...current]);
      else setRows((current) => current.map((row) => String(row.id) === String(payload.data?.id) ? payload.data : row));
      setEditor(null);
      setNotice(creating ? `Dossier ajouté à cette fiche ${entityLabel}.` : 'Dossier mis à jour.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!deleting?.id) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/resources/${encodeURIComponent(resource)}/${encodeURIComponent(String(deleting.id))}`, { method:'DELETE', credentials:'include' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Suppression impossible.');
      setRows((current) => current.filter((row) => String(row.id) !== String(deleting.id)));
      setDeleting(null);
      setNotice('Dossier supprimé.');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Suppression impossible.');
    } finally {
      setBusy(false);
    }
  }

  return <section className="rounded-[1.6rem] border border-pm-ink/[.08] bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="control-kicker">{rows.length} dossier{rows.length !== 1 ? 's' : ''}</p><h3 className="mt-1 font-playfair text-2xl font-semibold">{title}</h3>{description && <p className="mt-1 max-w-2xl text-xs leading-5 text-pm-ink/45">{description}</p>}</div>
      {canCreate && <button type="button" onClick={openCreate} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-ink px-4 text-[10px] font-black uppercase tracking-[.07em] text-white"><Plus size={14}/>{createLabel}</button>}
    </div>
    {notice && <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900"><CheckCircle2 size={14}/>{notice}</p>}
    {error && !editor && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900">{error}</p>}
    <div className="mt-4 grid gap-2">
      {visibleRows.map((row) => <article key={String(row.id)} className="rounded-2xl bg-pm-ivory/75 p-3">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="truncate text-sm font-black">{rowTitle(row,fields)}</h4><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{visibleColumns.filter((column) => !['title','name','campaign','collaborator_name','project_title'].includes(column)).slice(0,4).map((column) => <div key={column} className="max-w-52"><p className="text-[8px] font-black uppercase tracking-[.06em] text-pm-ink/30">{fields.find((field) => field.name === column)?.label || column.replace(/_/g,' ')}</p><p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-pm-ink/65">{displayValue(row,column,fields)}</p></div>)}</div></div>{Boolean(row.status) && <span className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[.06em] ${statusTone(row.status)}`}>{formatStatus(row.status)}</span>}</div>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setViewing(row)} className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-pm-ink/10 bg-white px-3 text-[9px] font-black uppercase tracking-[.05em]"><Eye size={12}/>Consulter</button>{canEdit && <button type="button" onClick={() => openEdit(row)} className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-pm-ink/10 bg-white px-3 text-[9px] font-black uppercase tracking-[.05em]"><Pencil size={12}/>Modifier</button>}{canDelete && <button type="button" onClick={() => setDeleting(row)} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-rose-50 px-3 text-[9px] font-black uppercase tracking-[.05em] text-rose-800"><Trash2 size={12}/>Supprimer</button>}</div>
      </article>)}
      {!rows.length && <p className="rounded-2xl bg-pm-ivory/70 p-5 text-center text-sm text-pm-ink/40">{emptyLabel}</p>}
    </div>
    {rows.length > maxVisible && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-3 w-full rounded-xl border border-pm-ink/10 py-2 text-xs font-black text-pm-coral">{expanded ? 'Réduire la liste' : `Afficher les ${rows.length} dossiers`}</button>}

    {editor && <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-pm-ink/65 p-3 sm:p-6" role="dialog" aria-modal="true"><form onSubmit={save} className="my-auto w-full max-w-3xl rounded-[1.8rem] bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="control-kicker">{editor.mode === 'create' ? 'Nouveau dossier' : 'Modification'}</p><h3 className="mt-1 font-playfair text-3xl font-semibold">{title}</h3></div><button type="button" disabled={busy} onClick={() => setEditor(null)} className="grid h-10 w-10 place-items-center rounded-full bg-pm-ivory"><X size={17}/></button></div>{error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">{error}</p>}<div className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map((field) => <Field key={field.name} id={`${formId}-${field.name}`} field={field} value={values[field.name]} onChange={(value) => setValues((current) => ({ ...current, [field.name]:value }))}/>)}</div><div className="mt-7 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setEditor(null)} className="min-h-11 rounded-full border border-pm-ink/10 px-5 text-sm font-bold">Annuler</button><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-wine px-6 text-sm font-black text-white disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin"/>}Enregistrer</button></div></form></div>}

    {viewing && <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-pm-ink/65 p-3 sm:p-6" role="dialog" aria-modal="true"><div className="my-auto w-full max-w-2xl rounded-[1.8rem] bg-white p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="control-kicker">Dossier {entityLabel}</p><h3 className="mt-1 font-playfair text-3xl font-semibold">{rowTitle(viewing,fields)}</h3></div><button type="button" onClick={() => setViewing(null)} className="grid h-10 w-10 place-items-center rounded-full bg-pm-ivory"><X size={17}/></button></div><dl className="mt-6 grid gap-3 sm:grid-cols-2">{fields.map((field) => <div key={field.name} className={`rounded-xl bg-pm-ivory p-3 ${field.wide ? 'sm:col-span-2' : ''}`}><dt className="text-[9px] font-black uppercase tracking-[.07em] text-pm-ink/35">{field.label}</dt><dd className="mt-1 break-words text-sm font-semibold">{displayValue(viewing,field.name,fields)}</dd></div>)}</dl></div></div>}

    {deleting && <div className="fixed inset-0 z-[140] grid place-items-center bg-pm-ink/65 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.8rem] bg-white p-6 shadow-2xl"><div className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-800"><Trash2 size={19}/></div><h3 className="mt-5 font-playfair text-3xl font-semibold">Supprimer ce dossier ?</h3><p className="mt-3 text-sm leading-6 text-pm-ink/55">{rowTitle(deleting,fields)} sera supprimé définitivement. Cette action est réservée aux éléments qui ne nécessitent pas d’historique.</p><div className="mt-7 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setDeleting(null)} className="min-h-11 rounded-full border border-pm-ink/10 px-5 text-sm font-bold">Annuler</button><button type="button" disabled={busy} onClick={() => void remove()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rose-700 px-5 text-sm font-black text-white disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin"/>}Supprimer</button></div></div></div>}
  </section>;
}

function Field({ id, field, value, onChange }: { id:string; field:CrudField; value:FormValue; onChange:(value:FormValue)=>void }) {
  const inputClass = 'min-h-11 w-full rounded-xl border border-pm-ink/12 bg-pm-ivory px-4 py-3 text-sm outline-none transition focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10';
  const wide = field.wide ? 'sm:col-span-2' : '';
  let input: React.ReactNode;
  if(isImageUrlField(field.name)) input=<div id={id} className="rounded-xl bg-pm-ink p-4 text-white"><ImgBBUploader value={String(value||'')} onChange={onChange} scope={`admin/talents/${field.name}`} compact/></div>;
  else if (field.type === 'boolean') input = <button id={id} type="button" role="switch" aria-checked={Boolean(value)} onClick={() => onChange(!Boolean(value))} className={`${inputClass} flex items-center justify-between font-bold ${value ? 'bg-emerald-50 text-emerald-900' : ''}`}><span>{value ? 'Activé' : 'Désactivé'}</span><span className={`relative h-6 w-11 rounded-full ${value ? 'bg-emerald-600' : 'bg-pm-ink/20'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${value ? 'left-6' : 'left-1'}`}/></span></button>;
  else if (field.type === 'json' && IMAGE_LIST_FIELDS.has(field.name)) {
    let urls:string[]=[]; try { const parsed=JSON.parse(String(value||'[]')); if(Array.isArray(parsed)) urls=parsed.filter((item):item is string=>typeof item==='string'); } catch { urls=[]; }
    input = <div id={id} className="rounded-xl bg-pm-ink p-4 text-white"><ImgBBMultiUploader values={urls} onChange={(next)=>onChange(JSON.stringify(next))} scope={`admin/talents/${field.name}`}/></div>;
  } else if (field.type === 'select' || field.options?.length) input = <select id={id} required={field.required} value={String(value||'')} onChange={(event)=>onChange(event.target.value)} className={inputClass}><option value="">Sélectionner…</option>{(field.options||[]).map((option)=><option key={option.value} value={option.value}>{option.label}</option>)}</select>;
  else if (field.type === 'textarea') input = <textarea id={id} required={field.required} value={String(value||'')} onChange={(event)=>onChange(event.target.value)} rows={5} className={`${inputClass} resize-y leading-6`}/>;
  else if (field.type === 'json') input = <p className="rounded-xl bg-pm-ivory p-4 text-xs text-pm-ink/45">Cette donnée structurée se gère depuis son module spécialisé.</p>;
  else input = <input id={id} type={field.type === 'tags' || field.type === 'number-list' ? 'text' : field.type} required={field.required} value={String(value||'')} min={field.min} max={field.max} step={field.step} placeholder={field.type === 'tags' ? 'Valeurs séparées par des virgules' : field.placeholder} onChange={(event)=>onChange(event.target.value)} className={inputClass}/>;
  return <label className={wide}><span className="mb-2 block text-[9px] font-black uppercase tracking-[.1em] text-pm-ink/45">{field.label}{field.required ? ' *' : ''}</span>{input}{field.help && <span className="mt-1 block text-[10px] leading-4 text-pm-ink/35">{field.help}</span>}</label>;
}
