import type { QuizQuestion, TrainingChapter } from '@/types/training';
import { TRAINING_CONFIG } from '@/config/trainingConfig';

const PROMPTS = [
  'Selon le chapitre, cette affirmation fait-elle partie des points essentiels à retenir ?',
  'Le cours présenté confirme-t-il l’affirmation suivante ?',
  'Cette idée est-elle conforme au contenu étudié dans ce chapitre ?',
  'D’après les notions du chapitre, peut-on considérer cette affirmation comme correcte ?',
  'Le chapitre recommande-t-il de retenir le principe suivant ?',
];

function derivedQuestion(statement: string, index: number): QuizQuestion {
  return {
    question: `${PROMPTS[index % PROMPTS.length]} « ${statement} »`,
    options: ['Oui, cette affirmation est conforme au cours', 'Non, cette affirmation contredit le cours'],
    correct: 0,
    explanation: `Cette affirmation reprend directement une notion du chapitre : ${statement}`,
    source: 'derived',
  };
}

/**
 * Retourne exactement le nombre de questions attendu pour un chapitre.
 * Les questions éditoriales sont prioritaires. Si le chapitre en contient moins,
 * on complète avec des contrôles de compréhension issus des points clés et du texte.
 */
export function buildChapterQuiz(chapter: TrainingChapter): QuizQuestion[] {
  const target = TRAINING_CONFIG.QUESTIONS_PER_QUIZ;
  const authored = (chapter.quiz || []).map((q) => ({ ...q, source: q.source || 'authored' as const }));
  if (authored.length >= target) return authored.slice(0, target);

  const statements = [
    ...(chapter.keyPoints || []),
    ...(chapter.content || []).flatMap((paragraph) =>
      paragraph
        .split(/[.!?](?:\s|$)/)
        .map((part) => part.trim())
        .filter((part) => part.length >= 35 && part.length <= 220),
    ),
  ];

  const uniqueStatements = Array.from(new Set(statements.map((s) => s.trim()).filter(Boolean)));
  const generated: QuizQuestion[] = [];
  let cursor = 0;
  while (authored.length + generated.length < target && uniqueStatements.length) {
    const statement = uniqueStatements[cursor % uniqueStatements.length];
    generated.push(derivedQuestion(statement, cursor));
    cursor += 1;
  }

  return [...authored, ...generated].slice(0, target);
}
