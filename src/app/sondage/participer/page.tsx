'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SURVEY_QUESTIONS, SURVEY_SECTIONS, isInternalRespondent, type SurveyQuestion } from '@/lib/agency-survey';

type Answer = string | string[] | number;
const gold = 'bg-[#C5A467] text-black';
const frame = 'rounded-2xl border border-black/10 bg-white p-5 sm:p-7';

export default function SurveyPage() {
  const [answers, setAnswers] = useState<Record<string,Answer>>({});
  const [section, setSection] = useState(0);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'editing' | 'sending' | 'sent'>('editing');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const internal = isInternalRespondent(String(answers['1'] || ''));
  const visible = useMemo(() => SURVEY_QUESTIONS.filter(q => !q.internal || internal), [internal]);
  const sectionQuestions = visible.filter(q => q.section === section);
  const answeredCount = visible.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;

  useEffect(() => {
    fetch('/api/agency-survey', { cache: 'no-store' }).then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.alreadySubmitted) setSubmitted(true); }).catch(() => undefined);
  }, []);

  const setAnswer = (question: SurveyQuestion, next: Answer) => {
    setAnswers(old => ({ ...old, [question.id]: next }));
    setError('');
  };
  const toggle = (question: SurveyQuestion, option: string) => {
    const current = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : [];
    const next = current.includes(option) ? current.filter(v => v !== option) : [...current, option];
    if (question.maxSelections && next.length > question.maxSelections) return;
    setAnswer(question, next);
  };
  const nextSection = () => {
    if (section === 0 && !answers['1']) { setError('Veuillez indiquer votre lien avec l’agence.'); return; }
    setSection(v => Math.min(8, v + 1));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const send = async () => {
    if (!consent) { setError('Veuillez accepter la publication des statistiques et la modération des commentaires.'); return; }
    if (visible.filter(q => q.type !== 'text' && answers[q.id] !== undefined && answers[q.id] !== '').length < 3) {
      setError('Merci de répondre à au moins trois questions à choix.'); return;
    }
    setStatus('sending');
    setError('');
    try {
      const response = await fetch('/api/agency-survey', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, consent, website }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Envoi impossible.');
      setStatus('sent');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setStatus('editing');
      setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
    }
  };

  if (status === 'sent' || submitted) return (
    <main className="min-h-[70vh] bg-[#F8F6F1] px-5 py-20 text-[#151515]">
      <div className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm sm:p-14">
        <p className="text-xs font-extrabold uppercase tracking-[.3em] text-[#9A783F]">Votre voix compte</p>
        <h1 className="mt-6 font-playfair text-4xl sm:text-5xl">{status === 'sent' ? 'Merci pour votre participation.' : 'Vous avez déjà participé.'}</h1>
        <p className="mt-5 leading-7 text-black/60">Vos réponses sont enregistrées sans identité déclarée. Statistiques et témoignages s’affichent automatiquement dès cinq participations, après masquage des coordonnées évidentes.</p>
        <Link href="/sondage/resultats" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-bold text-white">Voir les résultats publics ↗</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F8F6F1] text-[#151515]">
      <div className="bg-[#161616] px-5 pb-14 pt-16 text-white sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[.32em] text-[#CFB17E]">Perfect Models Management · Enquête anonyme de satisfaction</p>
          <h1 className="mt-5 max-w-3xl font-playfair text-5xl font-semibold leading-[1.05] sm:text-7xl">Votre voix <em className="text-[#CFB17E]">compte.</em></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">Ce qui fonctionne. Ce qui doit changer. Votre avis contribue à construire une agence plus transparente, professionnelle et à l’écoute.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-white/75">
            <span className="rounded-full border border-white/25 px-4 py-2">Aucun compte requis</span>
            <span className="rounded-full border border-white/25 px-4 py-2">Réponses anonymes</span>
            <span className="rounded-full border border-white/25 px-4 py-2">Résultats publics</span>
            <Link href="/sondage/resultats" className="rounded-full border border-[#C5A467] px-4 py-2 text-[#E9C78C] hover:bg-white/10">Consulter les résultats ↗</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-16">
        <aside className="self-start lg:sticky lg:top-32">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#987545]">Votre progression</p>
            <p className="mt-3 font-playfair text-4xl">{section + 1} <span className="text-2xl text-black/35">/ 9</span></p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#B99556] transition-all" style={{ width: String((section + 1) / 9 * 100) + '%' }} /></div>
            <p className="mt-3 text-xs text-black/50">{answeredCount} réponses renseignées · Les questions non pertinentes sont masquées.</p>
            <ol className="mt-6 hidden space-y-2 lg:block">
              {SURVEY_SECTIONS.map((label, index) => <li key={label}>
                <button type="button" onClick={() => { if (index === 0 || answers['1']) { setSection(index); setError(''); } }} className={'flex w-full gap-3 rounded-lg px-2 py-2 text-left text-xs transition ' + (section === index ? 'bg-[#F3EBDE] font-bold text-black' : 'text-black/50 hover:bg-black/5')}>
                  <span className="font-bold text-[#9A783F]">{String(index + 1).padStart(2, '0')}</span><span>{label}</span>
                </button>
              </li>)}
            </ol>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#A68550]">Section {section + 1}</p>
            <h2 className="mt-3 font-playfair text-3xl font-semibold sm:text-4xl">{SURVEY_SECTIONS[section]}</h2>
            <p className="mt-2 text-sm leading-6 text-black/55">Aucun nom n’est demandé. Les textes libres deviennent publics automatiquement : n’y écrivez aucun nom ou détail identifiant.</p>
          </div>
          <div className="space-y-5">
            {sectionQuestions.length ? sectionQuestions.map(q => {
              const value = answers[q.id];
              return <section key={q.id} className={frame}>
                <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#9A783F]">Question {q.id} {q.optional ? '· Facultative' : '· Obligatoire'}</p>
                <h3 className="mb-5 text-base font-bold leading-7 sm:text-lg">{q.label}</h3>
                {q.type === 'text' ? <textarea maxLength={1600} rows={4} value={typeof value === 'string' ? value : ''} onChange={e => setAnswer(q, e.target.value)} placeholder="Votre réponse libre, sans noms ni informations personnelles..." className="w-full rounded-xl border border-black/15 bg-[#FBFAF7] p-4 text-sm leading-7 outline-none focus:border-[#B99556]" /> : null}
                {q.type === 'scale' ? <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">{Array.from({ length: 11 }, (_, n) => <button type="button" key={n} onClick={() => setAnswer(q,n)} className={'h-11 rounded-lg border text-sm font-bold transition ' + (value === n ? gold : 'border-black/15 bg-white hover:bg-[#F3EBDE]')}>{n}</button>)}</div> : null}
                {(q.type === 'single' || q.type === 'multiple') && <div className="grid gap-2">
                  {q.options?.map(option => {
                    const checked = q.type === 'multiple' ? Array.isArray(value) && value.includes(option) : value === option;
                    return <label key={option} className={'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm leading-6 transition ' + (checked ? 'border-[#B99556] bg-[#F8F0E1] font-semibold' : 'border-black/10 bg-white hover:border-black/30')}>
                      <input type={q.type === 'multiple' ? 'checkbox' : 'radio'} name={'question-' + q.id} checked={checked} onChange={() => q.type === 'multiple' ? toggle(q,option) : setAnswer(q,option)} className="h-4 w-4 shrink-0 accent-[#987545]" />
                      <span>{option}</span>
                    </label>;
                  })}
                  {q.type === 'multiple' && <p className="mt-1 text-xs text-black/45">Plusieurs réponses possibles{q.maxSelections ? ', ' + q.maxSelections + ' maximum' : ''}.</p>}
                </div>}
              </section>;
            }) : <div className={frame}><p className="text-sm leading-7 text-black/65">Cette section ne concerne pas votre profil. Vous pouvez passer à la suivante.</p></div>}
            {section === 8 && <section className={frame}>
              <h3 className="text-lg font-bold">Confidentialité et publication</h3>
              <p className="mt-3 text-sm leading-7 text-black/65">Les réponses à choix multiples alimentent les statistiques publiques. Vos textes libres sont publiés automatiquement, sans approbation humaine, après masquage des coordonnées évidentes. Les publications sont visibles à partir de cinq participations pour limiter le risque d’identification. Aucun nom, email, téléphone ou adresse IP n’est demandé ni enregistré avec votre réponse. Ne citez jamais de personne ni de détail identifiant : un filtrage automatique ne garantit pas l’anonymat complet.</p>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#F8F4EC] p-4 text-sm leading-6"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#987545]" /><span>Je comprends que mes réponses et mes textes libres pourront être publiés automatiquement, sans approbation, après masquage des coordonnées évidentes et dès le seuil de confidentialité atteint. Je n’insère aucune information permettant d’identifier une personne.</span></label>
              <div className="absolute -left-[9999px]" aria-hidden="true"><label>Site web<input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label></div>
            </section>}
          </div>
          {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button type="button" disabled={section === 0 || status === 'sending'} onClick={() => { setSection(v => Math.max(0,v-1)); setError(''); window.scrollTo({top:0,behavior:'smooth'}); }} className="min-h-12 rounded-full border border-black/20 px-7 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30">← Précédent</button>
            {section === 8 ? <button type="button" disabled={status === 'sending'} onClick={send} className="min-h-12 rounded-full bg-black px-8 text-sm font-extrabold text-white disabled:opacity-50">{status === 'sending' ? 'Envoi en cours…' : 'Envoyer mes réponses →'}</button> : <button type="button" onClick={nextSection} className="min-h-12 rounded-full bg-black px-8 text-sm font-extrabold text-white">Suivant →</button>}
          </div>
          <p className="mt-6 text-center text-xs leading-6 text-black/45">La limitation à une participation par navigateur repose sur un cookie technique, sans relier vos réponses à votre identité.</p>
        </div>
      </div>
    </main>
  );
}
