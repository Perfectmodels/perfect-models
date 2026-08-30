'use client';

import { Plus, Trash2 } from 'lucide-react';

type Props = {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const PERMISSIONS: Record<string, string> = {
  models: 'Mannequins', bookings: 'Bookings', payments: 'Paiements', absences: 'Absences',
  castingApplications: 'Candidatures casting', castingResults: 'Résultats casting',
  artisticDirection: 'Direction artistique', classroom: 'Classroom', classroomProgress: 'Progression Classroom',
  liveChat: 'Messagerie Classroom', magazine: 'Magazine', mediaLibrary: 'Médiathèque', mailing: 'Mailing',
  messages: 'Messagerie', comments: 'Commentaires', recovery: 'Récupération', agency: 'Agence',
  fashionDayApplications: 'Candidatures Fashion Day', fashionDayEvents: 'Perfect Fashion Day', beautyContests: 'Concours',
};

const SOCIALS = [
  ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'], ['whatsapp', 'WhatsApp'], ['website', 'Site web'],
] as const;

const MEASUREMENTS = [
  ['height', 'Taille'], ['chest', 'Poitrine'], ['waist', 'Tour de taille'], ['hips', 'Hanches'],
  ['shoeSize', 'Pointure'], ['shoulders', 'Épaules'],
] as const;

function parse(value: string): unknown {
  if (!value.trim()) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

function text(value: unknown) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function scalar(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(?:[.,]\d+)?$/.test(trimmed)) return Number(trimmed.replace(',', '.'));
  return trimmed;
}

function commit(onChange: Props['onChange'], value: unknown) {
  onChange(JSON.stringify(value));
}

function MeasurementEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, unknown> : {};
  return <div className="grid gap-3 sm:grid-cols-2">
    {MEASUREMENTS.map(([key, label]) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-pm-ink/60">{label}</span><input disabled={disabled} value={text(data[key])} onChange={(event) => commit(onChange, { ...data, [key]: scalar(event.target.value) })} className="min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:opacity-55" /></label>)}
  </div>;
}

function SocialEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, unknown> : {};
  const extras = Object.keys(data).filter((key) => !SOCIALS.some(([known]) => known === key));
  return <div className="grid gap-3 sm:grid-cols-2">
    {[...SOCIALS.map(([key, label]) => ({ key, label })), ...extras.map((key) => ({ key, label: key }))].map(({ key, label }) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-pm-ink/60">{label}</span><input disabled={disabled} type="url" value={text(data[key])} placeholder="https://…" onChange={(event) => commit(onChange, { ...data, [key]: event.target.value.trim() })} className="min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:opacity-55" /></label>)}
  </div>;
}

function PermissionEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, unknown> : {};
  const keys = [...new Set([...Object.keys(PERMISSIONS), ...Object.keys(data)])];
  return <div className="grid gap-2 sm:grid-cols-2">
    {keys.map((key) => { const enabled = Boolean(data[key]); return <button key={key} type="button" disabled={disabled} aria-pressed={enabled} onClick={() => commit(onChange, { ...data, [key]: !enabled })} className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm font-semibold transition ${enabled ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-pm-ink/12 bg-white text-pm-ink/55'} disabled:opacity-55`}><span>{PERMISSIONS[key] || key.replace(/([A-Z])/g, ' $1')}</span><span className={`h-5 w-9 rounded-full p-0.5 ${enabled ? 'bg-emerald-600' : 'bg-pm-ink/15'}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${enabled ? 'translate-x-4' : ''}`} /></span></button>; })}
  </div>;
}

function ArrayEditor({ fieldName, value, onChange, disabled }: Props) {
  const current = parse(value);
  const items = Array.isArray(current) ? current : [];
  const update = (index: number, next: string) => {
    const copy = [...items];
    const existing = copy[index];
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) copy[index] = { ...(existing as Record<string, unknown>), url: next };
    else copy[index] = next;
    commit(onChange, copy);
  };
  const label = fieldName === 'attachments' ? 'Pièce jointe' : fieldName === 'photos' ? 'Photo' : 'Image';
  return <div className="space-y-2">
    {items.map((item, index) => {
      const display = item && typeof item === 'object' && !Array.isArray(item) ? text((item as Record<string, unknown>).url || (item as Record<string, unknown>).pathname || (item as Record<string, unknown>).name) : text(item);
      return <div key={index} className="flex gap-2"><input disabled={disabled} value={display} placeholder={`${label} ${index + 1} · URL`} onChange={(event) => update(index, event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:opacity-55" /><button type="button" disabled={disabled} onClick={() => commit(onChange, items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Retirer ${label.toLowerCase()} ${index + 1}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-700 disabled:opacity-55"><Trash2 size={15} /></button></div>;
    })}
    <button type="button" disabled={disabled} onClick={() => commit(onChange, [...items, ''])} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pm-ink/15 bg-white px-4 text-xs font-black uppercase tracking-[.06em] text-pm-wine disabled:opacity-55"><Plus size={14} /> Ajouter</button>
  </div>;
}

function ObjectEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, unknown> : {};
  const rows = Object.entries(data);
  const rename = (oldKey: string, newKey: string) => {
    const key = newKey.trim(); if (!key || key === oldKey) return;
    const next: Record<string, unknown> = {};
    for (const [entryKey, entryValue] of rows) next[entryKey === oldKey ? key : entryKey] = entryValue;
    commit(onChange, next);
  };
  return <div className="space-y-2">
    {rows.map(([key, item]) => <div key={key} className="grid gap-2 sm:grid-cols-[minmax(120px,.42fr)_1fr_auto]"><input disabled={disabled} defaultValue={key} onBlur={(event) => rename(key, event.target.value)} aria-label="Libellé" className="min-h-11 min-w-0 rounded-xl border border-pm-ink/15 bg-pm-ivory px-3 text-sm font-semibold outline-none focus:border-pm-coral" /><input disabled={disabled} value={text(item)} onChange={(event) => commit(onChange, { ...data, [key]: scalar(event.target.value) })} aria-label={`Valeur de ${key}`} className="min-h-11 min-w-0 rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10" /><button type="button" disabled={disabled} onClick={() => { const next = { ...data }; delete next[key]; commit(onChange, next); }} aria-label={`Retirer ${key}`} className="grid h-11 w-11 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-700"><Trash2 size={15} /></button></div>)}
    <button type="button" disabled={disabled} onClick={() => { let index = rows.length + 1; let key = `champ_${index}`; while (Object.prototype.hasOwnProperty.call(data, key)) { index += 1; key = `champ_${index}`; } commit(onChange, { ...data, [key]: '' }); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pm-ink/15 bg-white px-4 text-xs font-black uppercase tracking-[.06em] text-pm-wine disabled:opacity-55"><Plus size={14} /> Ajouter un champ</button>
  </div>;
}

export default function StructuredDataField(props: Props) {
  if (props.fieldName === 'measurements') return <MeasurementEditor {...props} />;
  if (props.fieldName === 'social_links') return <SocialEditor {...props} />;
  if (props.fieldName === 'permissions') return <PermissionEditor {...props} />;
  if (['photos', 'gallery_images', 'attachments'].includes(props.fieldName)) return <ArrayEditor {...props} />;
  const current = parse(props.value);
  if (Array.isArray(current)) return <ArrayEditor {...props} />;
  return <ObjectEditor {...props} />;
}

export function StructuredDataPreview({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') return <span className="text-pm-ink/35">—</span>;
  if (Array.isArray(value)) return <div className="flex flex-wrap gap-1.5">{value.length ? value.slice(0, 12).map((item, index) => <span key={index} className="rounded-full bg-pm-ivory px-2.5 py-1 text-xs text-pm-ink/60">{typeof item === 'object' ? text((item as Record<string, unknown>).name || (item as Record<string, unknown>).url || `Élément ${index + 1}`) : text(item)}</span>) : <span className="text-pm-ink/35">Aucun élément</span>}</div>;
  if (typeof value === 'object') return <div className="grid gap-2 sm:grid-cols-2">{Object.entries(value as Record<string, unknown>).slice(0, 16).map(([key, item]) => <div key={key} className="rounded-xl bg-pm-ivory px-3 py-2"><p className="text-[9px] font-black uppercase tracking-[.08em] text-pm-wine/55">{PERMISSIONS[key] || key.replace(/_/g, ' ')}</p><p className="mt-1 break-words text-sm text-pm-ink/70">{typeof item === 'boolean' ? (item ? 'Oui' : 'Non') : text(item) || '—'}</p></div>)}</div>;
  return <span>{String(value)}</span>;
}
