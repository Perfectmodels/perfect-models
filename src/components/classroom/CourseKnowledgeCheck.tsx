'use client';

import { useMemo, useState } from 'react';

type QuizQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
};

export default function CourseKnowledgeCheck({ questions }: { questions: QuizQuestion[] }) {
  const safeQuestions = useMemo(
    () => questions.filter((item) => item.question && Array.isArray(item.options) && item.options.length >= 2),
    [questions],
  );
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!safeQuestions.length) return null;

  const item = safeQuestions[current];
  const isCorrect = selected === item.correct;

  function validate() {
    if (selected === null || validated) return;
    if (selected === item.correct) setScore((value) => value + 1);
    setValidated(true);
  }

  function next() {
    if (!validated) return;
    if (current >= safeQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setCurrent((value) => value + 1);
    setSelected(null);
    setValidated(false);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setValidated(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const percent = Math.round((score / safeQuestions.length) * 100);
    return (
      <section className="rounded-[2rem] border border-pm-ink/[.08] bg-white p-7 sm:p-9">
        <p className="control-kicker">Test de raisonnement et de maîtrise PMM</p>
        <h2 className="mt-2 font-playfair text-4xl font-semibold">Résultat : {score}/{safeQuestions.length}</h2>
        <p className="mt-4 text-sm leading-7 text-pm-ink/55">
          {percent >= 70
            ? 'Chapitre maîtrisé. Vous pouvez poursuivre votre progression.'
            : 'Relisez les points essentiels du chapitre puis recommencez le test.'}
        </p>
        <button type="button" onClick={restart} className="mt-6 rounded-full bg-pm-wine px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-white">
          Recommencer
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-pm-ink/[.08] bg-white p-7 sm:p-9">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="control-kicker">Test de raisonnement et de maîtrise PMM</p>
          <h2 className="mt-2 font-playfair text-4xl font-semibold">Vérifiez votre compréhension</h2>
        </div>
        <span className="rounded-full bg-pm-sage px-4 py-2 text-[8px] font-black uppercase tracking-[.15em] text-pm-teal">
          Question {current + 1}/{safeQuestions.length}
        </span>
      </div>

      <p className="mt-7 text-base font-semibold leading-7 text-pm-ink/75">{item.question}</p>

      <div className="mt-5 grid gap-3">
        {item.options.map((option, index) => {
          const active = selected === index;
          const revealCorrect = validated && index === item.correct;
          const revealWrong = validated && active && index !== item.correct;
          return (
            <button
              key={`${option}-${index}`}
              type="button"
              disabled={validated}
              onClick={() => setSelected(index)}
              className={`rounded-[1.25rem] border p-4 text-left text-sm leading-6 transition ${
                revealCorrect
                  ? 'border-pm-teal bg-pm-sage text-pm-ink'
                  : revealWrong
                    ? 'border-pm-coral bg-pm-peach text-pm-ink'
                    : active
                      ? 'border-pm-wine bg-pm-wine text-white'
                      : 'border-pm-ink/10 bg-pm-paper text-pm-ink/65 hover:border-pm-wine/35'
              }`}
            >
              <span className="mr-3 font-black">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {validated && (
        <div className={`mt-5 rounded-[1.25rem] p-4 text-sm leading-6 ${isCorrect ? 'bg-pm-sage' : 'bg-pm-peach'}`}>
          <strong>{isCorrect ? 'Bonne réponse.' : 'Réponse à revoir.'}</strong>{' '}
          {item.explanation || 'Reprenez les points essentiels du chapitre avant de continuer.'}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {!validated ? (
          <button type="button" disabled={selected === null} onClick={validate} className="rounded-full bg-pm-wine px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-white disabled:cursor-not-allowed disabled:opacity-35">
            Valider ma réponse
          </button>
        ) : (
          <button type="button" onClick={next} className="rounded-full bg-pm-coral px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-white">
            {current === safeQuestions.length - 1 ? 'Voir mon résultat' : 'Question suivante'}
          </button>
        )}
      </div>
    </section>
  );
}
