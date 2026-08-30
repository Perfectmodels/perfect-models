'use client';

import { Plus, Trash2 } from 'lucide-react';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type Props = {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  resource?: string;
  context?: Record<string, string | boolean>;
};

const PERMISSIONS: Record<string, string> = {
  models: 'Mannequins', bookings: 'Bookings', payments: 'Paiements', absences: 'Absences',
  castingApplications: 'Candidatures casting', castingResults: 'Résultats casting',
  artisticDirection: 'Direction artistique', classroom: 'Classroom', classroomProgress: 'Progression Classroom',
  liveChat: 'Messagerie Classroom', magazine: 'Magazine', mediaLibrary: 'Médiathèque', mailing: 'Mailing',
  messages: 'Messagerie', comments: 'Commentaires', recovery: 'Récupération', agency: 'Agence',
  fashionDayApplications: 'Candidatures Fashion Day', fashionDayEvents: 'Perfect Fashion Day', beautyContests: 'Concours',
};

const LABELS: Record<string, string> = {
  p1: 'Paragraphe 1', p2: 'Paragraphe 2', title: 'Titre', subtitle: 'Sous-titre', description: 'Description',
  text: 'Texte', image: 'Image', imageUrl: 'Image', photo: 'Photo', logo: 'Logo', name: 'Nom', role: 'Rôle', quote: 'Témoignage',
  email: 'E-mail', phone: 'Téléphone', address: 'Adresse', notificationEmail: 'E-mail de notification',
  cta: 'Appel à l’action', ctaPrimary: 'Bouton principal', ctaSecondary: 'Bouton secondaire', ctaLink: 'Lien du bouton',
  show: 'Afficher', isActive: 'Actif', order: 'Ordre', status: 'Statut', votes: 'Votes', bio: 'Biographie', slug: 'Identifiant URL',
  question: 'Question', answer: 'Réponse', category: 'Catégorie', items: 'Éléments', values: 'Valeurs', points: 'Points', tags: 'Mots-clés',
  hero: 'Bannière principale', introduction: 'Introduction', stats: 'Statistiques', about: 'À propos',
  heroSlides: 'Slides', candidates: 'Candidates', startedAt: 'Début', updatedAt: 'Mise à jour', lastAccessedAt: 'Dernier accès',
  chapterIndex: 'Chapitre actuel', completedChapters: 'Chapitres terminés', quizScores: 'Scores quiz', chapterActivity: 'Activité des chapitres',
  totalTimeSpentSeconds: 'Temps total', readingSeconds: 'Temps de lecture', readProgress: 'Lecture', readingValidated: 'Lecture validée',
  integrityIncidents: 'Incidents d’intégrité', attempts: 'Tentatives', score: 'Score', total: 'Total', passed: 'Réussi',
  moduleId: 'Module', modelName: 'Mannequin', profileId: 'Profil', completedAt: 'Terminé', openedAt: 'Ouvert', lastReadAt: 'Dernière lecture',
};

const SOCIALS = [
  ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'], ['whatsapp', 'WhatsApp'], ['website', 'Site web'],
] as const;

const MEASUREMENTS = [
  ['height', 'Taille'], ['chest', 'Poitrine'], ['waist', 'Tour de taille'], ['hips', 'Hanches'],
  ['shoeSize', 'Pointure'], ['shoulders', 'Épaules'],
] as const;

function parse(value: string): JsonValue {
  if (!value.trim()) return {};
  try { return JSON.parse(value) as JsonValue; } catch { return {}; }
}

function commit(onChange: Props['onChange'], value: JsonValue) {
  onChange(JSON.stringify(value));
}

function label(key: string) {
  return LABELS[key] || PERMISSIONS[key] || key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}

function valueText(value: JsonValue | undefined) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value);
}

function blankLike(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, blankLike(item)]));
  }
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return 0;
  return '';
}

function normalizePrimitive(original: JsonValue, raw: string): JsonValue {
  if (typeof original === 'number') {
    const number = Number(raw.replace(',', '.'));
    return Number.isFinite(number) ? number : 0;
  }
  return raw;
}

function PrimitiveEditor({ fieldKey, value, onChange, disabled }: { fieldKey: string; value: JsonValue; onChange: (value: JsonValue) => void; disabled?: boolean }) {
  if (typeof value === 'boolean') {
    return <button type="button" role="switch" aria-checked={value} disabled={disabled} onClick={() => onChange(!value)} className={`flex min-h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${value ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-pm-ink/12 bg-white text-pm-ink/55'} disabled:opacity-55`}><span>{value ? 'Oui' : 'Non'}</span><span aria-hidden="true" className={`relative h-5 w-9 rounded-full ${value ? 'bg-emerald-600' : 'bg-pm-ink/15'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${value ? 'left-[18px]' : 'left-0.5'}`} /></span></button>;
  }
  const longText = ['description','text','quote','answer','bio','p1','p2'].includes(fieldKey) || (typeof value === 'string' && value.length > 100);
  const type = /email/i.test(fieldKey) ? 'email' : /(?:url|image|photo|logo|link)/i.test(fieldKey) ? 'url' : typeof value === 'number' ? 'number' : 'text';
  const common = `min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:opacity-55`;
  if (longText) return <textarea disabled={disabled} rows={3} value={valueText(value)} onChange={(event) => onChange(event.target.value)} className={`${common} resize-y leading-6`} />;
  return <input disabled={disabled} type={type} step={typeof value === 'number' ? 'any' : undefined} value={valueText(value)} onChange={(event) => onChange(normalizePrimitive(value, event.target.value))} className={common} />;
}

function RecursiveEditor({ value, onChange, disabled, depth = 0, fieldKey = 'value' }: { value: JsonValue; onChange: (value: JsonValue) => void; disabled?: boolean; depth?: number; fieldKey?: string }) {
  if (value === null || typeof value !== 'object') return <PrimitiveEditor fieldKey={fieldKey} value={value ?? ''} onChange={onChange} disabled={disabled} />;

  if (Array.isArray(value)) {
    return <div className="space-y-2.5">
      {value.map((item, index) => {
        const nested = item !== null && typeof item === 'object';
        return <div key={index} className="rounded-xl border border-pm-ink/10 bg-pm-ivory/55 p-3">
          <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.08em] text-pm-wine/55">Élément {index + 1}</p><button type="button" disabled={disabled} onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-45" aria-label={`Retirer l’élément ${index + 1}`}><Trash2 size={14}/></button></div>
          {nested ? <details className="mt-2" open={depth < 1}><summary className="cursor-pointer select-none text-xs font-bold text-pm-ink/55">Afficher les informations</summary><div className="mt-3"><RecursiveEditor value={item} onChange={(next) => { const copy = [...value]; copy[index] = next; onChange(copy); }} disabled={disabled} depth={depth + 1} fieldKey={`${fieldKey}.${index}`} /></div></details> : <div className="mt-2"><RecursiveEditor value={item} onChange={(next) => { const copy = [...value]; copy[index] = next; onChange(copy); }} disabled={disabled} depth={depth + 1} fieldKey={`${fieldKey}.${index}`} /></div>}
        </div>;
      })}
      <button type="button" disabled={disabled} onClick={() => onChange([...value, value.length ? blankLike(value[0]) : ''])} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pm-ink/15 bg-white px-4 text-xs font-black uppercase tracking-[.06em] text-pm-wine disabled:opacity-45"><Plus size={14}/> Ajouter un élément</button>
    </div>;
  }

  const entries = Object.entries(value);
  return <div className="space-y-3">
    {entries.map(([key, item]) => {
      const nested = item !== null && typeof item === 'object';
      if (nested) return <details key={key} className="rounded-xl border border-pm-ink/10 bg-white p-3" open={depth === 0 && entries.length <= 4}><summary className="cursor-pointer select-none text-xs font-black uppercase tracking-[.06em] text-pm-wine">{label(key)} <span className="ml-1 font-medium normal-case tracking-normal text-pm-ink/35">{Array.isArray(item) ? `· ${item.length} élément${item.length > 1 ? 's' : ''}` : `· ${Object.keys(item).length} champs`}</span></summary><div className="mt-3"><RecursiveEditor value={item} onChange={(next) => onChange({ ...value, [key]: next })} disabled={disabled} depth={depth + 1} fieldKey={key} /></div></details>;
      return <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-pm-ink/55">{label(key)}</span><PrimitiveEditor fieldKey={key} value={item} onChange={(next) => onChange({ ...value, [key]: next })} disabled={disabled} /></label>;
    })}
    {depth <= 1 && <button type="button" disabled={disabled} onClick={() => { let index = entries.length + 1; let key = `champ_${index}`; while (Object.prototype.hasOwnProperty.call(value, key)) { index += 1; key = `champ_${index}`; } onChange({ ...value, [key]: '' }); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-pm-ink/15 bg-white px-4 text-xs font-black uppercase tracking-[.06em] text-pm-wine disabled:opacity-45"><Plus size={14}/> Ajouter un champ</button>}
  </div>;
}

function MeasurementEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, JsonValue> : {};
  return <div className="grid gap-3 sm:grid-cols-2">
    {MEASUREMENTS.map(([key, fieldLabel]) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-pm-ink/60">{fieldLabel}</span><input disabled={disabled} value={valueText(data[key])} onChange={(event) => commit(onChange, { ...data, [key]: event.target.value })} className="min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:opacity-55" /></label>)}
  </div>;
}

function SocialEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, JsonValue> : {};
  const extras = Object.keys(data).filter((key) => !SOCIALS.some(([known]) => known === key));
  return <div className="grid gap-3 sm:grid-cols-2">
    {[...SOCIALS.map(([key, fieldLabel]) => ({ key, fieldLabel })), ...extras.map((key) => ({ key, fieldLabel: label(key) }))].map(({ key, fieldLabel }) => <label key={key} className="block"><span className="mb-1.5 block text-xs font-bold text-pm-ink/60">{fieldLabel}</span><input disabled={disabled} type="url" value={valueText(data[key])} placeholder="https://…" onChange={(event) => commit(onChange, { ...data, [key]: event.target.value.trim() })} className="min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10 disabled:opacity-55" /></label>)}
  </div>;
}

function PermissionEditor({ value, onChange, disabled }: Props) {
  const current = parse(value);
  const data = current && typeof current === 'object' && !Array.isArray(current) ? current as Record<string, JsonValue> : {};
  const keys = [...new Set([...Object.keys(PERMISSIONS), ...Object.keys(data)])];
  return <div className="grid gap-2 sm:grid-cols-2">
    {keys.map((key) => { const enabled = Boolean(data[key]); return <button key={key} type="button" disabled={disabled} aria-pressed={enabled} onClick={() => commit(onChange, { ...data, [key]: !enabled })} className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm font-semibold transition ${enabled ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-pm-ink/12 bg-white text-pm-ink/55'} disabled:opacity-55`}><span>{label(key)}</span><span className={`relative h-5 w-9 rounded-full ${enabled ? 'bg-emerald-600' : 'bg-pm-ink/15'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${enabled ? 'left-[18px]' : 'left-0.5'}`} /></span></button>; })}
  </div>;
}

function secondsLabel(seconds: number) {
  const safe = Math.max(0, Math.round(seconds || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

function ProgressViewer({ value }: { value: string }) {
  const parsed = parse(value);
  const modules = (Array.isArray(parsed) ? parsed : [parsed]).filter((item): item is Record<string, JsonValue> => Boolean(item && typeof item === 'object' && !Array.isArray(item)));
  const completed = modules.reduce((sum, item) => sum + (Array.isArray(item.completedChapters) ? item.completedChapters.length : 0), 0);
  const quiz = modules.flatMap((item) => Array.isArray(item.quizScores) ? item.quizScores.filter((score): score is Record<string, JsonValue> => Boolean(score && typeof score === 'object' && !Array.isArray(score))) : []);
  const passed = quiz.filter((score) => Boolean(score.passed)).length;
  const time = modules.reduce((sum, item) => sum + Number(item.totalTimeSpentSeconds || 0), 0);
  return <div className="space-y-3"><div className="grid gap-2 sm:grid-cols-4"><div className="rounded-xl bg-pm-mint p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-pm-teal">Modules</p><p className="mt-1 font-playfair text-2xl font-semibold">{modules.length}</p></div><div className="rounded-xl bg-pm-peach p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-pm-wine">Chapitres terminés</p><p className="mt-1 font-playfair text-2xl font-semibold">{completed}</p></div><div className="rounded-xl bg-pm-gold-light/60 p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-pm-ink/55">Quiz réussis</p><p className="mt-1 font-playfair text-2xl font-semibold">{passed}/{quiz.length}</p></div><div className="rounded-xl bg-pm-sky p-3"><p className="text-[9px] font-black uppercase tracking-[.08em] text-pm-ink/55">Temps de travail</p><p className="mt-1 font-playfair text-xl font-semibold">{secondsLabel(time)}</p></div></div>{modules.map((module, index) => <details key={index} className="rounded-xl border border-pm-ink/10 bg-white p-3"><summary className="cursor-pointer text-sm font-bold">Module {String(module.moduleId || index + 1)} {module.modelName ? `· ${String(module.modelName)}` : ''}</summary><div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-lg bg-pm-ivory p-2.5 text-xs"><strong>Chapitre actuel</strong><br/>{String(Number(module.chapterIndex || 0) + 1)}</div><div className="rounded-lg bg-pm-ivory p-2.5 text-xs"><strong>Dernier accès</strong><br/>{module.lastAccessedAt ? new Date(String(module.lastAccessedAt)).toLocaleString('fr-FR') : '—'}</div><div className="rounded-lg bg-pm-ivory p-2.5 text-xs"><strong>Temps</strong><br/>{secondsLabel(Number(module.totalTimeSpentSeconds || 0))}</div></div></details>)}</div>;
}

function ContestConfigurationEditor({ value, onChange, disabled }: Props) {
  const parsed = parse(value);
  const root = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, JsonValue> : {};
  const candidatesValue = root.candidates;
  const candidates = candidatesValue && typeof candidatesValue === 'object' && !Array.isArray(candidatesValue) ? candidatesValue as Record<string, JsonValue> : {};
  const updateCandidate = (key: string, next: JsonValue) => commit(onChange, { ...root, candidates: { ...candidates, [key]: next } });
  const removeCandidate = (key: string) => { const next = { ...candidates }; delete next[key]; commit(onChange, { ...root, candidates: next }); };
  return <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black">Candidates du concours</p><p className="text-xs text-pm-ink/45">{Object.keys(candidates).length} candidate{Object.keys(candidates).length > 1 ? 's' : ''}</p></div><button type="button" disabled={disabled} onClick={() => { let index = Object.keys(candidates).length + 1; let key = `candidate-${index}`; while (candidates[key]) { index += 1; key = `candidate-${index}`; } commit(onChange, { ...root, candidates: { ...candidates, [key]: { name: '', slug: key, bio: '', photo: '', order: index, votes: 0, status: 'active' } } }); }} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-ink px-4 text-xs font-black text-white disabled:opacity-45"><Plus size={14}/> Ajouter une candidate</button></div>{Object.entries(candidates).map(([key, candidate], index) => <details key={key} className="rounded-xl border border-pm-ink/10 bg-white p-3" open={index === 0}><summary className="cursor-pointer select-none text-sm font-bold">{candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? String((candidate as Record<string, JsonValue>).name || `Candidate ${index + 1}`) : `Candidate ${index + 1}`}</summary><div className="mt-3"><RecursiveEditor value={candidate} onChange={(next) => updateCandidate(key, next)} disabled={disabled} depth={1} fieldKey={key}/><button type="button" disabled={disabled} onClick={() => removeCandidate(key)} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-red-50 px-3 text-xs font-bold text-red-700"><Trash2 size={13}/> Retirer la candidate</button></div></details>)}</div>;
}

export default function StructuredDataField(props: Props) {
  if (props.fieldName === 'measurements') return <MeasurementEditor {...props} />;
  if (props.fieldName === 'social_links') return <SocialEditor {...props} />;
  if (props.fieldName === 'permissions') return <PermissionEditor {...props} />;
  if (props.fieldName === 'progress') return <ProgressViewer value={props.value} />;
  if (props.fieldName === 'configuration' && props.resource === 'beauty-contests') return <ContestConfigurationEditor {...props} />;
  const current = parse(props.value);
  return <RecursiveEditor value={current} onChange={(next) => commit(props.onChange, next)} disabled={props.disabled} fieldKey={props.fieldName} />;
}

function PreviewValue({ value, depth = 0 }: { value: JsonValue; depth?: number }) {
  if (value === null || value === '') return <span className="text-pm-ink/35">—</span>;
  if (typeof value === 'boolean') return <span>{value ? 'Oui' : 'Non'}</span>;
  if (typeof value === 'number' || typeof value === 'string') return <span className="break-words">{String(value)}</span>;
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-pm-ink/35">Aucun élément</span>;
    if (depth > 1) return <span>{value.length} élément{value.length > 1 ? 's' : ''}</span>;
    return <div className="space-y-1.5">{value.slice(0, 8).map((item, index) => <div key={index} className="rounded-lg bg-white/70 px-2.5 py-2"><PreviewValue value={item} depth={depth + 1}/></div>)}{value.length > 8 && <p className="text-xs text-pm-ink/40">+ {value.length - 8} autres éléments</p>}</div>;
  }
  const entries = Object.entries(value);
  if (!entries.length) return <span className="text-pm-ink/35">Aucune donnée</span>;
  return <div className="grid gap-2 sm:grid-cols-2">{entries.slice(0, 12).map(([key, item]) => <div key={key} className="min-w-0 rounded-lg bg-white/70 px-2.5 py-2"><p className="text-[9px] font-black uppercase tracking-[.06em] text-pm-wine/55">{label(key)}</p><div className="mt-1 text-sm text-pm-ink/70"><PreviewValue value={item} depth={depth + 1}/></div></div>)}</div>;
}

export function StructuredDataPreview({ value, fieldName }: { value: unknown; fieldName?: string }) {
  const normalized: JsonValue = value === undefined ? null : value as JsonValue;
  if (fieldName === 'progress') return <ProgressViewer value={JSON.stringify(normalized)} />;
  return <PreviewValue value={normalized}/>;
}
