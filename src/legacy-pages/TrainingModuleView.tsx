// ═══════════════════════════════════════════════════════════════════════════
// VUE DÉTAILLÉE D'UN MODULE DE FORMATION
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Award,
  AlertCircle,
  Lightbulb,
  X,
  Clock
} from 'lucide-react';
import { TRAINING_MODULES } from '../data/trainingModules';
import { TrainingModule, UserProgress } from '../types/training';
import { TRAINING_CONFIG } from '../config/trainingConfig';
import { getAppreciationForScore } from '../utils/trainingHelpers';
import SEO from '../components/SEO';

export default function TrainingModuleView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  
  const [module, setModule] = useState<TrainingModule | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  
  // Timer states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TRAINING_CONFIG.TIME_PER_QUESTION);
  const [quizStarted, setQuizStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    
    const foundModule = TRAINING_MODULES.find(m => m.num === parseInt(moduleId));
    if (!foundModule) {
      navigate('/formation');
      return;
    }
    
    setModule(foundModule);
    loadProgress(parseInt(moduleId));
  }, [moduleId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!showQuiz || !quizStarted || quizSubmitted || !module) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Temps écoulé, passer à la question suivante
          handleTimeUp();
          return TRAINING_CONFIG.TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showQuiz, quizStarted, quizSubmitted, currentQuestionIndex, module]);

  const loadProgress = (modId: number) => {
    const savedProgress = localStorage.getItem('trainingProgress');
    if (savedProgress) {
      try {
        const allProgress: UserProgress[] = JSON.parse(savedProgress);
        const moduleProgress = allProgress.find(p => p.moduleId === modId);
        
        if (moduleProgress) {
          setProgress(moduleProgress);
          // Reprendre au dernier chapitre non complété
          const nextChapter = moduleProgress.completedChapters.length;
          if (nextChapter < (module?.chapters.length || 0)) {
            setCurrentChapterIndex(nextChapter);
          }
        } else {
          // Créer une nouvelle progression
          const newProgress: UserProgress = {
            moduleId: modId,
            chapterIndex: 0,
            completedChapters: [],
            quizScores: {},
            startedAt: new Date().toISOString(),
            lastAccessedAt: new Date().toISOString()
          };
          setProgress(newProgress);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      }
    }
  };

  const saveProgress = (updatedProgress: UserProgress) => {
    const savedProgress = localStorage.getItem('trainingProgress');
    let allProgress: UserProgress[] = [];
    
    if (savedProgress) {
      try {
        allProgress = JSON.parse(savedProgress);
      } catch (error) {
        console.error('Erreur lors du parsing de la progression:', error);
      }
    }
    
    const existingIndex = allProgress.findIndex(p => p.moduleId === updatedProgress.moduleId);
    if (existingIndex >= 0) {
      allProgress[existingIndex] = updatedProgress;
    } else {
      allProgress.push(updatedProgress);
    }
    
    localStorage.setItem('trainingProgress', JSON.stringify(allProgress));
    setProgress(updatedProgress);
  };

  const handleNextChapter = () => {
    if (!module || currentChapterIndex >= module.chapters.length - 1) return;
    setCurrentChapterIndex(currentChapterIndex + 1);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(TRAINING_CONFIG.TIME_PER_QUESTION);
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex <= 0) return;
    setCurrentChapterIndex(currentChapterIndex - 1);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizAnswers({});
    setQuizScore(null);
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setTimeRemaining(TRAINING_CONFIG.TIME_PER_QUESTION);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setTimeRemaining(TRAINING_CONFIG.TIME_PER_QUESTION);
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    if (quizSubmitted) return;
    
    const newAnswers = { ...quizAnswers, [questionIndex]: answerIndex };
    setQuizAnswers(newAnswers);
    
    // Passer automatiquement à la question suivante après un court délai
    if (!module) return;
    const quiz = module.chapters[currentChapterIndex].quiz;
    
    setTimeout(() => {
      if (currentQuestionIndex < quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeRemaining(TRAINING_CONFIG.TIME_PER_QUESTION);
      } else {
        // Dernière question, soumettre automatiquement
        handleSubmitQuiz(newAnswers);
      }
    }, 500);
  };

  const handleTimeUp = () => {
    if (!module) return;
    const quiz = module.chapters[currentChapterIndex].quiz;

    // Si pas de réponse, marquer comme incorrecte (-1)
    const updatedAnswers = { ...quizAnswers };
    if (updatedAnswers[currentQuestionIndex] === undefined) {
      updatedAnswers[currentQuestionIndex] = -1;
    }

    // Passer à la question suivante
    if (currentQuestionIndex < quiz.length - 1) {
      setQuizAnswers(updatedAnswers);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeRemaining(TRAINING_CONFIG.TIME_PER_QUESTION);
    } else {
      // Dernière question, soumettre automatiquement
      handleSubmitQuiz(updatedAnswers);
    }
  };

  const handleSubmitQuiz = (answersParam?: { [key: number]: number }) => {
    if (!module || !progress) return;
    
    const answersToUse = answersParam || quizAnswers;
    const currentChapter = module.chapters[currentChapterIndex];
    let correct = 0;
    
    currentChapter.quiz.forEach((question, idx) => {
      if (answersToUse[idx] === question.correct) {
        correct++;
      }
    });
    
    const total = currentChapter.quiz.length;
    const percentage = (correct / total) * 100;
    const passed = percentage >= TRAINING_CONFIG.PASSING_SCORE; // 50% minimum
    
    setQuizScore({ correct, total });
    setQuizSubmitted(true);
    setQuizStarted(false);
    
    // Arrêter le timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Mettre à jour la progression
    const updatedProgress: UserProgress = {
      ...progress,
      lastAccessedAt: new Date().toISOString(),
      quizScores: {
        ...progress.quizScores,
        [currentChapterIndex]: {
          score: correct,
          total,
          attempts: (progress.quizScores[currentChapterIndex]?.attempts || 0) + 1,
          lastAttempt: new Date().toISOString(),
          passed
        }
      }
    };
    
    // Marquer le chapitre comme complété si réussi et pas déjà complété
    if (passed && !progress.completedChapters.includes(currentChapterIndex)) {
      updatedProgress.completedChapters = [...progress.completedChapters, currentChapterIndex].sort((a, b) => a - b);
    }
    
    saveProgress(updatedProgress);
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setTimeRemaining(TRAINING_CONFIG.TIME_PER_QUESTION);
  };

  if (!module) {
    return (
      <div className="min-h-screen bg-pm-dark flex items-center justify-center">
        <img src="/logo.svg" alt="PMM" className="w-24 h-24 animate-pulse" />
      </div>
    );
  }

  const currentChapter = module.chapters[currentChapterIndex];
  const isChapterCompleted = progress?.completedChapters.includes(currentChapterIndex) || false;
  const chapterQuizScore = progress?.quizScores[currentChapterIndex];

  return (
    <div className="min-h-screen bg-pm-dark">
      <SEO
        title={`${module.title} — Formation Avancée`}
        description={module.subtitle}
      />

      {/* ── HEADER ── */}
      <div className="sticky top-0 z-40 bg-pm-dark/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/formation')}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-bold">Retour aux modules</span>
            </button>
            
            <div className="flex items-center gap-3">
              {/* Timer - visible pendant le quiz */}
              {showQuiz && quizStarted && !quizSubmitted && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold ${
                  timeRemaining <= 3
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                    : 'bg-white/10 border-white/20 text-white'
                }`}>
                  <Clock size={18} />
                  <span>{timeRemaining}s</span>
                </div>
              )}
              
              <span className="text-white/40 text-sm">
                Chapitre {currentChapterIndex + 1}/{module.chapters.length}
              </span>
              {isChapterCompleted && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                  <CheckCircle2 size={14} />
                  Complété
                </span>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pm-gold to-yellow-500 transition-all duration-500"
              style={{ width: `${((currentChapterIndex + 1) / module.chapters.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Module header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-pm-gold/20 flex items-center justify-center text-pm-gold font-black text-xl">
              {module.num}
            </div>
            <div>
              <h1 className="text-3xl font-playfair font-bold text-white">{module.title}</h1>
              <p className="text-white/60 text-sm">{module.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Chapter navigation */}
        <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4">
            Chapitres du module
          </h3>
          <div className="grid gap-2">
            {module.chapters.map((chapter, idx) => {
              const completed = progress?.completedChapters.includes(idx) || false;
              const isCurrent = idx === currentChapterIndex;
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentChapterIndex(idx);
                    setShowQuiz(false);
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizScore(null);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-pm-gold/20 border border-pm-gold/30'
                      : 'bg-white/5 border border-transparent hover:border-white/20'
                  }`}
                >
                  <div className={`shrink-0 ${completed ? 'text-green-400' : 'text-white/30'}`}>
                    {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white/40 text-xs font-bold">Chapitre {idx + 1}</span>
                      {completed && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                    <p className={`text-sm font-bold ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                      {chapter.title}
                    </p>
                  </div>
                  {isCurrent && (
                    <ChevronRight size={20} className="text-pm-gold" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter content or quiz */}
        {!showQuiz ? (
          <div className="space-y-8">
            {/* Chapter title */}
            <div>
              <h2 className="text-3xl font-playfair font-bold text-white mb-4">
                {currentChapter.title}
              </h2>
            </div>

            {/* Chapter content */}
            <div className="prose prose-invert max-w-none">
              {currentChapter.content.map((paragraph, idx) => (
                <p key={idx} className="text-white/70 leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Key points */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-blue-400 font-bold mb-4">
                <Lightbulb size={20} />
                Points clés à retenir
              </h3>
              <ul className="space-y-3">
                {currentChapter.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-white/70">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-blue-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quiz CTA */}
            <div className="bg-gradient-to-br from-pm-gold/10 to-yellow-500/10 border border-pm-gold/20 rounded-2xl p-8 text-center">
              <Award size={48} className="mx-auto text-pm-gold mb-4" />
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                Testez vos connaissances
              </h3>
              <p className="text-white/60 mb-6">
                Répondez au quiz pour valider ce chapitre et débloquer le suivant
              </p>
              {chapterQuizScore && (
                <div className="mb-4 text-sm text-white/60">
                  Meilleur score : {chapterQuizScore.score}/{chapterQuizScore.total} ({Math.round((chapterQuizScore.score / chapterQuizScore.total) * 100)}%)
                </div>
              )}
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 rounded-xl bg-pm-gold text-pm-dark font-bold hover:bg-yellow-500 transition-all"
              >
                Commencer le quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quiz header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-playfair font-bold text-white">
                Quiz : {currentChapter.title}
              </h2>
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setQuizStarted(false);
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                  }
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quiz en cours - Une question à la fois */}
            {quizStarted && !quizSubmitted && (
              <div className="space-y-6">
                {/* Progression */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/40 text-sm font-bold">
                    Question {currentQuestionIndex + 1} / {currentChapter.quiz.length}
                  </span>
                  <div className="flex-1 mx-4 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pm-gold transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / currentChapter.quiz.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-pm-gold text-sm font-bold">
                    {Math.round(((currentQuestionIndex + 1) / currentChapter.quiz.length) * 100)}%
                  </span>
                </div>

                {/* Question actuelle */}
                {(() => {
                  const question = currentChapter.quiz[currentQuestionIndex];
                  const userAnswer = quizAnswers[currentQuestionIndex];

                  return (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-pm-gold/20 flex items-center justify-center text-pm-gold font-black text-xl">
                          {currentQuestionIndex + 1}
                        </div>
                        <h3 className="text-xl font-bold text-white flex-1 leading-relaxed">
                          {question.question}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {question.options.map((option, oIdx) => {
                          const isSelected = userAnswer === oIdx;

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleQuizAnswer(currentQuestionIndex, oIdx)}
                              disabled={userAnswer !== undefined}
                              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                                isSelected
                                  ? 'bg-pm-gold/20 border-pm-gold text-white scale-[1.02]'
                                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10'
                              } ${userAnswer !== undefined ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-pm-gold bg-pm-gold'
                                      : 'border-white/30'
                                  }`}
                                >
                                  {isSelected && (
                                    <CheckCircle2 size={16} className="text-pm-dark" />
                                  )}
                                </div>
                                <span className="text-base">{option}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Résultats du quiz avec appréciation */}
            {quizSubmitted && quizScore && (
              <div className="space-y-6">
                {/* Score et appréciation */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  {/* Score */}
                  <div className="mb-6">
                    <div className="text-6xl font-black text-white mb-2">
                      {quizScore.correct}/{quizScore.total}
                    </div>
                    <div className="text-sm text-white/40 uppercase tracking-wider">
                      Réponses correctes
                    </div>
                  </div>

                  {/* Appréciation */}
                  {(() => {
                    const appreciation = getAppreciationForScore(quizScore.correct, quizScore.total);
                    const percentage = (quizScore.correct / quizScore.total) * 100;
                    const passed = percentage >= TRAINING_CONFIG.PASSING_SCORE;

                    return (
                      <>
                        <div className="mb-6">
                          <div className="text-8xl mb-4 animate-bounce">{appreciation.emoji}</div>
                          <div className={`text-4xl font-bold ${appreciation.color} mb-2`}>
                            {appreciation.label}
                          </div>
                          <div className="text-2xl text-white/60 mb-4">
                            Note : {appreciation.note}/20
                          </div>
                          <div className="text-lg text-white/40">
                            ({Math.round(percentage)}%)
                          </div>
                        </div>

                        {/* Message */}
                        <div className={`p-6 rounded-xl ${
                          passed
                            ? 'bg-green-500/10 border border-green-500/20'
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}>
                          <div className="flex items-center justify-center gap-3 mb-2">
                            {passed ? (
                              <CheckCircle2 size={24} className="text-green-400" />
                            ) : (
                              <AlertCircle size={24} className="text-red-400" />
                            )}
                            <span className={`font-bold text-lg ${
                              passed ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {passed ? 'Chapitre validé !' : 'Score insuffisant'}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            passed ? 'text-green-400/70' : 'text-red-400/70'
                          }`}>
                            {passed
                              ? TRAINING_CONFIG.MESSAGES.quizPassed
                              : TRAINING_CONFIG.MESSAGES.quizFailed
                            }
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Révision des réponses */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-pm-gold" />
                    Révision des réponses
                  </h3>
                  <div className="space-y-4">
                    {currentChapter.quiz.map((question, qIdx) => {
                      const userAnswer = quizAnswers[qIdx];
                      const isCorrect = userAnswer === question.correct;

                      return (
                        <div
                          key={qIdx}
                          className={`p-4 rounded-xl border ${
                            isCorrect
                              ? 'bg-green-500/10 border-green-500/20'
                              : 'bg-red-500/10 border-red-500/20'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                              isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {isCorrect ? '✓' : '✗'}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-bold text-sm mb-2">
                                Question {qIdx + 1}: {question.question}
                              </p>
                              <p className="text-xs text-white/60 mb-2">
                                <strong>Votre réponse :</strong> {userAnswer !== undefined && userAnswer >= 0 ? question.options[userAnswer] : 'Pas de réponse'}
                              </p>
                              {!isCorrect && (
                                <p className="text-xs text-white/60 mb-2">
                                  <strong className="text-green-400">Bonne réponse :</strong> {question.options[question.correct]}
                                </p>
                              )}
                              <p className="text-xs text-white/50 italic">
                                {question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  {(quizScore.correct / quizScore.total) * 100 < TRAINING_CONFIG.PASSING_SCORE && (
                    <button
                      onClick={handleRetryQuiz}
                      className="flex-1 px-6 py-4 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <AlertCircle size={20} />
                      Réessayer le quiz
                    </button>
                  )}
                  {(quizScore.correct / quizScore.total) * 100 >= TRAINING_CONFIG.PASSING_SCORE && currentChapterIndex < module.chapters.length - 1 && (
                    <button
                      onClick={handleNextChapter}
                      className="flex-1 px-6 py-4 rounded-xl bg-pm-gold text-pm-dark font-bold hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                    >
                      Chapitre suivant
                      <ChevronRight size={20} />
                    </button>
                  )}
                  {(quizScore.correct / quizScore.total) * 100 >= TRAINING_CONFIG.PASSING_SCORE && currentChapterIndex === module.chapters.length - 1 && (
                    <button
                      onClick={() => navigate('/formation')}
                      className="flex-1 px-6 py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Award size={20} />
                      Module terminé
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        {!showQuiz && (
          <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-white/10">
            <button
              onClick={handlePreviousChapter}
              disabled={currentChapterIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              Chapitre précédent
            </button>
            
            {currentChapterIndex < module.chapters.length - 1 && (
              <button
                onClick={handleNextChapter}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pm-gold text-pm-dark font-bold hover:bg-yellow-500 transition-all"
              >
                Chapitre suivant
                <ChevronRight size={20} />
              </button>
            )}
            
            {currentChapterIndex === module.chapters.length - 1 && isChapterCompleted && (
              <button
                onClick={() => navigate('/formation')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-all"
              >
                <Award size={20} />
                Module terminé
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
