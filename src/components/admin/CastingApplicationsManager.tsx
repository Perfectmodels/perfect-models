'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, AtSign, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  Eye, Loader2, Mail, MapPin, Phone, Ruler, Search, ShieldCheck, UserCheck, X,
} from 'lucide-react';

type Row = Record<string, any>;

type Props = {
  initialRows: Row[];
  initialTotal: number;
  canProvision: boolean;
};

const PAGE_SIZE = 20;
const DECISIONS = [
  { label: 'Nouveau', value: 'Nouveau' },
  { label: 'En étude', value: 'En étude' },
  { label: 'Accepté', value: 'Accepté' },
  { label: 'Refusé', value: 'Refusé' },
] as const;

function formatDate(value: unknown, withTime = false) {
  if (!value) return '—';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('fr-FR', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' });
}

function experienceLabel(value: unknown) {
  const key = String(value || '').trim().toLowerCase();
  if (key === 'none') return 'Débutant · aucune expérience';
  if (key === 'beginner') return 'Débutant · quelques expériences';
  if (key === 'intermediate') return 'Intermédiaire';
  if (key === 'professional') return 'Professionnel';
  return String(value || 'Non renseigné');
}

function statusClass(status: unknown) {
  const value = String(status || '').toLowerCase();
  if (value.includes('accept')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (value.includes('refus') || value.includes('reject')) return 'bg-red-50 text-red-700 border-red-200';
  if (value.includes('étude') || value.includes('pending')) return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-pm-peach text-pm-wine border-pm-wine/10';
}

function asObject(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {}
  }
  return {};
}

function photosFor(row: Row) {
  const raw = asObject(row.raw_data);
  let photos: unknown[] = [];
  if (Array.isArray(row.photos)) photos = row.photos;
  else if (typeof row.photos === 'string') {
    try { const parsed = JSON.parse(row.photos); if (Array.isArray(parsed)) photos = parsed; } catch {}
  }
  return [raw.photoPortraitUrl, raw.photoFullBodyUrl, raw.photoProfileUrl, ...photos]
    .filter(Boolean)
    .map(String)
    .filter((url, index, list) => list.indexOf(url) === index)
    .slice(0, 8);
}

function Detail({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return <div className="rounded-2xl border border-pm-ink/[.08] bg-white p-4">
    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-pm-wine/55"><Icon size={14} aria-hidden="true" /> {label}</div>
    <div className="mt-2 break-words text-sm font-semibold leading-6 text-pm-ink/75">{value || '—'}</div>
  </div>;
}

export default function CastingApplicationsManager({ initialRows, initialTotal, canProvision }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const loadRows = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), order: 'desc', sort: 'created_at' });
      if (query.trim()) params.set('q', query.trim());
      if (status) params.set('status', status);
      const response = await fetch(`/api/admin/resources/casting-applications?${params.toString()}`, { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Chargement des candidatures impossible.');
      setRows(Array.isArray(payload.data) ? payload.data : []);
      setTotal(Number(payload.pagination?.total || 0));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement des candidatures impossible.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadRows(); }, query ? 280 : 0);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query, status]);

  const openApplication = (row: Row) => {
    setViewing(row);
    setDecision(String(row.status || 'Nouveau'));
    setNotes(String(row.notes || ''));
    setError('');
    setNotice('');
  };

  const visibleDecisionOptions = useMemo(() => DECISIONS.filter((item) => canProvision || item.value !== 'Accepté' || decision === 'Accepté'), [canProvision, decision]);

  const saveDecision = async () => {
    if (!viewing) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const shouldProvision = decision === 'Accepté' && !viewing.account_provisioned_at;
      if (shouldProvision) {
        if (!canProvision) throw new Error('La validation finale et la création du compte sont réservées à un administrateur.');
        const response = await fetch('/api/admin/casting/provision', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: viewing.id, notes }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Création du compte impossible.');
        setViewing(null);
        setNotice(`Candidature validée. Le compte mannequin a été créé et l’invitation Supabase Auth a été envoyée à ${payload.email || viewing.email}.`);
        await loadRows();
        window.dispatchEvent(new Event('pmm-auth-changed'));
        window.dispatchEvent(new Event('pmm-supabase-data-changed'));
        return;
      }

      const response = await fetch(`/api/admin/resources/casting-applications/${encodeURIComponent(String(viewing.id))}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision, notes }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Décision impossible à enregistrer.');
      setViewing(null);
      setNotice('La décision et la note interne ont été enregistrées.');
      await loadRows();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Action impossible.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="text-pm-ink" aria-busy={loading}>
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-6 overflow-hidden rounded-[2rem] bg-pm-paper shadow-[0_18px_55px_rgba(91,46,37,.07)]">
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-pm-coral"><ShieldCheck size={15} /> Workflow casting · Supabase</div>
            <h1 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">Candidatures casting</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-pm-ink/55">Les informations du candidat proviennent directement du formulaire public et restent en lecture seule. L’administration ne saisit que la décision et une note interne.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            <strong>Validation = compte + invitation.</strong><br />Le candidat choisit son mot de passe depuis le lien sécurisé Supabase.
          </div>
        </div>
        <div className="grid gap-3 border-t border-pm-ink/[.07] bg-white/60 p-4 sm:px-8 lg:grid-cols-[1fr_auto]">
          <label className="relative block"><span className="sr-only">Rechercher une candidature</span><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/35" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Nom, e-mail, téléphone, ville…" className="min-h-12 w-full rounded-full border border-pm-ink/15 bg-pm-ivory py-3 pl-11 pr-5 text-sm outline-none focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10" /></label>
          <label><span className="sr-only">Filtrer par décision</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-h-12 min-w-48 rounded-full border border-pm-ink/15 bg-pm-ivory px-4 text-sm outline-none focus-visible:border-pm-coral"><option value="">Toutes les décisions</option>{DECISIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {notice && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold leading-6 text-emerald-900"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {notice}</div>}
        {error && !viewing && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800"><AlertTriangle size={18} className="mt-0.5 shrink-0" /> {error}</div>}
      </div>

      <div className="relative overflow-hidden rounded-[1.7rem] border border-pm-ink/[.09] bg-white shadow-[0_18px_55px_rgba(91,46,37,.06)]">
        {loading && <div className="absolute inset-x-0 top-0 z-20 h-1 overflow-hidden bg-pm-peach"><span className="block h-full w-full animate-pulse bg-pm-coral motion-reduce:animate-none" /></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <caption className="sr-only">Candidatures casting paginées</caption>
            <thead className="border-b border-pm-ink/10 bg-pm-peach text-[10px] font-extrabold uppercase tracking-[.1em] text-pm-wine"><tr><th className="px-4 py-4">Candidat</th><th className="px-4 py-4">Contact</th><th className="px-4 py-4">Profil</th><th className="px-4 py-4">Expérience</th><th className="px-4 py-4">Décision</th><th className="px-4 py-4">Compte</th><th className="px-4 py-4">Soumis le</th><th className="sticky right-0 bg-pm-peach px-4 py-4 text-right">Action</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={String(row.id)} className="border-b border-pm-ink/[.06] align-middle last:border-0 hover:bg-pm-ivory/70">
              <td className="px-4 py-4"><strong className="block text-pm-ink">{row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Sans nom'}</strong><span className="mt-1 block text-xs text-pm-ink/40">{row.city || 'Ville non renseignée'}</span></td>
              <td className="px-4 py-4"><span className="block text-pm-ink/70">{row.email || '—'}</span><span className="mt-1 block text-xs text-pm-ink/40">{row.phone || '—'}</span></td>
              <td className="px-4 py-4"><span className="block">{row.gender || '—'}</span><span className="mt-1 block text-xs text-pm-ink/45">{row.height_cm ? `${row.height_cm} cm` : 'Taille —'}</span></td>
              <td className="max-w-[210px] px-4 py-4 text-pm-ink/60">{experienceLabel(row.experience)}</td>
              <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-extrabold ${statusClass(row.status)}`}>{row.status || 'Nouveau'}</span></td>
              <td className="px-4 py-4">{row.account_provisioned_at ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700"><UserCheck size={15} /> Créé</span> : <span className="text-xs text-pm-ink/40">Non créé</span>}</td>
              <td className="px-4 py-4 text-pm-ink/55">{formatDate(row.created_at)}</td>
              <td className="sticky right-0 bg-white/95 px-4 py-3 text-right"><button type="button" onClick={() => openApplication(row)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-pm-ink/15 px-4 text-xs font-extrabold text-pm-wine transition hover:bg-pm-peach focus-visible:outline focus-visible:outline-2 focus-visible:outline-pm-coral"><Eye size={16} /> Étudier</button></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!rows.length && !loading && <div className="px-6 py-16 text-center"><p className="font-playfair text-3xl text-pm-ink/45">Aucune candidature à afficher.</p></div>}
        <div className="flex flex-col gap-3 border-t border-pm-ink/[.07] bg-pm-paper px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-pm-ink/50">{total ? ((safePage - 1) * PAGE_SIZE) + 1 : 0}–{Math.min(safePage * PAGE_SIZE, total)} sur {total}</p><nav className="flex items-center gap-2" aria-label="Pagination casting"><button type="button" disabled={safePage <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15 disabled:opacity-35" aria-label="Page précédente"><ChevronLeft size={17} /></button><span className="min-w-28 text-center text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/55">Page {safePage} / {totalPages}</span><button type="button" disabled={safePage >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15 disabled:opacity-35" aria-label="Page suivante"><ChevronRight size={17} /></button></nav></div>
      </div>
    </div>

    {viewing && (() => {
      const raw = asObject(viewing.raw_data);
      const measurements = asObject(viewing.measurements);
      const photos = photosFor(viewing);
      const provisioned = Boolean(viewing.account_provisioned_at);
      const accepting = decision === 'Accepté' && !provisioned;
      return <div className="fixed inset-0 z-[100] flex items-end justify-end bg-pm-ink/55 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="casting-review-title">
        <div className="flex h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[2rem] bg-pm-paper shadow-2xl sm:h-[calc(100vh-2rem)] sm:rounded-[2rem]">
          <div className="flex items-start justify-between gap-5 border-b border-pm-ink/10 px-5 py-5 sm:px-8"><div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-pm-coral">Dossier reçu depuis le formulaire public</p><h2 id="casting-review-title" className="mt-2 font-playfair text-3xl font-semibold sm:text-4xl">{viewing.full_name || `${viewing.first_name || ''} ${viewing.last_name || ''}`.trim()}</h2><p className="mt-2 text-sm text-pm-ink/50">Candidature du {formatDate(viewing.created_at, true)}</p></div><button type="button" disabled={busy} onClick={() => setViewing(null)} className="grid h-11 w-11 place-items-center rounded-full border border-pm-ink/15" aria-label="Fermer"><X size={19} /></button></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Detail icon={AtSign} label="E-mail" value={viewing.email} />
              <Detail icon={Phone} label="Téléphone" value={viewing.phone} />
              <Detail icon={MapPin} label="Ville" value={viewing.city || raw.city} />
              <Detail icon={CalendarDays} label="Naissance" value={`${formatDate(viewing.birth_date || raw.birthDate)}${viewing.age ? ` · ${viewing.age} ans` : ''}`} />
              <Detail icon={UserCheck} label="Genre" value={viewing.gender || raw.gender} />
              <Detail icon={Ruler} label="Taille" value={viewing.height_cm ? `${viewing.height_cm} cm` : '—'} />
              <Detail icon={ShieldCheck} label="Expérience" value={experienceLabel(viewing.experience || raw.experience)} />
              <Detail icon={Mail} label="Compte" value={provisioned ? `Créé le ${formatDate(viewing.account_provisioned_at)}` : 'Pas encore créé'} />
            </div>

            {Object.keys(measurements).length > 0 && <section className="mt-7"><h3 className="text-xs font-extrabold uppercase tracking-[.12em] text-pm-wine">Mensurations reçues</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(measurements).map(([key, value]) => <div key={key} className="rounded-2xl bg-pm-peach px-4 py-3"><span className="block text-[10px] font-extrabold uppercase tracking-[.08em] text-pm-wine/55">{key}</span><strong className="mt-1 block text-base text-pm-ink">{String(value || '—')}</strong></div>)}</div></section>}

            {photos.length > 0 && <section className="mt-7"><h3 className="text-xs font-extrabold uppercase tracking-[.12em] text-pm-wine">Photos de candidature</h3><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{photos.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-pm-peach"><Image src={url} alt={`Photo de candidature ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transition-none" /></a>)}</div></section>}

            <section className="mt-8 rounded-[1.6rem] border border-pm-ink/[.09] bg-white p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[.55fr_1.45fr]">
                <div><label htmlFor="casting-decision" className="mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/60">Décision</label><select id="casting-decision" value={decision} disabled={busy || provisioned} onChange={(event) => setDecision(event.target.value)} className="min-h-12 w-full rounded-xl border border-pm-ink/15 bg-pm-ivory px-4 text-sm outline-none focus-visible:border-pm-coral">{visibleDecisionOptions.map((item) => <option key={item.value} value={item.value} disabled={!canProvision && item.value === 'Accepté'}>{item.label}</option>)}</select>{!canProvision && !provisioned && <p className="mt-2 text-xs leading-5 text-pm-ink/45">La validation finale est réservée à l’administrateur.</p>}</div>
                <div><label htmlFor="casting-notes" className="mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/60">Note interne</label><textarea id="casting-notes" value={notes} disabled={busy} onChange={(event) => setNotes(event.target.value)} rows={4} placeholder="Évaluation, remarques du jury, éléments à suivre…" className="w-full resize-y rounded-xl border border-pm-ink/15 bg-pm-ivory px-4 py-3 text-sm leading-6 outline-none focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10" /></div>
              </div>

              {accepting && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><strong>Cette validation va créer le compte Supabase Auth.</strong> Un profil mannequin sera généré à partir de ce dossier, puis Supabase enverra l’e-mail d’invitation à <strong>{viewing.email}</strong>. Aucun mot de passe n’est créé par l’administrateur.</div>}
              {provisioned && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><span>Compte déjà créé. État e-mail : <strong>{viewing.credentials_email_status || raw.activationEmailStatus || 'invitation envoyée'}</strong>.</span></div>}
              {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800"><AlertTriangle size={18} className="mt-0.5 shrink-0" /> {error}</div>}
            </section>
          </div>
          <div className="flex flex-col gap-3 border-t border-pm-ink/10 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p className="text-xs leading-5 text-pm-ink/45">Les données personnelles du candidat ne sont pas modifiables ici : elles restent la copie fidèle de sa soumission.</p><div className="flex shrink-0 gap-3"><button type="button" disabled={busy} onClick={() => setViewing(null)} className="min-h-11 rounded-full border border-pm-ink/15 px-5 text-sm font-bold disabled:opacity-50">Fermer</button><button type="button" disabled={busy} onClick={() => void saveDecision()} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-extrabold text-white disabled:opacity-50 ${accepting ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-pm-ink hover:bg-pm-wine'}`}>{busy ? <Loader2 size={16} className="animate-spin motion-reduce:animate-none" /> : accepting ? <UserCheck size={16} /> : <CheckCircle2 size={16} />}{busy ? 'Traitement…' : accepting ? 'Valider & créer le compte' : 'Enregistrer la décision'}</button></div></div>
        </div>
      </div>;
    })()}
  </section>;
}
