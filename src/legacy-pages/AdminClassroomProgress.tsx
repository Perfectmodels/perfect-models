import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';

const AdminClassroomProgress: React.FC = () => {
  const { data } = useData();
  const models = data?.models ?? [];
  const courseData = data?.courseData ?? [];
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterMin, setFilterMin] = useState(0);

  const totalChapters = courseData.reduce((acc, mod) => acc + mod.chapters.length, 0);
  const totalQuizzes = courseData.reduce((acc, mod) => acc + (mod.quiz?.length > 0 ? 1 : 0), 0);

  const modelStats = models.map(m => {
    const scores = m.quizScores ?? {};
    const completedChapters = Object.keys(scores).length;
    const passedQuizzes = Object.values(scores).filter(s => s.score >= s.total * 0.6).length;
    const progress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    const avgScore = Object.values(scores).length > 0
      ? Object.values(scores).reduce((sum, s) => sum + (s.total > 0 ? s.score / s.total : 0), 0) / Object.values(scores).length * 100
      : 0;
    return { ...m, completedChapters, passedQuizzes, progress, avgScore, scores };
  }).filter(m => m.progress >= filterMin).sort((a, b) => b.progress - a.progress);

  const getProgressColor = (p: number) => p >= 75 ? 'bg-green-500' : p >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Progression Classroom" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair text-pm-gold">Progression Classroom</h1>
            <p className="text-pm-off-white/40 text-sm mt-1">{totalChapters} chapitres · {totalQuizzes} quiz · {models.length} mannequins</p>
          </div>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Mannequins actifs', value: modelStats.filter(m => m.progress > 0).length },
            { label: 'Progression moy.', value: `${Math.round(modelStats.reduce((s, m) => s + m.progress, 0) / (modelStats.length || 1))}%` },
            { label: '> 75% complété', value: modelStats.filter(m => m.progress >= 75).length },
            { label: 'Aucune activité', value: modelStats.filter(m => m.progress === 0).length },
          ].map(stat => (
            <div key={stat.label} className="bg-black/40 border border-pm-gold/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-playfair font-black text-pm-gold">{stat.value}</p>
              <p className="text-xs text-pm-off-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filtre */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-pm-off-white/40 uppercase tracking-widest">Progression min.</span>
          {[0, 25, 50, 75].map(v => (
            <button key={v} onClick={() => setFilterMin(v)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterMin === v ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
              {v === 0 ? 'Tous' : `≥ ${v}%`}
            </button>
          ))}
        </div>

        {/* Tableau */}
        <div className="space-y-2">
          {modelStats.map(m => (
            <div key={m.id} className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(expanded === m.id ? null : m.id)}>
                {m.imageUrl
                  ? <img src={m.imageUrl} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-pm-gold/20 flex items-center justify-center flex-shrink-0"><AcademicCapIcon className="w-5 h-5 text-pm-gold/60" /></div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold truncate">{m.name}</span>
                    <span className={`text-xs font-black ml-2 flex-shrink-0 ${m.progress >= 75 ? 'text-green-400' : m.progress >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{m.progress}%</span>
                  </div>
                  <div className="w-full bg-pm-dark/80 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${getProgressColor(m.progress)}`} style={{ width: `${m.progress}%` }} />
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-pm-off-white/40">{m.completedChapters}/{totalChapters} chapitres</span>
                    <span className="text-xs text-pm-off-white/40">{m.passedQuizzes} quiz réussis</span>
                    {m.avgScore > 0 && <span className="text-xs text-pm-off-white/40">Moy. {Math.round(m.avgScore)}%</span>}
                  </div>
                </div>
                {expanded === m.id ? <ChevronUpIcon className="w-4 h-4 text-pm-gold/40 flex-shrink-0" /> : <ChevronDownIcon className="w-4 h-4 text-pm-gold/40 flex-shrink-0" />}
              </div>

              {/* Détail par module */}
              {expanded === m.id && (
                <div className="border-t border-pm-gold/10 p-4 space-y-3">
                  {courseData.map(mod => {
                    const modChapters = mod.chapters;
                    const modCompleted = modChapters.filter(ch => m.scores[ch.slug]).length;
                    const modProgress = modChapters.length > 0 ? Math.round((modCompleted / modChapters.length) * 100) : 0;
                    return (
                      <div key={mod.slug}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-pm-off-white/70">{mod.title}</span>
                          <span className="text-xs text-pm-off-white/40">{modCompleted}/{modChapters.length}</span>
                        </div>
                        <div className="w-full bg-pm-dark/80 rounded-full h-1">
                          <div className={`h-1 rounded-full ${getProgressColor(modProgress)}`} style={{ width: `${modProgress}%` }} />
                        </div>
                        {modChapters.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {modChapters.map(ch => {
                              const score = m.scores[ch.slug];
                              return (
                                <span key={ch.slug} title={score ? `${score.score}/${score.total}` : 'Non complété'}
                                  className={`text-xs px-2 py-0.5 rounded-full border ${score ? (score.score >= score.total * 0.6 ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30') : 'bg-pm-dark border-pm-gold/10 text-pm-off-white/30'}`}>
                                  {ch.title.length > 20 ? ch.title.slice(0, 20) + '…' : ch.title}
                                  {score && ` · ${score.score}/${score.total}`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {modelStats.length === 0 && <p className="text-center p-8 text-pm-off-white/40">Aucun mannequin.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminClassroomProgress;
