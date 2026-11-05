'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Archive, CheckCircle2, Eye, EyeOff, Filter, Loader2, Pencil, Search,
  ShieldOff, SlidersHorizontal, UserRoundCog,
} from 'lucide-react';
import { formatGender, formatStatus, statusTone } from '@/lib/admin-formatters';

export type TalentRosterRow = {
  id: string;
  name: string;
  username?: string | null;
  image_url?: string | null;
  gender?: string | null;
  categories?: string[] | null;
  height_cm?: number | string | null;
  height?: string | null;
  status?: string | null;
  level?: string | null;
  location?: string | null;
  is_public: boolean;
  is_active: boolean;
  availability?: string | null;
};

type PendingAction = { talent: TalentRosterRow; kind: 'archive' | 'toggle-active' | 'toggle-public' };

function heightFor(talent: TalentRosterRow) {
  if (talent.height_cm) return `${Number(talent.height_cm).toLocaleString('fr-FR')} cm`;
  return talent.height || 'Taille non renseignée';
}

function actionCopy(action: PendingAction) {
  if (action.kind === 'archive') {
    return {
      title: `Archiver ${action.talent.name} ?`,
      message: 'La fiche, les documents et l’historique seront conservés. Le talent ne sera plus actif ni visible publiquement.',
      label: 'Archiver la fiche',
    };
  }
  if (action.kind === 'toggle-public') {
    return {
      title: action.talent.is_public ? 'Masquer le profil public ?' : 'Publier le profil ?',
      message: action.talent.is_public ? 'La fiche reste dans l’ERP mais disparaît du roster public.' : 'Le profil redevient visible sur le site public si le talent est actif.',
      label: action.talent.is_public ? 'Masquer' : 'Publier',
    };
  }
  return {
    title: action.talent.is_active ? 'Désactiver ce talent ?' : 'Réactiver ce talent ?',
    message: action.talent.is_active ? 'Ses données seront conservées. Il ne sera plus proposé comme talent actif.' : 'Le talent redevient disponible dans les opérations de l’agence.',
    label: action.talent.is_active ? 'Désactiver' : 'Réactiver',
  };
}

export default function TalentRoster({ initialTalents }: { initialTalents: TalentRosterRow[] }) {
  const [talents, setTalents] = useState(initialTalents);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('active');
  const [gender, setGender] = useState('');
  const [availability, setAvailability] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return talents.filter((talent) => {
      const searchable = `${talent.name} ${talent.username || ''} ${talent.location || ''} ${(talent.categories || []).join(' ')}`.toLocaleLowerCase('fr');
      const statusMatch = !status
        || (status === 'active' && talent.is_active && talent.status !== 'archived')
        || (status === 'inactive' && !talent.is_active && talent.status !== 'archived')
        || (status === 'archived' && talent.status === 'archived');
      return (!term || searchable.includes(term))
        && (!gender || formatGender(talent.gender) === gender)
        && (!availability || talent.availability === availability)
        && statusMatch;
    });
  }, [availability, gender, query, status, talents]);

  const counts = useMemo(() => ({
    total: talents.length,
    active: talents.filter((talent) => talent.is_active && talent.status !== 'archived').length,
    public: talents.filter((talent) => talent.is_active && talent.is_public && talent.status !== 'archived').length,
    archived: talents.filter((talent) => talent.status === 'archived').length,
  }), [talents]);

  async function confirmAction() {
    if (!pending) return;
    setBusy(true);
    setError('');
    setNotice('');
    const { talent, kind } = pending;
    const updates = kind === 'archive'
      ? { status: 'archived', is_active: false, is_public: false }
      : kind === 'toggle-public'
        ? { is_public: !talent.is_public }
        : { is_active: !talent.is_active, status: talent.is_active ? 'inactive' : 'active' };
    try {
      const response = await fetch(`/api/admin/resources/models/${encodeURIComponent(talent.id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Mise à jour impossible.');
      setTalents((current) => current.map((item) => item.id === talent.id ? { ...item, ...payload.data } : item));
      setNotice(kind === 'archive' ? 'Fiche archivée sans suppression des données.' : 'Statut du talent mis à jour.');
      setPending(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible.');
    } finally {
      setBusy(false);
    }
  }

  const confirmation = pending ? actionCopy(pending) : null;

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-pm-ink/[.08] bg-white shadow-[0_20px_60px_rgba(91,46,37,.05)]">
      <div className="grid gap-5 border-b border-pm-ink/[.08] bg-pm-peach/45 p-5 sm:p-7 xl:grid-cols-[1fr_auto] xl:items-end">
        <div>
          <p className="control-kicker">Roster agence</p>
          <h2 className="mt-1 font-playfair text-3xl font-semibold sm:text-4xl">Tous les talents, sans liste interminable.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-pm-ink/50">Recherchez, filtrez puis ouvrez directement la fiche métier. Les actions rapides conservent toujours les dossiers liés.</p>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ['Total', counts.total], ['Actifs', counts.active], ['Publics', counts.public], ['Archivés', counts.archived],
          ].map(([label, value]) => <div key={label} className="min-w-16 rounded-2xl bg-white px-3 py-3 shadow-sm"><p className="font-playfair text-2xl font-semibold text-pm-wine">{value}</p><p className="mt-1 text-[8px] font-black uppercase tracking-[.1em] text-pm-ink/35">{label}</p></div>)}
        </div>
      </div>

      <div className="grid gap-3 border-b border-pm-ink/[.07] p-4 sm:p-5 lg:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(150px,.35fr))]">
        <label className="relative"><span className="sr-only">Rechercher un talent</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/35" size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, identifiant, ville, catégorie…" className="min-h-11 w-full rounded-xl border border-pm-ink/10 bg-pm-ivory pl-11 pr-4 text-sm outline-none focus:border-pm-coral" /></label>
        <FilterSelect icon={<SlidersHorizontal size={15}/>} label="Statut" value={status} onChange={setStatus} options={[['Tous',''],['Actifs','active'],['Inactifs','inactive'],['Archivés','archived']]} />
        <FilterSelect icon={<UserRoundCog size={15}/>} label="Genre" value={gender} onChange={setGender} options={[['Tous',''],['Femmes','Femme'],['Hommes','Homme'],['Autres','Autre']]} />
        <FilterSelect icon={<Filter size={15}/>} label="Disponibilité" value={availability} onChange={setAvailability} options={[['Toutes',''],['Disponible','available'],['Indisponible','unavailable'],['À confirmer','tentative'],['En déplacement','travel']]} />
      </div>

      {(notice || error) && <div className={`mx-5 mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${error ? 'bg-rose-50 text-rose-900' : 'bg-emerald-50 text-emerald-900'}`}>{error ? <ShieldOff size={16}/> : <CheckCircle2 size={16}/>} {error || notice}</div>}

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((talent) => {
          const publicProfile = `/mannequins/${encodeURIComponent(talent.username || talent.id)}`;
          return <article key={talent.id} className="group rounded-[1.45rem] border border-pm-ink/[.08] bg-[#FCFAF7] p-3 transition hover:-translate-y-0.5 hover:border-pm-coral/25 hover:shadow-lg">
            <div className="flex gap-3">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-pm-peach">
                {talent.image_url ? <Image src={talent.image_url} alt={`Portrait de ${talent.name}`} fill sizes="80px" className="object-cover" /> : <div className="grid h-full place-items-center font-playfair text-3xl font-semibold text-pm-wine">{talent.name.slice(0,1).toLocaleUpperCase('fr')}</div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-sm font-black text-pm-ink">{talent.name}</h3><p className="mt-1 truncate text-[10px] font-semibold text-pm-ink/40">{talent.username || 'Identifiant non renseigné'}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[.06em] ${statusTone(talent.status)}`}>{formatStatus(talent.status)}</span></div>
                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                  <Info label="Profil" value={`${formatGender(talent.gender)} · ${heightFor(talent)}`} />
                  <Info label="Niveau" value={talent.level || 'Non renseigné'} />
                  <Info label="Disponibilité" value={formatStatus(talent.availability || 'tentative')} />
                  <Info label="Catégorie" value={(talent.categories || [])[0] || 'Non renseignée'} />
                </dl>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={`/admin/talents/${encodeURIComponent(talent.id)}`} className="col-span-2 inline-flex min-h-10 items-center justify-center rounded-xl bg-pm-ink px-3 text-[10px] font-black uppercase tracking-[.07em] text-white">Ouvrir Talent 360°</Link>
              <Link href={`/admin/talents/${encodeURIComponent(talent.id)}?tab=profil&action=edit`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-pm-ink/10 bg-white px-2 text-[9px] font-black uppercase tracking-[.05em]"><Pencil size={12}/> Modifier</Link>
              <Link href={publicProfile} target="_blank" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-pm-ink/10 bg-white px-2 text-[9px] font-black uppercase tracking-[.05em]"><Eye size={12}/> Profil public</Link>
              <button type="button" onClick={() => setPending({ talent, kind:'toggle-active' })} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-pm-ink/10 bg-white px-2 text-[9px] font-black uppercase tracking-[.05em]"><ShieldOff size={12}/>{talent.is_active ? 'Désactiver' : 'Réactiver'}</button>
              <button type="button" onClick={() => setPending({ talent, kind:'toggle-public' })} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-pm-ink/10 bg-white px-2 text-[9px] font-black uppercase tracking-[.05em]">{talent.is_public ? <EyeOff size={12}/> : <Eye size={12}/>}{talent.is_public ? 'Masquer' : 'Publier'}</button>
              {talent.status !== 'archived' && <button type="button" onClick={() => setPending({ talent, kind:'archive' })} className="col-span-2 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-pm-peach px-2 text-[9px] font-black uppercase tracking-[.05em] text-pm-wine"><Archive size={12}/> Archiver sans supprimer</button>}
            </div>
          </article>;
        })}
      </div>
      {!filtered.length && <div className="p-12 text-center"><p className="font-playfair text-2xl font-semibold">Aucun talent ne correspond à ces filtres.</p><button type="button" onClick={() => { setQuery(''); setStatus(''); setGender(''); setAvailability(''); }} className="mt-3 text-xs font-black text-pm-coral">Réinitialiser les filtres</button></div>}

      {pending && confirmation && <div className="fixed inset-0 z-[120] grid place-items-center bg-pm-ink/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-[1.8rem] bg-white p-6 shadow-2xl"><div className="grid h-12 w-12 place-items-center rounded-full bg-pm-peach text-pm-wine"><Archive size={20}/></div><h3 className="mt-5 font-playfair text-3xl font-semibold">{confirmation.title}</h3><p className="mt-3 text-sm leading-6 text-pm-ink/55">{confirmation.message}</p><div className="mt-7 flex justify-end gap-2"><button type="button" disabled={busy} onClick={() => setPending(null)} className="min-h-11 rounded-full border border-pm-ink/10 px-5 text-sm font-bold">Annuler</button><button type="button" disabled={busy} onClick={() => void confirmAction()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-wine px-5 text-sm font-black text-white disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin"/>}{confirmation.label}</button></div></div></div>}
    </section>
  );
}

function FilterSelect({ icon, label, value, onChange, options }: { icon: React.ReactNode; label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return <label className="flex min-h-11 items-center gap-2 rounded-xl border border-pm-ink/10 bg-white px-3 text-pm-ink/40">{icon}<span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-pm-ink outline-none">{options.map(([optionLabel, optionValue]) => <option key={`${label}-${optionValue}`} value={optionValue}>{optionLabel}</option>)}</select></label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[8px] font-black uppercase tracking-[.06em] text-pm-ink/30">{label}</dt><dd className="mt-0.5 truncate font-semibold text-pm-ink/65">{value}</dd></div>;
}
