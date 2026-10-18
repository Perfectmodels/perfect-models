'use client';

import { useEffect, useState } from 'react';
import { surveyQuestionById } from '@/lib/agency-survey';

type Row = {
  id: string;
  created_at: string;
  private_comments: Record<string,string>;
  public_comments: Record<string,string>;
  moderation_status: string;
};
type Data = {rows: Row[];total:number};

export default function SurveyModeration() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Data>({ rows: [], total: 0 });
  const [selected, setSelected] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Record<string,string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/agency-survey?status=' + encodeURIComponent(status) + '&page=' + page, { cache: 'no-store' });
      if (!response.ok) throw new Error('Accès aux réponses indisponible.');
      setData(await response.json());
      setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status, page]);
  const open = (row: Row) => {
    setSelected(row);
    setDraft(row.moderation_status === 'approved' ? {...row.public_comments} : {});
    setConfirmed(false);
    setError('');
    setNotice('');
  };
  const moderate = async (decision: 'approved' | 'rejected') => {
    if (!selected || (decision === 'approved' && !confirmed)) return;
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/admin/agency-survey', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: decision, publicComments: draft, confirmedAnonymized: confirmed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Modération impossible.');
      setSelected(null);
      setNotice(decision === 'approved' ? 'Témoignage publié après modération.' : 'Témoignage écarté de la publication.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Erreur'); }
    finally { setPending(false); }
  };

  return <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
    <section className="min-w-0 rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="font-playfair text-3xl">Témoignages reçus</h2>
      <p className="mt-2 text-sm leading-6 text-black/55">Aucun renseignement personnel n'est demandé aux répondants. Seuls les témoignages approuvés sont visibles sur le site.</p>
      <label className="mt-6 block text-sm font-semibold">Afficher
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); setSelected(null); }} className="mt-2 min-h-12 w-full rounded-xl border border-black/15 bg-[#FCFAF7] px-4 text-sm">
          <option value="pending">En attente de modération</option>
          <option value="approved">Publiés</option>
          <option value="rejected">Non publiés</option>
          <option value="all">Tous les dossiers</option>
        </select>
      </label>
      {notice && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <p className="mt-6 text-xs text-black/50">{data.total} dossier{data.total === 1 ? '' : 's'} · {loading ? 'Chargement…' : 'Page ' + (page + 1)}</p>
      <div className="mt-3 space-y-3">
        {!loading && !data.rows.length && <p className="rounded-xl bg-[#F9F5EE] p-6 text-sm text-black/55">Aucun témoignage dans cette rubrique.</p>}
        {data.rows.map(row => <button type="button" key={row.id} onClick={() => open(row)} className={'w-full rounded-xl border p-4 text-left transition ' + (selected?.id === row.id ? 'border-[#B99556] bg-[#F7F0E3]' : 'border-black/10 bg-white hover:border-black/30')}>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide">{row.moderation_status === 'pending' ? 'À examiner' : row.moderation_status === 'approved' ? 'Publié' : row.moderation_status === 'rejected' ? 'Refusé' : 'Sans texte'}</span><span className="text-xs text-black/45">{new Date(row.created_at).toLocaleDateString('fr-FR')}</span></div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/60">{Object.values(row.private_comments || {}).find(Boolean) || 'Aucun texte'}</p>
        </button>)}
      </div>
      <div className="mt-5 flex justify-between gap-3">
        <button type="button" className="rounded-xl border border-black/15 px-4 py-2 text-sm disabled:opacity-40" disabled={page === 0} onClick={() => { setPage(v => v-1); setSelected(null); }}>← Précédent</button>
        <button type="button" className="rounded-xl border border-black/15 px-4 py-2 text-sm disabled:opacity-40" disabled={(page + 1) * 20 >= data.total} onClick={() => { setPage(v => v+1); setSelected(null); }}>Suivant →</button>
      </div>
    </section>
    <section className="min-w-0 self-start rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
      <h2 className="font-playfair text-3xl">Vérification avant publication</h2>
      {!selected ? <p className="mt-6 rounded-xl bg-[#F9F5EE] p-6 text-sm leading-7 text-black/50">Sélectionnez un témoignage à gauche pour le vérifier et préparer sa version publique.</p> : <>
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Les réponses libres peuvent comporter des noms, des fonctions reconnaissables, des événements précis, des accusations ou des informations de santé. Retirez tout détail permettant d'identifier une personne avant publication. Ne diffusez pas de propos dangereux ou diffamatoires.</p>
        <div className="mt-6 space-y-6">
          {Object.entries(selected.private_comments || {}).filter(([,value]) => value).map(([id,value]) => <div key={id} className="border-b border-black/10 pb-6">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#9A783F]">Question {id}</p>
            <h3 className="mt-2 text-sm font-semibold">{surveyQuestionById(Number(id))?.label}</h3>
            <div className="mt-3 rounded-xl bg-[#F5F3F0] p-4"><p className="text-xs font-bold uppercase tracking-wide text-black/35">Original confidentiel — ne pas publier tel quel</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">{value}</p></div>
            <label className="mt-4 block text-sm font-bold">Version anonymisée proposée au public
              <textarea rows={4} maxLength={1600} value={draft[id] || ''} onChange={e => { setDraft(old => ({...old,[id]:e.target.value})); setConfirmed(false); }} placeholder="Rédiger ici l’extrait anonymisé à publier, ou laisser vide pour ne pas publier ce commentaire." className="mt-2 w-full rounded-xl border border-black/15 p-4 text-sm leading-7 outline-none focus:border-[#B99556]" />
            </label>
          </div>)}
        </div>
        <label className="mt-6 flex cursor-pointer gap-3 rounded-xl bg-[#F8F1E5] p-4 text-sm leading-6"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#9A783F]" /><span>Je confirme avoir supprimé toute donnée personnelle, toute identification indirecte et tout propos inapproprié des extraits publiés.</span></label>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" disabled={pending || !confirmed || !Object.values(draft).some(v => v.trim())} onClick={() => moderate('approved')} className="min-h-12 rounded-xl bg-black px-5 text-sm font-bold text-white disabled:opacity-40">Approuver et publier</button>
          <button type="button" disabled={pending} onClick={() => moderate('rejected')} className="min-h-12 rounded-xl border border-red-200 px-5 text-sm font-bold text-red-700 disabled:opacity-40">Ne pas publier</button>
        </div>
      </>}
    </section>
  </div>;
}
