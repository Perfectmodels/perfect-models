'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SURVEY_QUESTIONS, SURVEY_SECTIONS, type SurveyQuestion } from '@/lib/agency-survey';

type Results = {
  total: number;
  released: boolean;
  minPublicSample: number;
  average: number | null;
  rated: number;
  answered: Record<string, number>;
  counts: Record<string, Record<string, number>>;
  hiddenQuestions: string[];
  testimonials: Array<{ id: string; comments: Array<{ question: number; text: string }> }>;
};

const formatNumber = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
const percentage = (count: number, denominator: number) => denominator ? 100 * count / denominator : 0;
const percentageLabel = (count: number, denominator: number) => formatNumber(percentage(count, denominator)) + ' %';
const numberOf = (data: Results, id: number) => data.answered[String(id)] || 0;
const countOf = (data: Results, id: number, option: string) => data.counts[String(id)]?.[option] || 0;

function mostSelected(data: Results, id: number) {
  const entries = Object.entries(data.counts[String(id)] || {});
  const n = numberOf(data,id);
  if (!entries.length || !n) return null;
  entries.sort((a,b) => b[1]-a[1]);
  const [label, count] = entries[0];
  return { label, count, n, tied: entries.length > 1 && entries[1][1] === count };
}

function ChartBars({ rows, denominator, color = '#B99860' }: {
  rows: Array<{ label: string; count: number }>;
  denominator: number;
  color?: string;
}) {
  return <div className="space-y-4" role="list" aria-label="Répartition des réponses">
    {rows.map(({ label, count }) => <div key={label} role="listitem" className="min-w-0">
      <div className="mb-1.5 flex min-w-0 items-start justify-between gap-3 text-xs leading-5 sm:text-sm">
        <span className="min-w-0 flex-1 break-words text-[#303030]">{label}</span>
        <span className="shrink-0 whitespace-nowrap font-extrabold tabular-nums">{percentageLabel(count, denominator)}
          <span className="ml-2 font-medium text-black/40">({count})</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#EEE8DE]" role="img" aria-label={label + ' : ' + count + ' réponses, ' + percentageLabel(count, denominator)}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: percentage(count, denominator) + '%', backgroundColor: color }} />
      </div>
    </div>)}
  </div>;
}

function Donut({ label, value, count, total }: { label: string; value: number; count: number; total: number }) {
  return <div className="flex items-center gap-4">
    <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full sm:h-28 sm:w-28" role="img" aria-label={label + ' : ' + formatNumber(value) + ' pour cent'} style={{ background: 'conic-gradient(#B99860 0% ' + value + '%, #ECE5D9 ' + value + '% 100%)' }}>
      <div className="grid h-[75%] w-[75%] place-items-center rounded-full bg-white"><span className="text-lg font-extrabold tabular-nums sm:text-xl">{formatNumber(value)} %</span></div>
    </div>
    <div className="min-w-0"><p className="text-sm font-bold leading-6">{label}</p><p className="mt-2 text-xs leading-5 text-black/50">{count} réponse{count !== 1 ? 's' : ''} sur {total}</p></div>
  </div>;
}

function Highlight({ title, value, detail, foot }: { title: string; value: string; detail: string; foot?: string }) {
  return <article className="min-w-0 rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,.025)] sm:p-7">
    <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#89714D]">{title}</p>
    <p className="mt-4 break-words font-playfair text-4xl font-semibold leading-none sm:text-5xl">{value}</p>
    <p className="mt-3 text-sm font-medium leading-6 text-black/65">{detail}</p>
    {foot ? <p className="mt-2 text-xs text-black/40">{foot}</p> : null}
  </article>;
}

function QuestionGraph({ data, question }: { data: Results; question: SurveyQuestion }) {
  const n = numberOf(data, question.id);
  const hidden = data.hiddenQuestions?.includes(String(question.id));
  const options = question.type === 'scale'
    ? Array.from({ length: 11 }, (_, index) => String(index))
    : question.options || [];
  const counts = data.counts[String(question.id)] || {};
  const entries = options.map(label => ({ label, count: counts[label] || 0 }));
  // Bar charts for numerical ratings remain in ascending score order.
  if (question.type !== 'scale') entries.sort((a,b) => b.count - a.count);
  const winner = mostSelected(data, question.id);
  const isMultiple = question.type === 'multiple';
  return <article className="min-w-0 rounded-[1.4rem] border border-black/[.08] bg-white p-5 sm:p-7">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#987647]">QUESTION {String(question.id).padStart(2,'0')}</p>
      <span className="rounded-full bg-[#F4EFE6] px-3 py-1 text-[10px] font-bold text-black/55">{n} réponse{n === 1 ? '' : 's'}</span>
    </div>
    <h3 className="mt-3 text-lg font-bold leading-7 text-[#1A1A1A]">{question.label}</h3>
    {isMultiple && <p className="mt-2 text-xs text-black/50">Plusieurs réponses possibles. La somme des pourcentages peut dépasser 100 %.</p>}
    {hidden ? <div className="mt-6 rounded-xl border border-[#D8C6A9]/60 bg-[#FCF8F0] p-4 text-sm leading-7 text-black/65">
      Répartition temporairement masquée pour protéger la confidentialité de cette question sensible. Elle sera affichée dès {data.minPublicSample} réponses.
    </div> : n === 0 ? <p className="mt-6 rounded-xl bg-[#F9F7F3] p-5 text-sm text-black/45">Aucune réponse enregistrée pour cette question.</p> : <>
      <div className="mt-6"><ChartBars rows={entries} denominator={n} color={question.id === 6 ? '#A45C4E' : '#B99860'} /></div>
      {winner && <div className="mt-6 rounded-xl bg-[#F8F5EF] p-4">
        <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-[#9A7848]">Lecture du résultat</p>
        <p className="mt-2 text-sm leading-6 text-black/75">{winner.tied ? 'Ex æquo en tête, notamment : ' : 'Réponse la plus citée : '}<strong>{winner.label}</strong> ({winner.count} sur {winner.n}, soit {percentageLabel(winner.count, winner.n)}).</p>
      </div>}
    </>}
  </article>;
}

export default function SurveyResultsPage() {
  const [data, setData] = useState<Results | null>(null);
  const [filter, setFilter] = useState(-1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/agency-survey', { cache: 'no-store' });
      if (!response.ok) throw new Error('Impossible de charger les résultats.');
      const result: Results = await response.json();
      setData(result);
      setError('');
      setRefreshedAt(new Date());
    } catch (e) { setError(e instanceof Error ? e.message : 'Résultats indisponibles.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void load();
    const interval = setInterval(() => { void load(); }, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const questions = useMemo(() => SURVEY_QUESTIONS.filter(question =>
    question.type !== 'text' && (filter === -1 || question.section === filter) &&
    (search.trim() === '' || question.label.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr')))
  ), [filter, search]);

  const comments = data?.testimonials.flatMap(row => row.comments.map(c => ({ id: row.id + '-' + c.question, ...c }))) || [];
  const positiveImage = data ? countOf(data,4,'Très positive') + countOf(data,4,'Positive') : 0;
  const positiveRecommendation = data ? countOf(data,7,'Oui, sans hésitation') + countOf(data,7,'Probablement oui') : 0;
  const nImage = data ? numberOf(data,4) : 0;
  const nRecommendation = data ? numberOf(data,7) : 0;
  const strongest = data ? mostSelected(data,5) : null;
  const weakest = data ? mostSelected(data,6) : null;
  const priority = data ? mostSelected(data,35) : null;

  return <main className="min-h-screen bg-[#F8F6F1] text-[#171717]">
    <section className="bg-[#161616] px-5 py-14 text-white sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-black uppercase tracking-[.26em] text-[#D5B783]">PERFECT MODELS MANAGEMENT · OBSERVATOIRE DU SONDAGE</p>
        <h1 className="mt-5 max-w-4xl font-playfair text-5xl font-semibold leading-[1.04] sm:text-7xl">Les chiffres parlent. <em className="text-[#D5B783]">Les avis aussi.</em></h1>
        <p className="mt-6 max-w-3xl text-sm leading-8 text-white/70 sm:text-base">Explorez les réponses à chaque question, leurs pourcentages et les tendances qui se dégagent. Tous les chiffres sont calculés à partir des participations réellement enregistrées.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sondage/participer" className="inline-flex min-h-12 items-center rounded-full bg-[#C5A467] px-6 text-sm font-bold text-black">Répondre au sondage ↗</Link>
          <Link href="/sondage" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm font-bold text-white">Présentation du sondage</Link>
          <button type="button" onClick={() => { setLoading(true); void load(); }} className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm font-bold text-white">Actualiser ↻</button>
        </div>
        <p className="mt-4 text-xs text-white/45">{refreshedAt ? 'Actualisé à ' + refreshedAt.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) + ' · Mise à jour automatique toutes les minutes' : 'Données en cours de chargement'}</p>
      </div>
    </section>
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      {error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</p>}
      {loading && !data && <p className="py-20 text-center text-sm text-black/50">Chargement des statistiques…</p>}
      {data && <>
        {data.total > 0 && data.total < 10 && <div className="mb-7 flex gap-3 rounded-2xl border border-[#DCC9A7] bg-[#FBF4E6] p-5 text-sm leading-7 text-[#694D2E]">
          <span className="shrink-0 text-xl" aria-hidden="true">ⓘ</span>
          <p><strong>Premiers résultats provisoires :</strong> seulement {data.total} personne{data.total > 1 ? 's ont' : ' a'} participé. Les pourcentages décrivent uniquement ces réponses et ne représentent pas l’ensemble des mannequins ou partenaires. Certaines questions sensibles restent masquées jusqu’à {data.minPublicSample} réponses.</p>
        </div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Highlight title="Participants" value={String(data.total)} detail="Réponses anonymes enregistrées" foot="Données réelles, sans réponses fictives" />
          <Highlight title="Note moyenne" value={data.average === null ? '—' : formatNumber(data.average) + ' /10'} detail="Évaluation globale de l’agence" foot={data.rated ? data.rated + ' évaluations' : 'En attente d’évaluations'} />
          <Highlight title="Image positive" value={nImage ? percentageLabel(positiveImage,nImage) : '—'} detail="Avis « positive » ou « très positive »" foot={nImage + ' réponses à cette question'} />
          <Highlight title="Recommandation" value={nRecommendation ? percentageLabel(positiveRecommendation,nRecommendation) : '—'} detail="Réponses favorables à recommander l’agence" foot={nRecommendation + ' réponses à cette question'} />
        </div>
        {data.total === 0 ? <div className="mt-9 rounded-2xl border border-black/10 bg-white p-8">
          <h2 className="font-playfair text-3xl">Les statistiques arriveront avec les premières réponses.</h2>
          <p className="mt-3 text-sm leading-7 text-black/60">Aucun résultat n’a encore été enregistré. Dès la première participation, les graphiques généraux commenceront à apparaître.</p>
        </div> : <>
          <section className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-[1.7rem] border border-black/10 bg-white p-6 sm:p-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#9C7C4B]">INDICATEURS DE PERCEPTION</p>
              <h2 className="mt-2 font-playfair text-3xl font-semibold">Comment l’agence est-elle perçue ?</h2>
              <div className="mt-8 grid gap-7 sm:grid-cols-2">
                <Donut label="Perception positive de l’agence" count={positiveImage} total={nImage} value={percentage(positiveImage,nImage)} />
                <Donut label="Disposition à recommander" count={positiveRecommendation} total={nRecommendation} value={percentage(positiveRecommendation,nRecommendation)} />
              </div>
              <p className="mt-7 text-xs leading-6 text-black/45">Les proportions sont calculées séparément pour chaque question sur le nombre de personnes ayant répondu. Elles ne sont pas une mesure scientifique de la réputation de l’agence.</p>
            </div>
            <div className="rounded-[1.7rem] border border-black/10 bg-[#211D18] p-6 text-white sm:p-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#D1B380]">DÉCRYPTAGE AUTOMATIQUE</p>
              <h2 className="mt-2 font-playfair text-3xl font-semibold">Ce qui ressort des réponses</h2>
              <div className="mt-6 space-y-5 text-sm leading-6">
                {[['Point fort le plus cité',strongest],['Difficulté la plus citée',weakest],['Priorité la plus citée',priority]].map(([label, value]) => {
                  const item = value as ReturnType<typeof mostSelected>;
                  return <div key={label as string} className="border-b border-white/15 pb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#D1B380]">{label as string}</p>
                    {item ? <><p className="mt-2 font-semibold">{item.label}</p><p className="mt-1 text-xs text-white/60">{percentageLabel(item.count,item.n)} · {item.count} sur {item.n} {item.tied ? '· résultat ex æquo' : ''}</p></> : <p className="mt-2 text-white/50">Pas assez de données.</p>}
                  </div>;
                })}
              </div>
              <p className="mt-5 text-xs leading-6 text-white/50">Cette synthèse est issue des réponses les plus fréquentes ; elle ne prétend pas expliquer leurs causes.</p>
            </div>
          </section>
          <section className="mt-14">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#9C7C4B]">ANALYSE DÉTAILLÉE</p><h2 className="mt-3 font-playfair text-4xl font-semibold">Les réponses, question par question</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-black/60">Graphiques, effectifs, pourcentages et lecture du choix le plus fréquent. Pour les questions à choix multiples, chaque pourcentage correspond aux répondants de cette question.</p></div>
              <span className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-bold text-black/55">{questions.length} questions affichées</span>
            </div>
            <div className="mt-7 grid gap-4 sm:grid-cols-[minmax(0,1fr)_260px]">
              <label className="block text-xs font-bold">Rechercher une question
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ex. transparence, communication…" className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm font-medium outline-none focus:border-[#B99860]" />
              </label>
              <label className="block text-xs font-bold">Rubrique
                <select value={filter} onChange={e => setFilter(Number(e.target.value))} className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm font-medium outline-none focus:border-[#B99860]">
                  <option value={-1}>Toutes les rubriques</option>
                  {SURVEY_SECTIONS.map((name,index) => <option value={index} key={name}>{name}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-7 grid items-start gap-5 lg:grid-cols-2">
              {questions.map(question => <QuestionGraph key={question.id} data={data} question={question} />)}
            </div>
            {questions.length === 0 && <p className="mt-5 rounded-xl bg-white p-7 text-sm text-black/60">Aucune question ne correspond à votre recherche.</p>}
          </section>
          <section className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#9C7C4B]">TÉMOIGNAGES</p><h2 className="mt-3 font-playfair text-4xl font-semibold">Les avis écrits</h2></div>
              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black/55">{comments.length} contribution{comments.length !== 1 ? 's' : ''} visible{comments.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/55">Les témoignages sont publiés automatiquement après masquage de coordonnées évidentes, sans sélection de la direction. Pour réduire le risque d’identification par un détail personnel, leur affichage public commence à {data.minPublicSample} participations. Le masquage automatique ne garantit pas l’anonymat d’un texte libre.</p>
            {comments.length ? <div className="mt-7 grid gap-4 md:grid-cols-2">{comments.map(item => <blockquote key={item.id} className="min-w-0 rounded-2xl border border-black/10 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#9A783F]">Question {item.question} · Avis anonyme</p>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-8 text-black/80">{item.text}</p>
            </blockquote>)}</div> : <div className="mt-6 rounded-2xl border border-black/10 bg-white p-7 text-sm leading-7 text-black/55">{data.total < data.minPublicSample ? 'Les témoignages apparaîtront lorsque ' + data.minPublicSample + ' personnes auront participé.' : 'Aucune contribution écrite enregistrée.'}</div>}
          </section>
        </>}
        <div className="mt-14 border-t border-black/10 pt-7 text-xs leading-7 text-black/45">Méthode : pourcentage = nombre de personnes ayant choisi cette option ÷ nombre de répondants à la question × 100. Les questions facultatives peuvent avoir des effectifs différents. En cas de choix multiples, les pourcentages peuvent dépasser 100 % une fois additionnés. Ces résultats représentent seulement les personnes ayant choisi de participer.</div>
      </>}
    </div>
  </main>;
}
