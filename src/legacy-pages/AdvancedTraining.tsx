// ═══════════════════════════════════════════════════════════════════════════
// MODULE DE FORMATION AVANCÉE - PERFECT MODELS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  Play,
  ChevronRight,
  Trophy,
  Target,
  Clock,
  BarChart3,
  Download,
  Share2,
  Star
} from 'lucide-react';
import { TRAINING_MODULES } from '../data/trainingModules';
import { UserProgress, TrainingStats } from '../types/training';
import { getModuleAverageScore, getAppreciationForScore } from '../utils/trainingHelpers';
import SEO from '../components/SEO';

export default function AdvancedTraining() {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [stats, setStats] = useState<TrainingStats>({
    totalModules: TRAINING_MODULES.length,
    completedModules: 0,
    totalChapters: TRAINING_MODULES.reduce((sum, m) => sum + m.chapters.length, 0),
    completedChapters: 0,
    averageQuizScore: 0,
    totalTimeSpent: 0,
    certificatesEarned: 0
  });

  // Charger la progression depuis localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('trainingProgress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setUserProgress(progress);
        calculateStats(progress);
      } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
      }
    }
  }, []);

  const calculateStats = (progress: UserProgress[]) => {
    const completedModules = progress.filter(p => 
      p.completedChapters.length === TRAINING_MODULES.find(m => m.num === p.moduleId)?.chapters.length
    ).length;

    const completedChapters = progress.reduce((sum, p) => sum + p.completedChapters.length, 0);

    const allScores = progress.flatMap(p => 
      Object.values(p.quizScores).map(q => (q.score / q.total) * 100)
    );
    const averageQuizScore = allScores.length > 0 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
      : 0;

    const certificatesEarned = progress.filter(p => p.certificateEarned).length;

    setStats({
      totalModules: TRAINING_MODULES.length,
      completedModules,
      totalChapters: TRAINING_MODULES.reduce((sum, m) => sum + m.chapters.length, 0),
      completedChapters,
      averageQuizScore,
      totalTimeSpent: 0, // À implémenter avec un tracker de temps
      certificatesEarned
    });
  };

  const getModuleProgress = (moduleNum: number): number => {
    const progress = userProgress.find(p => p.moduleId === moduleNum);
    if (!progress) return 0;
    
    const module = TRAINING_MODULES.find(m => m.num === moduleNum);
    if (!module) return 0;

    return (progress.completedChapters.length / module.chapters.length) * 100;
  };

  const isModuleUnlocked = (moduleNum: number): boolean => {
    if (moduleNum === 1) return true;
    
    const previousModule = userProgress.find(p => p.moduleId === moduleNum - 1);
    if (!previousModule) return false;

    const previousModuleData = TRAINING_MODULES.find(m => m.num === moduleNum - 1);
    if (!previousModuleData) return false;

    return previousModule.completedChapters.length === previousModuleData.chapters.length;
  };

  const startModule = (moduleNum: number) => {
    navigate(`/formation/module/${moduleNum}`);
  };

  return (
    <div className="min-h-screen bg-pm-dark">
      <SEO
        title="Formation Avancée — Perfect Models Management"
        description="Programme de formation professionnelle complet pour mannequins. Modules interactifs, quiz et certification."
      />

      {/* ── HERO SECTION ── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pm-gold/10 via-transparent to-purple-500/10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pm-gold/10 border border-pm-gold/30 text-pm-gold text-xs font-bold uppercase tracking-wider mb-6">
              <Award size={14} />
              Formation Professionnelle
            </span>
            <h1 className="text-5xl md:text-6xl font-playfair font-black text-white mb-4">
              Formation Avancée
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Maîtrisez tous les aspects du mannequinat professionnel avec notre programme complet
            </p>
          </div>

          {/* ── STATS CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-pm-gold mb-2">
                {stats.completedModules}/{stats.totalModules}
              </div>
              <div className="text-white/40 text-sm">Modules complétés</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-green-400 mb-2">
                {stats.completedChapters}/{stats.totalChapters}
              </div>
              <div className="text-white/40 text-sm">Chapitres terminés</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">
                {stats.averageQuizScore.toFixed(0)}%
              </div>
              <div className="text-white/40 text-sm">Score moyen</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">
                {stats.certificatesEarned}
              </div>
              <div className="text-white/40 text-sm">Certificats obtenus</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODULES LIST ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="space-y-6">
          {TRAINING_MODULES.map((module) => {
            const progress = getModuleProgress(module.num);
            const isUnlocked = isModuleUnlocked(module.num);
            const isCompleted = progress === 100;

            return (
              <div
                key={module.num}
                className={`group relative bg-white/5 backdrop-blur-sm border rounded-3xl overflow-hidden transition-all ${
                  isUnlocked
                    ? 'border-white/10 hover:border-pm-gold/30 hover:bg-white/10'
                    : 'border-white/5 opacity-60'
                }`}
              >
                {/* Progress bar */}
                {isUnlocked && progress > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-pm-gold to-yellow-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Module number badge */}
                    <div
                      className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                        isCompleted
                          ? 'bg-green-500/20 text-green-400'
                          : isUnlocked
                          ? 'bg-pm-gold/20 text-pm-gold'
                          : 'bg-white/5 text-white/20'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={32} /> : isUnlocked ? module.num : <Lock size={24} />}
                    </div>

                    {/* Module content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-playfair font-bold text-white">
                              {module.title}
                            </h3>
                            {isCompleted && (
                              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                ✓ Complété
                              </span>
                            )}
                            {!isUnlocked && (
                              <span className="px-3 py-1 rounded-full bg-white/10 text-white/40 text-xs font-bold flex items-center gap-1">
                                <Lock size={12} />
                                Verrouillé
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm mb-4">{module.subtitle}</p>
                        </div>
                      </div>

                      {/* Objectifs */}
                      <div className="mb-6">
                        <h4 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Target size={14} />
                          Objectifs d'apprentissage
                        </h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {module.objectifs.slice(0, 4).map((obj, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-white/60 text-sm">
                              <ChevronRight size={16} className="shrink-0 mt-0.5 text-pm-gold" />
                              <span>{obj}</span>
                            </div>
                          ))}
                        </div>
                        {module.objectifs.length > 4 && (
                          <button className="text-pm-gold text-sm mt-2 hover:underline">
                            +{module.objectifs.length - 4} autres objectifs
                          </button>
                        )}
                      </div>

                      {/* Module stats */}
                      <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-white/40">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          <span>{module.chapters.length} chapitres</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>~{module.chapters.length * 15} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} />
                          <span>{module.chapters.reduce((sum, ch) => sum + ch.quiz.length, 0)} questions quiz</span>
                        </div>
                      </div>

                      {/* Module average score and appreciation */}
                      {(() => {
                        const moduleProgress = userProgress.find(p => p.moduleId === module.num);
                        if (!moduleProgress || Object.keys(moduleProgress.quizScores).length === 0) {
                          return null;
                        }

                        const averageScore = getModuleAverageScore(moduleProgress);
                        const appreciation = getAppreciationForScore(
                          Math.round(averageScore), 
                          20
                        );

                        return (
                          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{appreciation.emoji}</span>
                                <div>
                                  <div className={`font-bold text-lg ${appreciation.color}`}>
                                    {averageScore.toFixed(1)}/20
                                  </div>
                                  <div className="text-white/40 text-xs">
                                    {appreciation.label}
                                  </div>
                                </div>
                              </div>
                              {averageScore < 10 && (
                                <div className="text-right">
                                  <div className="text-xs text-red-400 font-bold">
                                    Minimum requis : 10/20
                                  </div>
                                  <div className="text-xs text-white/40">
                                    pour débloquer le suivant
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action button */}
                      <button
                        onClick={() => isUnlocked && startModule(module.num)}
                        disabled={!isUnlocked}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                          isUnlocked
                            ? 'bg-pm-gold text-pm-dark hover:bg-yellow-500'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Trophy size={18} />
                            Revoir le module
                          </>
                        ) : isUnlocked ? (
                          <>
                            <Play size={18} />
                            {progress > 0 ? 'Continuer' : 'Commencer'}
                          </>
                        ) : (
                          <>
                            <Lock size={18} />
                            Terminez le module précédent
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CERTIFICATION INFO ── */}
        <div className="mt-12 bg-gradient-to-br from-pm-gold/10 to-purple-500/10 border border-pm-gold/20 rounded-3xl p-8">
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-pm-gold/20 flex items-center justify-center">
              <Award size={32} className="text-pm-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                Certification Professionnelle
              </h3>
              <p className="text-white/60 mb-4">
                Complétez tous les modules avec un score minimum de 80% pour obtenir votre certificat
                de formation professionnelle Perfect Models Management.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-all text-sm font-bold">
                  <Download size={16} />
                  Télécharger le programme
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 transition-all text-sm font-bold">
                  <Share2 size={16} />
                  Partager ma progression
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
