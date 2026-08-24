// ═══════════════════════════════════════════════════════════════════════════
// TYPES POUR LE MODULE DE FORMATION AVANCÉ
// ═══════════════════════════════════════════════════════════════════════════

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  source?: 'authored' | 'derived';
}

export interface TrainingChapter {
  title: string;
  content: string[];
  keyPoints: string[];
  quiz: QuizQuestion[];
}

export interface TrainingModule {
  num: number;
  title: string;
  subtitle: string;
  objectifs: string[];
  chapters: TrainingChapter[];
}

export interface QuizAttempt {
  score: number;
  total: number;
  attempts: number;
  lastAttempt: string;
  passed: boolean;
  durationSeconds?: number;
  integrityIncidents?: number;
}

export interface ChapterActivity {
  openedAt?: string;
  lastReadAt?: string;
  readingSeconds: number;
  readProgress: number;
  readingValidated?: boolean;
  completedAt?: string;
}

export interface UserProgress {
  moduleId: number;
  chapterIndex: number;
  completedChapters: number[];
  quizScores: Record<number, QuizAttempt>;
  chapterActivity?: Record<number, ChapterActivity>;
  startedAt: string;
  lastAccessedAt: string;
  totalTimeSpentSeconds?: number;
  integrityIncidents?: Array<{
    at: string;
    moduleId: number;
    chapterIndex: number;
    type: 'visibility-hidden' | 'window-blur' | 'reload-attempt' | 'page-leave';
  }>;
  certificateEarned?: boolean;
}

export interface TrainingStats {
  totalModules: number;
  completedModules: number;
  totalChapters: number;
  completedChapters: number;
  averageQuizScore: number;
  totalTimeSpent: number;
  certificatesEarned: number;
}
