import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
  MapPinIcon,
  PencilSquareIcon,
  SparklesIcon,
  TrophyIcon,
  UserCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ModelForm from '../components/ModelForm';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';
import { Model, PhotoshootBrief } from '../types';

type TabId = 'overview' | 'profile' | 'training' | 'briefs';

type ProfileCheck = {
  label: string;
  ok: boolean;
  description: string;
};

const ModelDashboard: React.FC = () => {
  const { data, saveData, updateDocument } = useData();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const perms = authUser?.permissions;
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [editableModel, setEditableModel] = useState<Model | null>(null);
  const [expandedBriefId, setExpandedBriefId] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const briefsCollection = useFirebaseCollection<PhotoshootBrief>('photoshootBriefs', { pageSize: 1000, orderBy: 'createdAt' });

  const originalModel = useMemo(() => {
    const models = data?.models ?? [];
    if (!authUser) return undefined;
    return models.find(model =>
      model.id === authUser.userId ||
      model.firebaseUid === authUser.uid ||
      (Boolean(authUser.email) && model.email?.toLowerCase() === authUser.email?.toLowerCase())
    );
  }, [data?.models, authUser]);

  useEffect(() => {
    if (originalModel) setEditableModel(JSON.parse(JSON.stringify(originalModel)));
  }, [originalModel]);

  const courseModules = useMemo(
    () => (data?.courseData ?? []).filter(module => module.quiz && module.quiz.length > 0),
    [data?.courseData]
  );

  const myBriefs = useMemo(() => {
    if (!editableModel) return [];
    return briefsCollection.items
      .filter(brief => brief.modelId === editableModel.id || brief.modelId === authUser?.userId)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [briefsCollection.items, editableModel, authUser?.userId]);

  const upcomingBriefs = useMemo(
    () => myBriefs
      .filter(brief => new Date(brief.dateTime).getTime() >= Date.now())
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
    [myBriefs]
  );

  const newBriefsCount = myBriefs.filter(brief => brief.status === 'Nouveau').length;

  const stats = useMemo(() => {
    if (!editableModel) return { completed: 0, total: 0, avgScore: 0, bestScore: 0, progress: 0 };
    const scores = Object.values(editableModel.quizScores ?? {});
    const completed = scores.length;
    const total = courseModules.length;
    const avgScore = completed
      ? Math.round(scores.reduce((sum, score) => sum + (score.score / score.total) * 100, 0) / completed)
      : 0;
    const bestScore = completed
      ? Math.round(Math.max(...scores.map(score => (score.score / score.total) * 100)))
      : 0;
    return {
      completed,
      total,
      avgScore,
      bestScore,
      progress: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [editableModel, courseModules]);

  const profileChecks = useMemo<ProfileCheck[]>(() => {
    if (!editableModel) return [];
    return [
      { label: 'Adresse email', ok: Boolean(editableModel.email), description: 'Nécessaire pour les accès et notifications.' },
      { label: 'Téléphone de contact', ok: Boolean(editableModel.phone), description: 'Coordonnée professionnelle de contact.' },
      { label: 'Photo principale', ok: Boolean(editableModel.imageUrl), description: 'Photo de couverture du profil public.' },
      { label: 'Portfolio', ok: Boolean(editableModel.portfolioImages?.length), description: 'Au moins une image complémentaire.' },
      { label: 'Localisation', ok: Boolean(editableModel.location), description: 'Ville ou zone de disponibilité.' },
      { label: 'Catégories', ok: Boolean(editableModel.categories?.length), description: 'Défilé, éditorial, commercial, etc.' },
      { label: 'Expérience', ok: Boolean(editableModel.experience?.trim()), description: 'Présentation de l’expérience professionnelle.' },
      { label: 'Mensurations', ok: Boolean(editableModel.measurements?.chest && editableModel.measurements?.waist && editableModel.measurements?.hips && editableModel.measurements?.shoeSize), description: 'Poitrine, taille, hanches et pointure.' },
    ];
  }, [editableModel]);

  const profileCompleteness = profileChecks.length
    ? Math.round((profileChecks.filter(check => check.ok).length / profileChecks.length) * 100)
    : 0;
  const missingChecks = profileChecks.filter(check => !check.ok);

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Accueil', icon: SparklesIcon },
    ...(perms?.canEditProfile !== false ? [{ id: 'profile' as TabId, label: 'Mon profil', icon: UserIcon }] : []),
    ...(perms?.canViewResults !== false ? [{ id: 'training' as TabId, label: 'Formation', icon: AcademicCapIcon }] : []),
    ...(perms?.canViewPhotoshootBriefs !== false ? [{ id: 'briefs' as TabId, label: 'Briefings', icon: EnvelopeIcon }] : []),
  ];

  const handleSave = async (updatedModel: Model) => {
    if (!data) return;
    await saveData({ ...data, models: data.models.map(model => model.id === updatedModel.id ? updatedModel : model) });
    setEditableModel(JSON.parse(JSON.stringify(updatedModel)));
    setSaveMessage('Profil mis à jour avec succès.');
    window.setTimeout(() => setSaveMessage(''), 3500);
  };

  const handleCancel = () => {
    if (originalModel) setEditableModel(JSON.parse(JSON.stringify(originalModel)));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleToggleBrief = async (briefId: string) => {
    const nextId = expandedBriefId === briefId ? null : briefId;
    setExpandedBriefId(nextId);
    if (!nextId) return;
    const brief = myBriefs.find(item => item.id === briefId);
    if (brief?.status === 'Nouveau') {
      try {
        await updateDocument('photoshootBriefs', brief.id, { status: 'Lu' });
        briefsCollection.refresh();
      } catch (error) {
        console.error('Impossible de marquer le briefing comme lu:', error);
      }
    }
  };

  if (!editableModel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pm-dark text-white">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-pulse rounded-full border border-pm-gold/30 bg-pm-gold/10" />
          <p className="text-sm text-white/45">Chargement de votre espace mannequin…</p>
        </div>
      </div>
    );
  }

  const firstName = editableModel.name.split(' ')[0];
  const nextBrief = upcomingBriefs[0];
  const levelLabel = editableModel.level || 'Débutant';
  const levelClass = editableModel.level === 'Pro'
    ? 'border-pm-gold/30 bg-pm-gold/10 text-pm-gold'
    : 'border-white/10 bg-white/5 text-white/50';

  return (
    <div className="min-h-screen bg-[#060606] text-pm-off-white">
      <SEO title={`Espace mannequin | ${editableModel.name}`} noIndex />

      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#060606]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="shrink-0 text-[10px] font-black uppercase tracking-[0.35em] text-pm-gold">PMM</Link>
          <span className="text-white/10">/</span>
          <span className="truncate text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Espace mannequin</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <Link to={`/mannequins/${editableModel.id}`} className="hidden text-[9px] font-black uppercase tracking-[0.2em] text-white/35 transition hover:text-pm-gold sm:block">Portfolio public</Link>
          <button onClick={() => setShowChangePassword(true)} className="hidden items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/35 transition hover:text-pm-gold md:flex"><LockClosedIcon className="h-4 w-4" /> Sécurité</button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/35 transition hover:text-red-400"><ArrowRightOnRectangleIcon className="h-4 w-4" /><span className="hidden sm:inline">Déconnexion</span></button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1700px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-white/5 p-7 lg:flex lg:flex-col">
          <div>
            <div className="relative mb-5 h-20 w-20">
              {editableModel.imageUrl ? (
                <img src={editableModel.imageUrl} alt={editableModel.name} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-pm-gold/25" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5"><UserCircleIcon className="h-8 w-8 text-white/20" /></div>
              )}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#060606] bg-emerald-500" />
            </div>
            <h2 className="font-playfair text-xl font-black text-white">{editableModel.name}</h2>
            <p className="mt-1 text-xs text-white/30">{editableModel.username}</p>
            <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.25em] ${levelClass}`}>{levelLabel}</span>
          </div>

          <nav className="mt-10 space-y-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] transition ${activeTab === tab.id ? 'bg-pm-gold text-pm-dark' : 'text-white/35 hover:bg-white/5 hover:text-white'}`}>
                <tab.icon className="h-5 w-5" />
                <span className="flex-1">{tab.label}</span>
                {tab.id === 'briefs' && newBriefsCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">{newBriefsCount}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2 pt-10">
            {perms?.canAccessFormation !== false && (
              <Link to="/formation" className="flex items-center gap-3 rounded-xl border border-white/5 p-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/35 transition hover:border-pm-gold/20 hover:text-pm-gold"><BookOpenIcon className="h-4 w-4" /> Formation avancée</Link>
            )}
            <button onClick={() => setShowChangePassword(true)} className="flex w-full items-center gap-3 rounded-xl border border-white/5 p-3 text-left text-[9px] font-black uppercase tracking-[0.16em] text-white/35 transition hover:border-pm-gold/20 hover:text-pm-gold"><LockClosedIcon className="h-4 w-4" /> Changer le mot de passe</button>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-10 xl:p-14">
          <div className="mb-6 lg:hidden">
            <div className="flex gap-1 overflow-x-auto border-b border-white/5 pb-1 no-scrollbar">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-[9px] font-black uppercase tracking-[0.18em] ${activeTab === tab.id ? 'text-pm-gold' : 'text-white/30'}`}>
                  <tab.icon className="h-4 w-4" />{tab.label}
                  {tab.id === 'briefs' && newBriefsCount > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[8px] text-white">{newBriefsCount}</span>}
                </button>
              ))}
            </div>
          </div>

          {saveMessage && <div className="mb-6 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{saveMessage}</div>}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <section>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold">Mon espace</p>
                <h1 className="mt-2 font-playfair text-4xl font-black text-white sm:text-5xl">Bonjour, <span className="text-pm-gold">{firstName}</span></h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">Suivez votre profil professionnel, votre progression et les prochains briefings transmis par l’agence.</p>
              </section>

              <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <Kpi label="Profil" value={`${profileCompleteness}%`} icon={IdentificationIcon} accent={profileCompleteness >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
                <Kpi label="Formation" value={`${stats.progress}%`} icon={AcademicCapIcon} accent="text-pm-gold" />
                <Kpi label="Score moyen" value={`${stats.avgScore}%`} icon={ChartBarIcon} accent="text-blue-400" />
                <Kpi label="Briefings" value={myBriefs.length} badge={newBriefsCount} icon={EnvelopeIcon} accent="text-white" />
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="glass-card overflow-hidden">
                  <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5 sm:p-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Profil professionnel</p>
                      <h2 className="mt-1 text-xl font-bold text-white">Niveau de préparation</h2>
                    </div>
                    <button onClick={() => setActiveTab('profile')} className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-pm-gold transition hover:text-white">Modifier <PencilSquareIcon className="h-4 w-4" /></button>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="mb-3 flex items-center justify-between"><span className="text-sm text-white/50">Complétude du profil</span><strong className="text-xl text-white">{profileCompleteness}%</strong></div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-pm-gold transition-all" style={{ width: `${profileCompleteness}%` }} /></div>
                    <div className="mt-6 space-y-3">
                      {profileChecks.map(check => (
                        <div key={check.label} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.015] p-3">
                          {check.ok ? <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> : <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />}
                          <div><p className="text-sm font-semibold text-white/75">{check.label}</p><p className="mt-0.5 text-xs text-white/30">{check.description}</p></div>
                        </div>
                      ))}
                    </div>
                    {missingChecks.length > 0 && <button onClick={() => setActiveTab('profile')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pm-gold px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-pm-dark">Compléter mon profil <ArrowRightIcon className="h-4 w-4" /></button>}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-card p-5 sm:p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Prochain rendez-vous</p>
                    {nextBrief ? (
                      <div className="mt-5">
                        <h3 className="font-playfair text-2xl font-black text-white">{nextBrief.theme}</h3>
                        <div className="mt-5 space-y-3 text-sm text-white/45">
                          <div className="flex items-center gap-3"><CalendarDaysIcon className="h-5 w-5 text-pm-gold" />{new Date(nextBrief.dateTime).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</div>
                          <div className="flex items-center gap-3"><MapPinIcon className="h-5 w-5 text-pm-gold" />{nextBrief.location}</div>
                        </div>
                        <button onClick={() => { setActiveTab('briefs'); setExpandedBriefId(nextBrief.id); }} className="mt-5 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-pm-gold">Voir le briefing <ArrowRightIcon className="h-4 w-4" /></button>
                      </div>
                    ) : <p className="mt-5 text-sm leading-6 text-white/30">Aucun briefing à venir pour le moment.</p>}
                  </div>

                  <div className="glass-card p-5 sm:p-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Raccourcis</p>
                    <div className="mt-4 grid gap-2">
                      <Link to={`/mannequins/${editableModel.id}`} className="flex items-center gap-3 rounded-xl border border-white/5 p-3 text-sm text-white/50 transition hover:border-pm-gold/20 hover:text-white"><CameraIcon className="h-5 w-5 text-pm-gold" /> Voir mon portfolio public</Link>
                      {perms?.canAccessFormation !== false && <Link to="/formation" className="flex items-center gap-3 rounded-xl border border-white/5 p-3 text-sm text-white/50 transition hover:border-pm-gold/20 hover:text-white"><BookOpenIcon className="h-5 w-5 text-pm-gold" /> Continuer ma formation</Link>}
                      <button onClick={() => setShowChangePassword(true)} className="flex items-center gap-3 rounded-xl border border-white/5 p-3 text-left text-sm text-white/50 transition hover:border-pm-gold/20 hover:text-white"><LockClosedIcon className="h-5 w-5 text-pm-gold" /> Sécurité du compte</button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'profile' && perms?.canEditProfile !== false && (
            <div>
              <div className="mb-7"><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Profil professionnel</p><h1 className="mt-2 font-playfair text-3xl font-black text-white sm:text-4xl">Mes informations</h1><p className="mt-2 text-sm text-white/35">Maintenez vos informations, mensurations et portfolio à jour.</p></div>
              <ModelForm model={editableModel} onSave={handleSave} onCancel={handleCancel} mode="model" isCreating={false} />
            </div>
          )}

          {activeTab === 'training' && perms?.canViewResults !== false && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Formation</p><h1 className="mt-2 font-playfair text-3xl font-black text-white sm:text-4xl">Ma progression</h1></div>
                {perms?.canAccessFormation !== false && <Link to="/formation" className="inline-flex items-center gap-2 self-start rounded-xl bg-pm-gold px-5 py-3 text-[9px] font-black uppercase tracking-[0.16em] text-pm-dark sm:self-auto">Continuer la formation <ArrowRightIcon className="h-4 w-4" /></Link>}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Kpi label="Modules complétés" value={`${stats.completed}/${stats.total}`} icon={BookOpenIcon} accent="text-pm-gold" /><Kpi label="Score moyen" value={`${stats.avgScore}%`} icon={ChartBarIcon} accent={scoreColor(stats.avgScore)} /><Kpi label="Meilleur score" value={`${stats.bestScore}%`} icon={TrophyIcon} accent={scoreColor(stats.bestScore)} /></div>
              <div className="glass-card p-5 sm:p-6"><div className="mb-3 flex justify-between"><span className="text-sm text-white/45">Progression globale</span><span className="font-black text-white">{stats.progress}%</span></div><div className="h-2 rounded-full bg-white/5"><div className="h-2 rounded-full bg-pm-gold" style={{ width: `${stats.progress}%` }} /></div></div>
              <div className="glass-card overflow-hidden"><div className="border-b border-white/5 px-5 py-4 sm:px-6"><h2 className="text-sm font-bold text-white">Résultats par module</h2></div><div className="divide-y divide-white/5">{courseModules.length ? courseModules.map(module => { const result = editableModel.quizScores?.[module.slug]; const pct = result ? Math.round((result.score / result.total) * 100) : null; return <div key={module.slug} className="flex items-center gap-4 px-5 py-4 sm:px-6"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">{pct === null ? <ClockIcon className="h-5 w-5 text-white/20" /> : <TrophyIcon className={`h-5 w-5 ${scoreColor(pct)}`} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white/75">{module.title}</p><p className="mt-1 text-xs text-white/25">{pct === null ? 'À compléter' : `${result!.score}/${result!.total} bonnes réponses`}</p></div><span className={`font-playfair text-2xl font-black ${pct === null ? 'text-white/15' : scoreColor(pct)}`}>{pct === null ? '—' : `${pct}%`}</span></div>; }) : <div className="p-10 text-center text-sm text-white/25">Aucun module disponible.</div>}</div></div>
            </div>
          )}

          {activeTab === 'briefs' && perms?.canViewPhotoshootBriefs !== false && (
            <div className="space-y-5">
              <div><p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Production</p><h1 className="mt-2 font-playfair text-3xl font-black text-white sm:text-4xl">Mes briefings</h1><p className="mt-2 text-sm text-white/35">Retrouvez les informations de shooting et directives envoyées par l’agence.</p></div>
              {newBriefsCount > 0 && <div className="flex items-center gap-3 rounded-xl border border-pm-gold/20 bg-pm-gold/5 p-4 text-sm text-pm-gold"><ExclamationCircleIcon className="h-5 w-5 shrink-0" />{newBriefsCount} nouveau{newBriefsCount > 1 ? 'x' : ''} briefing{newBriefsCount > 1 ? 's' : ''} à consulter.</div>}
              {briefsCollection.isLoading ? <div className="glass-card p-10 text-center text-sm text-white/25">Chargement des briefings…</div> : myBriefs.length ? myBriefs.map(brief => <BriefItem key={brief.id} brief={brief} expanded={expandedBriefId === brief.id} onToggle={handleToggleBrief} />) : <div className="glass-card p-12 text-center"><EnvelopeIcon className="mx-auto h-10 w-10 text-white/10" /><p className="mt-4 text-sm text-white/30">Aucun briefing n’a encore été publié pour votre profil.</p></div>}
            </div>
          )}
        </main>
      </div>

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: string | number; icon: React.ElementType; accent: string; badge?: number }> = ({ label, value, icon: Icon, accent, badge = 0 }) => (
  <div className="glass-card p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><p className="truncate text-[8px] font-black uppercase tracking-[0.24em] text-white/30">{label}</p><Icon className={`h-5 w-5 ${accent}`} /></div><p className={`font-playfair text-3xl font-black sm:text-4xl ${accent}`}>{value}{badge > 0 && <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 align-middle text-[9px] font-sans text-white">{badge}</span>}</p></div>
);

const scoreColor = (score: number) => score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : score > 0 ? 'text-red-400' : 'text-white/25';

const BriefItem: React.FC<{ brief: PhotoshootBrief; expanded: boolean; onToggle: (id: string) => void }> = ({ brief, expanded, onToggle }) => {
  const isNew = brief.status === 'Nouveau';
  return (
    <div className={`glass-card overflow-hidden ${isNew ? 'border-pm-gold/25' : ''}`}>
      <button onClick={() => onToggle(brief.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02] sm:px-6">
        <div className="flex min-w-0 items-center gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isNew ? 'bg-pm-gold/10 text-pm-gold' : 'bg-white/5 text-emerald-400'}`}>{isNew ? <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-pm-gold" /> : <CheckCircleIcon className="h-5 w-5" />}</div><div className="min-w-0"><p className={`truncate text-sm font-bold ${isNew ? 'text-pm-gold' : 'text-white/80'}`}>{brief.theme}</p><p className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/25">{new Date(brief.dateTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div></div>
        <div className="flex shrink-0 items-center gap-3">{isNew && <span className="hidden rounded-full bg-pm-gold/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-pm-gold sm:block">Nouveau</span>}{expanded ? <ChevronUpIcon className="h-4 w-4 text-white/30" /> : <ChevronDownIcon className="h-4 w-4 text-white/30" />}</div>
      </button>
      {expanded && <div className="space-y-4 border-t border-white/5 px-5 pb-6 pt-5 sm:px-6"><div className="grid gap-3 sm:grid-cols-2"><Info icon={CalendarDaysIcon} label="Date & heure" value={new Date(brief.dateTime).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })} /><Info icon={MapPinIcon} label="Lieu" value={brief.location} /></div><div className="grid gap-3 sm:grid-cols-2"><TextInfo label="Style vestimentaire" value={brief.clothingStyle} /><TextInfo label="Accessoires" value={brief.accessories} /></div></div>}
    </div>
  );
};

const Info: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => <div className="flex gap-3 rounded-xl bg-black/35 p-4"><Icon className="h-5 w-5 shrink-0 text-pm-gold" /><div><p className="text-[8px] font-black uppercase tracking-widest text-white/25">{label}</p><p className="mt-1 text-sm text-white/70">{value}</p></div></div>;
const TextInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-xl bg-black/35 p-4"><p className="text-[8px] font-black uppercase tracking-widest text-pm-gold">{label}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{value}</p></div>;

export default ModelDashboard;
