'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SURVEY_QUESTIONS, SURVEY_SECTIONS } from '@/lib/agency-survey';

type PublicResults = {
  total: number;
  released: boolean;
  minPublicSample: number;
  average: number | null;
  counts: Record<string,Record<string,number>>;
  answered: Record<string,number>;
  testimonials: Array<{id:string;comments:Array<{question:number;text:string}>}>;
};
const percent = (value: number, total: number) => total ? Math.round(value / total * 100) : 0;

export default function SurveyResultsPage() {
  const [data, setData] = useState<PublicResults | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(-1);
  const [loading, setLoading] = useState(true);
  const load = () => {
    setLoading(true);
    fetch('/api/agency-survey', { cache: 'no-store' })
      .then(async r => { if (!r.ok) throw new Error('Résultats indisponibles.'); return r.json(); })
      .then(d => { setData(d); setError(''); })
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const measurable = SURVEY_QUESTIONS.filter(q => q.type !== 'text' && (filter === -1 || filter === q.section));
  const comments = data?.testimonials.flatMap(row => row.comments.map(c => ({ id: row.id + '-' + c.question, ...c }))) || [];

  return <main className="min-h-screen bg-[#F8F6F1] text-[#171717]">
    <section className="bg-[#171717] px-5 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-extrabold uppercase tracking-[.3em] text-[#D3B783]">Perfect Models Management · Transparence</p>
        <h1 className="mt-4 max-w-4xl font-playfair text-5xl sm:text-7xl">La parole aux <em className="text-[#D3B783]">participants.</em></h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-white/65">Statistiques du sondage anonyme et témoignages publiés après vérification. Les chiffres proviennent des réponses effectivement enregistrées, sans modification éditoriale.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sondage" className="inline-flex min-h-12 items-center rounded-full bg-[#D0AD70] px-6 text-sm font-bold text-black">Participer au sondage ↗</Link>
          <button type="button" onClick={load} className="inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 text-sm font-bold text-white">Actualiser les résultats</button>
        </div>
      </div>
    </section>
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
      {loading && !data ? <p aria-live="polite" className="py-16 text-center text-black/50">Chargement des résultats…</p> : null}
      {data && <>
        <div className="grid gap-4 sm:grid-cols-3">
          <section className="rounded-2xl border border-black/10 bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-black/50">Participations anonymes</p><p className="mt-4 font-playfair text-5xl font-semibold">{data.total}</p></section>
          <section className="rounded-2xl border border-black/10 bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-black/50">Évaluation moyenne</p><p className="mt-4 font-playfair text-5xl font-semibold">{data.average === null ? '—' : String(data.average).replace('.', ',') + '/10'}</p></section>
          <section className="rounded-2xl border border-black/10 bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-black/50">Témoignages publiés</p><p className="mt-4 font-playfair text-5xl font-semibold">{comments.length}</p></section>
        </div>
        {!data.released ? <div className="mt-7 rounded-2xl border border-[#D0AD70]/50 bg-white p-8">
          <h2 className="font-playfair text-3xl">Premiers retours en cours de collecte</h2>
          <p className="mt-3 text-sm leading-7 text-black/60">Afin de limiter le risque d’identifier une personne à partir de ses choix, les répartitions et témoignages publics apparaîtront à partir de {data.minPublicSample} participants. Les participations enregistrées sont conservées et seront incluses dans les statistiques.</p>
        </div> : <>
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#9C7C4B]">Données ouvertes à tous</p><h2 className="mt-3 font-playfair text-4xl">Les résultats question par question</h2></div><p className="max-w-md text-sm leading-6 text-black/50">Chaque pourcentage correspond aux personnes ayant répondu à la question. Les questions à choix multiples peuvent dépasser 100 % au total.</p></div>
            <label className="mt-7 block max-w-sm text-sm font-semibold">Filtrer par rubrique
              <select value={filter} onChange={e => setFilter(Number(e.target.value))} className="mt-2 min-h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm">
                <option value={-1}>Toutes les rubriques</option>
                {SURVEY_SECTIONS.map((name,index) => <option key={name} value={index}>{name}</option>)}
              </select>
            </label>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {measurable.map(q => {
                const counts = data.counts[String(q.id)] || {};
                const participants = data.answered[String(q.id)] || 0;
                const options = q.type === 'scale' ? Array.from({length:11},(_,n)=>String(n)) : q.options || [];
                return <article key={q.id} className="min-w-0 rounded-2xl border border-black/10 bg-white p-5 sm:p-7">
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#A17E48]">Question {q.id} · {participants} réponse{participants === 1 ? '' : 's'}</p>
                  <h3 className="mt-3 text-base font-bold leading-7">{q.label}</h3>
                  {participants ? <div className="mt-6 space-y-4">{options.map(option => <div key={option}>
                    <div className="flex items-center justify-between gap-3 text-xs"><span className="min-w-0 break-words text-black/75">{option}</span><span className="shrink-0 font-bold">{percent(counts[option] || 0, participants)} % <span className="font-normal text-black/35">({counts[option] || 0})</span></span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#C4A46B]" style={{ width: String(percent(counts[option] || 0, participants)) + '%' }}/></div>
                  </div>)}</div> : <p className="mt-5 text-sm text-black/45">Pas encore de réponse à cette question.</p>}
                </article>;
              })}
            </div>
          </section>
          <section className="mt-16">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#9C7C4B]">Paroles anonymes · après modération</p>
            <h2 className="mt-3 font-playfair text-4xl">Les témoignages publiés</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">Ces textes sont des avis personnels non vérifiés. Ils peuvent avoir été raccourcis ou anonymisés pour protéger les participants et les tiers. Les propos non encore modérés n’apparaissent pas.</p>
            {comments.length ? <div className="mt-8 grid gap-4 md:grid-cols-2">{comments.map(item => <blockquote key={item.id} className="rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#9A783F]">Question {item.question} · Témoignage anonyme</p>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-8 text-black/80">{item.text}</p>
            </blockquote>)}</div> : <div className="mt-7 rounded-xl bg-white p-7 text-sm text-black/55">Aucun témoignage n’a encore été approuvé pour publication.</div>}
          </section>
        </>}
        <div className="mt-14 border-t border-black/10 pt-6 text-xs leading-7 text-black/45">Ce dispositif ne demande ni nom, ni adresse email, ni compte. Pour préserver l’anonymat, aucun résultat individuel ou regroupement par profil n’est publié. Les réponses ne constituent pas un échantillon statistiquement représentatif de l’ensemble de l’agence.</div>
      </>}
    </div>
  </main>;
}
