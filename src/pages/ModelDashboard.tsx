import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon, UserIcon, ArrowRightOnRectangleIcon, EnvelopeIcon,
  CheckCircleIcon, CalendarDaysIcon, MapPinIcon, ChartBarIcon,
  SparklesIcon, ClockIcon, TrophyIcon, CameraIcon,
  ChevronDownIcon, ChevronUpIcon, ExclamationCircleIcon, LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Model, PhotoshootBrief } from '../types';
import ModelForm from '../components/ModelForm';
import ChangePasswordModal from '../components/ChangePasswordModal';

type TabId = 'profile' | 'results' | 'briefs';

const ModelDashboard: React.FC = () => {
  const { data, saveData } = useData();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const userId = authUser?.userId ?? null;
  const perms = authUser?.permissions;

  // Onglets filtrés selon les permissions
  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'profile',  label: 'Mon Profil',    icon: UserIcon },
    ...(perms?.canViewResults !== false  ? [{ id: 'results' as TabId,  label: 'Mes Résultats', icon: ChartBarIcon }] : []),
    ...(perms?.canViewPhotoshootBriefs !== false ? [{ id: 'briefs' as TabId, label: 'Briefings', icon: EnvelopeIcon }] : []),
  ];
  const [editableModel, setEditableModel] = useState<Model | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [expandedBriefId, setExpandedBriefId] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const originalModel = data?.models.find(m => m.id === userId);
  const courseModules = data?.courseData?.filter(m => m.quiz && m.quiz.length > 0) || [];
  const myBriefs = (data?.photoshootBriefs ?? [])
    .filter(b => b.modelId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const newBriefsCount = myBriefs.filter(b => b.status === 'Nouveau').length;

  useEffect(() => {
    if (originalModel) setEditableModel(JSON.parse(JSON.stringify(originalModel)));
  }, [originalModel]);

  // Stats
  const stats = useMemo(() => {
    if (!editableModel) return { completed: 0, total: 0, avgScore: 0, bestScore: 0 };
    const scores = Object.values(editableModel.quizScores ?? {});
    const completed = scores.length;
    const total = courseModules.length;
    const avgScore = completed > 0 ? Math.round(scores.reduce((s, q) => s + (q.score / q.total) * 100, 0) / completed) : 0;
    const bestScore = completed > 0 ? Math.round(Math.max(...scores.map(q => (q.score / q.total) * 100))) : 0;
    return { completed, total, avgScore, bestScore };
  }, [editableModel, courseModules]);

  const handleSave = async (updatedModel: Model) => {
    if (!data) return;
    await saveData({ ...data, models: data.models.map(m => m.id === updatedModel.id ? updatedModel : m) });
    alert('Profil mis à jour avec succès.');
  };

  const handleCancel = () => {
    if (originalModel) {
      setEditableModel(JSON.parse(JSON.stringify(originalModel)));
      alert('Les modifications ont été annulées.');
    }
  };

  const { logout } = useAuth();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleToggleBrief = async (briefId: string) => {
    const newId = expandedBriefId === briefId ? null : briefId;
    setExpandedBriefId(newId);
    if (newId) {
      const brief = myBriefs.find(b => b.id === briefId);
      if (brief?.status === 'Nouveau' && data) {
        await saveData({ ...data, photoshootBriefs: data.photoshootBriefs.map(b => b.id === briefId ? { ...b, status: 'Lu' as const } : b) });
      }
    }
  };

  const getScoreColor = (pct: number) => pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400';
  const getScoreBg = (pct: number) => pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  if (!editableModel) {
    return (
      <div className="bg-pm-dark min-h-screen flex items-center justify-center">
        <div className="w-12 h-px bg-pm-gold animate-pulse" />
      </div>
    );
  }

  const firstName = editableModel.name.split(' ')[0];
  const levelColor = editableModel.level === 'Pro' ? 'text-pm-gold border-pm-gold/40 bg-pm-gold/10' : 'text-white/50 border-white/10 bg-white/5';

  return (
    <div className="bg-pm-dark text-pm-off-white min-h-screen">
      <SEO title={`Espace de ${editableModel.name}`} noIndex />

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-pm-dark/80 backdrop-blur-xl px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold">PMM</Link>
          <span className="text-white/10">|</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Espace Mannequin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to={`/mannequins/${editableModel.id}`}
            className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-pm-gold transition-colors hidden sm:block">
            Portfolio Public
          </Link>
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-pm-gold transition-colors hidden sm:flex"
          >
            <LockClosedIcon className="w-4 h-4" /> Mot de passe
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-red-400 transition-colors">
            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-white/5 p-8 shrink-0">
          {/* Avatar + identité */}
          <div className="mb-10">
            <div className="relative w-20 h-20 mb-4">
              {editableModel.imageUrl ? (
                <img src={editableModel.imageUrl} alt={editableModel.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-pm-gold/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-pm-gold/10 border-2 border-pm-gold/20 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-pm-gold/40" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-pm-dark rounded-full" />
            </div>
            <p className="text-xl font-playfair font-black text-white">{editableModel.name}</p>
            <p className="text-xs text-white/30 mt-0.5">{editableModel.location || 'Libreville, Gabon'}</p>
            <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded-full border ${levelColor}`}>
              {editableModel.level || 'Débutant'}
            </span>
          </div>

          {/* Stats rapides */}
          <div className="space-y-3 mb-10">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Quiz complétés</span>
              <span className="text-sm font-black text-pm-gold">{stats.completed}/{stats.total}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Score moyen</span>
              <span className={`text-sm font-black ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Meilleur score</span>
              <span className={`text-sm font-black ${getScoreColor(stats.bestScore)}`}>{stats.bestScore}%</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Briefings</span>
              <span className="text-sm font-black text-white">{myBriefs.length}
                {newBriefsCount > 0 && <span className="ml-1 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{newBriefsCount}</span>}
              </span>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-2 mt-auto">
            {perms?.canAccessFormation !== false && (
              <Link to="/formation"
                className="flex items-center gap-3 p-3 border border-white/5 hover:border-pm-gold/30 hover:bg-pm-gold/5 transition-all group">
                <BookOpenIcon className="w-4 h-4 text-pm-gold/60 group-hover:text-pm-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Formation Avancée</span>
              </Link>
            )}
            {perms?.canEditProfile !== false && (
              <Link to={`/mannequins/${editableModel.id}`}
                className="flex items-center gap-3 p-3 border border-white/5 hover:border-pm-gold/30 hover:bg-pm-gold/5 transition-all group">
                <CameraIcon className="w-4 h-4 text-pm-gold/60 group-hover:text-pm-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Portfolio Public</span>
              </Link>
            )}
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center gap-3 p-3 border border-white/5 hover:border-pm-gold/30 hover:bg-pm-gold/5 transition-all group text-left"
            >
              <LockClosedIcon className="w-4 h-4 text-pm-gold/60 group-hover:text-pm-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Changer mon mot de passe</span>
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {/* Greeting */}
          <div className="mb-8">
            <span className="section-label">Bienvenue</span>
            <h1 className="text-3xl md:text-4xl font-playfair font-black text-white">
              Bonjour, <span className="gold-gradient-text">{firstName}</span>
            </h1>
          </div>

          {/* KPI cards (mobile: visible, desktop: visible) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Quiz complétés', value: `${stats.completed}/${stats.total}`, icon: BookOpenIcon, color: 'text-pm-gold' },
              { label: 'Score moyen', value: `${stats.avgScore}%`, icon: ChartBarIcon, color: getScoreColor(stats.avgScore) },
              { label: 'Meilleur score', value: `${stats.bestScore}%`, icon: TrophyIcon, color: getScoreColor(stats.bestScore) },
              { label: 'Briefings', value: String(myBriefs.length), icon: EnvelopeIcon, color: 'text-white/60', badge: newBriefsCount },
            ].map(card => (
              <div key={card.label} className="glass-card p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center shrink-0 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 truncate">{card.label}</p>
                  <p className={`text-2xl font-playfair font-black ${card.color}`}>
                    {card.value}
                    {(card.badge ?? 0) > 0 && (
                      <span className="ml-1 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full align-middle">{card.badge}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/5 mb-8">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isBriefs = tab.id === 'briefs';
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] border-b-2 -mb-px transition-all ${
                    activeTab === tab.id ? 'border-pm-gold text-pm-gold' : 'border-transparent text-white/30 hover:text-white/60'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {isBriefs && newBriefsCount > 0 && (
                    <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{newBriefsCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Tab: Profil ── */}
          {activeTab === 'profile' && (
            <ModelForm model={editableModel} onSave={handleSave} onCancel={handleCancel} mode="model" isCreating={false} />
          )}

          {/* ── Tab: Résultats ── */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Progression globale */}
              {stats.total > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Progression Globale</h3>
                    <span className="text-sm font-black text-white">{stats.completed}/{stats.total} modules</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                    <div className="bg-pm-gold h-2 rounded-full transition-all duration-700"
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">
                    <span>Début</span>
                    <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                    <span>Fin</span>
                  </div>
                </div>
              )}

              {/* Liste des modules */}
              <div className="glass-card overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                    <SparklesIcon className="w-4 h-4 text-pm-gold" /> Résultats par Module
                  </h3>
                </div>
                {courseModules.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {courseModules.map(module => {
                      const scoreData = editableModel.quizScores?.[module.slug];
                      const pct = scoreData ? Math.round((scoreData.score / scoreData.total) * 100) : null;
                      return (
                        <div key={module.slug} className="flex items-center gap-4 px-6 py-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pct !== null ? 'bg-black/40' : 'bg-white/5'}`}>
                            {pct !== null ? (
                              <TrophyIcon className={`w-5 h-5 ${getScoreColor(pct)}`} />
                            ) : (
                              <ClockIcon className="w-5 h-5 text-white/20" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/80 truncate">{module.title}</p>
                            {pct !== null ? (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                                  <div className={`h-1.5 rounded-full ${getScoreBg(pct)}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={`text-[10px] font-black ${getScoreColor(pct)}`}>{pct}%</span>
                              </div>
                            ) : (
                              <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest font-black">Non complété</p>
                            )}
                          </div>
                          {pct !== null && (
                            <div className={`text-right shrink-0`}>
                              <p className={`text-2xl font-playfair font-black ${getScoreColor(pct)}`}>{pct}%</p>
                              <p className="text-[9px] text-white/20 uppercase tracking-widest">{scoreData!.score}/{scoreData!.total}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-white/20 text-xs italic">Aucun quiz disponible pour le moment.</div>
                )}
              </div>

              {stats.completed === 0 && (
                <div className="glass-card p-8 text-center">
                  <BookOpenIcon className="w-12 h-12 text-pm-gold/20 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">Commencez votre formation pour voir vos résultats ici.</p>
                  <Link to="/formation" className="inline-block mt-4 btn-premium !py-2 !px-6 !text-[10px]">Accéder à la Formation Avancée</Link>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Briefings ── */}
          {activeTab === 'briefs' && (
            <div className="space-y-4">
              {myBriefs.length > 0 ? (
                <>
                  {newBriefsCount > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-pm-gold/5 border border-pm-gold/20 rounded-xl">
                      <ExclamationCircleIcon className="w-5 h-5 text-pm-gold shrink-0" />
                      <p className="text-sm text-pm-gold font-medium">
                        Vous avez <span className="font-black">{newBriefsCount}</span> nouveau{newBriefsCount > 1 ? 'x' : ''} briefing{newBriefsCount > 1 ? 's' : ''} à consulter.
                      </p>
                    </div>
                  )}
                  {myBriefs.map(brief => (
                    <BriefItem key={brief.id} brief={brief} expandedBriefId={expandedBriefId} onToggle={handleToggleBrief} />
                  ))}
                </>
              ) : (
                <div className="glass-card p-12 text-center">
                  <EnvelopeIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-sm italic">Votre boîte de réception est vide.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

const BriefItem: React.FC<{
  brief: PhotoshootBrief;
  expandedBriefId: string | null;
  onToggle: (id: string) => void;
}> = ({ brief, expandedBriefId, onToggle }) => {
  const isExpanded = expandedBriefId === brief.id;
  const isNew = brief.status === 'Nouveau';

  return (
    <div className={`glass-card overflow-hidden transition-all ${isNew ? 'border-pm-gold/30' : ''}`}>
      <button onClick={() => onToggle(brief.id)}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isNew ? 'bg-pm-gold/20' : 'bg-white/5'}`}>
            {isNew
              ? <span className="w-2.5 h-2.5 bg-pm-gold rounded-full animate-pulse" />
              : <CheckCircleIcon className="w-4 h-4 text-green-500" />
            }
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate ${isNew ? 'text-pm-gold' : 'text-white/80'}`}>{brief.theme}</p>
            <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest font-black">
              {new Date(brief.dateTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isNew && <span className="text-[9px] font-black uppercase tracking-widest text-pm-gold bg-pm-gold/10 px-2 py-1 rounded-full">Nouveau</span>}
          {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-white/30" /> : <ChevronDownIcon className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 bg-black/40 rounded-xl">
              <CalendarDaysIcon className="w-5 h-5 text-pm-gold shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Date & Heure</p>
                <p className="text-sm font-medium text-white mt-0.5">
                  {new Date(brief.dateTime).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-black/40 rounded-xl">
              <MapPinIcon className="w-5 h-5 text-pm-gold shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Lieu</p>
                <p className="text-sm font-medium text-white mt-0.5">{brief.location}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-black/40 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-pm-gold mb-2">Style Vestimentaire</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{brief.clothingStyle}</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-pm-gold mb-2">Accessoires</p>
              <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{brief.accessories}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDashboard;
