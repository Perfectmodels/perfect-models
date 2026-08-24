// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION DU MODULE DE FORMATION — source unique des règles LMS
// ═══════════════════════════════════════════════════════════════════════════

export const TRAINING_CONFIG = {
  PASSING_SCORE: 60,
  QUESTIONS_PER_QUIZ: 30,
  TIME_PER_QUESTION: 20,
  MAX_QUIZ_ATTEMPTS: 3,
  CERTIFICATE_VALIDITY_DAYS: 0,
  PROGRESSIVE_UNLOCK: true,
  ESTIMATED_TIME_PER_CHAPTER: 20,
  CERTIFICATES_ENABLED: true,
  SOCIAL_SHARING_ENABLED: true,
  DETAILED_STATS_ENABLED: true,
  MIN_READING_PROGRESS_BEFORE_QUIZ: 90,
  MIN_READING_SECONDS_BEFORE_QUIZ: 60,
  MAX_INTEGRITY_INCIDENTS: 3,
  AUTO_SUBMIT_ON_MAX_INTEGRITY_INCIDENTS: true,

  THEME: {
    primary: 'pm-gold', secondary: 'purple-500', success: 'green-500', warning: 'yellow-500', error: 'red-500', info: 'blue-500'
  },

  MESSAGES: {
    quizPassed: 'Félicitations. Ce chapitre est validé.',
    quizFailed: 'Score insuffisant. Le minimum requis est de 60 %. Relisez le chapitre avant une nouvelle tentative.',
    moduleCompleted: 'Module terminé. Vous pouvez passer au suivant.',
    certificateEarned: 'Certificat obtenu. Vous pouvez le retrouver dans votre profil.',
    moduleLockedTitle: 'Module verrouillé',
    moduleLockedMessage: 'Validez le module précédent pour débloquer celui-ci.',
    examWarning: 'Évaluation surveillée : ne quittez pas cette page, ne changez pas d’onglet et n’actualisez pas le site pendant le quiz. Toute interruption est enregistrée.',
  },

  APPRECIATIONS: {
    excellent: { min: 18, max: 20, label: 'Excellent', emoji: '🌟', color: 'text-yellow-400' },
    tresBien: { min: 16, max: 17, label: 'Très Bien', emoji: '⭐', color: 'text-green-400' },
    bien: { min: 14, max: 15, label: 'Bien', emoji: '👍', color: 'text-blue-400' },
    assezBien: { min: 12, max: 13, label: 'Assez Bien', emoji: '👌', color: 'text-cyan-400' },
    passable: { min: 10, max: 11, label: 'Passable', emoji: '✓', color: 'text-gray-400' },
    insuffisant: { min: 0, max: 9, label: 'Insuffisant', emoji: '❌', color: 'text-red-400' }
  },

  BADGES: {
    firstChapter: { name: 'Premier Pas', description: 'Complétez votre premier chapitre', icon: '🎯' },
    firstModule: { name: 'Débutant Déterminé', description: 'Complétez votre premier module', icon: '📚' },
    perfectScore: { name: 'Score Parfait', description: 'Obtenez 100% à un quiz', icon: '⭐' },
    allModules: { name: 'Expert Certifié', description: 'Complétez tous les modules', icon: '🏆' },
    weekStreak: { name: 'Assidu', description: 'Étudiez 7 jours consécutifs', icon: '🔥' }
  },

  STORAGE: {
    localStorageKey: 'trainingProgress',
    autoSaveEnabled: true,
    cloudSyncEnabled: true,
    syncInterval: 15000
  },

  NOTIFICATIONS: { enabled: true, reminderAfterDays: 3, congratulationsOnCompletion: true, newModuleUnlocked: true },
  ANALYTICS: { enabled: true, trackQuizAttempts: true, trackTimeSpent: true, trackChapterViews: true },
  LIMITS: { maxChaptersPerDay: 0, minTimeBetweenQuizAttempts: 30, maxCertificatesPerUser: 0 },
  EXPERIMENTAL: { aiAssistant: false, peerReview: false, liveClasses: false, gamification: true }
};

export type TrainingConfigType = typeof TRAINING_CONFIG;
export const getPassingScore = () => TRAINING_CONFIG.PASSING_SCORE;
export const isProgressiveUnlockEnabled = () => TRAINING_CONFIG.PROGRESSIVE_UNLOCK;
export const areCertificatesEnabled = () => TRAINING_CONFIG.CERTIFICATES_ENABLED;
export const getEstimatedTime = (chaptersCount: number) => chaptersCount * TRAINING_CONFIG.ESTIMATED_TIME_PER_CHAPTER;
export const getAppreciation = (score: number, total: number) => {
  const note = total > 0 ? Math.round((score / total) * 20) : 0;
  for (const value of Object.values(TRAINING_CONFIG.APPRECIATIONS)) {
    if (note >= value.min && note <= value.max) return { ...value, note };
  }
  return { ...TRAINING_CONFIG.APPRECIATIONS.insuffisant, note };
};
export const validateConfig = () => TRAINING_CONFIG.PASSING_SCORE >= 0 && TRAINING_CONFIG.PASSING_SCORE <= 100 && TRAINING_CONFIG.QUESTIONS_PER_QUIZ > 0;
