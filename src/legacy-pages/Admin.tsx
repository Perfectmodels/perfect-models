import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  BellAlertIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PaintBrushIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  PresentationChartLineIcon,
  SparklesIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';
import {
  BookingRequest,
  CastingApplication,
  ContactMessage,
  FashionDayApplication,
  Model,
  RecoveryRequest,
} from '../types';

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  link: string;
  kind: 'casting' | 'booking' | 'message' | 'recovery' | 'pfd';
};

type ModuleLink = {
  title: string;
  description: string;
  link: string;
  icon: React.ElementType;
  group: string;
};

const formatDate = (value?: string) => {
  if (!value) return 'Date inconnue';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const modelCompleteness = (model: Model) => {
  const checks = [
    Boolean(model.email),
    Boolean(model.phone),
    Boolean(model.imageUrl),
    Boolean(model.height),
    Boolean(model.location),
    Boolean(model.categories?.length),
    Boolean(model.experience?.trim()),
    Boolean(model.journey?.trim()),
    Boolean(model.measurements?.chest),
    Boolean(model.measurements?.waist),
    Boolean(model.measurements?.hips),
    Boolean(model.measurements?.shoeSize),
    Boolean(model.portfolioImages?.length),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const MODULES: ModuleLink[] = [
  { group: 'Talents', title: 'Mannequins', description: 'Profils, photos, informations et visibilité.', link: '/admin/models', icon: UsersIcon },
  { group: 'Talents', title: 'Médiathèque', description: 'Centraliser les médias et albums de l’agence.', link: '/admin/media-library', icon: PhotoIcon },
  { group: 'Talents', title: 'Galerie', description: 'Gérer les contenus visibles dans la galerie publique.', link: '/admin/gallery', icon: PhotoIcon },
  { group: 'Contenu', title: 'Magazine', description: 'Créer et administrer les publications éditoriales.', link: '/admin/magazine', icon: NewspaperIcon },
  { group: 'Contenu', title: 'Actualités', description: 'Publier les annonces et informations courtes.', link: '/admin/news', icon: CalendarDaysIcon },
  { group: 'Recrutement', title: 'Candidatures Casting', description: 'Traiter les nouvelles candidatures mannequin.', link: '/admin/casting-applications', icon: ClipboardDocumentListIcon },
  { group: 'Recrutement', title: 'Résultats Casting', description: 'Consulter les scores et décisions du jury.', link: '/admin/casting-results', icon: ClipboardDocumentCheckIcon },
  { group: 'Événementiel', title: 'Perfect Fashion Day', description: 'Gérer les éditions et candidatures PFD.', link: '/admin/fashion-day-events', icon: SparklesIcon },
  { group: 'Opérations', title: 'Bookings', description: 'Suivre les demandes clients et réservations.', link: '/admin/bookings', icon: BriefcaseIcon },
  { group: 'Opérations', title: 'Finances', description: 'Piloter paiements, revenus et dépenses.', link: '/admin/payments', icon: CurrencyDollarIcon },
  { group: 'Opérations', title: 'Présences', description: 'Suivre absences et présence des mannequins.', link: '/admin/absences', icon: CalendarDaysIcon },
  { group: 'Opérations', title: 'Direction Artistique', description: 'Créer et transmettre les briefs de production.', link: '/admin/artistic-direction', icon: PaintBrushIcon },
  { group: 'Formation', title: 'Formation Avancée', description: 'Accéder aux contenus de formation professionnelle.', link: '/formation', icon: AcademicCapIcon },
  { group: 'Formation', title: 'Progression', description: 'Analyser l’avancement des mannequins.', link: '/admin/classroom-progress', icon: PresentationChartLineIcon },
  { group: 'Accès', title: 'Accès Mannequins', description: 'Administrer les identifiants et droits d’accès.', link: '/admin/model-access', icon: KeyIcon },
  { group: 'Accès', title: 'Récupérations', description: 'Traiter les demandes de récupération de compte.', link: '/admin/recovery-requests', icon: ExclamationTriangleIcon },
  { group: 'Communication', title: 'Messages', description: 'Répondre aux demandes reçues depuis le site.', link: '/admin/messages', icon: EnvelopeIcon },
  { group: 'Communication', title: 'Commentaires', description: 'Modérer les échanges éditoriaux.', link: '/admin/comments', icon: ChatBubbleLeftRightIcon },
  { group: 'Communication', title: 'Mailing', description: 'Préparer et envoyer les campagnes email.', link: '/admin/mailing', icon: PaperAirplaneIcon },
];

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data } = useData();
  const [moduleSearch, setModuleSearch] = useState('');

  const casting = useFirebaseCollection<CastingApplication>('castingApplications', { pageSize: 1000, orderBy: 'submissionDate' });
  const bookings = useFirebaseCollection<BookingRequest>('bookingRequests', { pageSize: 1000, orderBy: 'submissionDate' });
  const messages = useFirebaseCollection<ContactMessage>('contactMessages', { pageSize: 1000, orderBy: 'submissionDate' });
  const recoveries = useFirebaseCollection<RecoveryRequest>('recoveryRequests', { pageSize: 1000, orderBy: 'timestamp' });
  const pfdApplications = useFirebaseCollection<FashionDayApplication>('fashionDayApplications', { pageSize: 1000, orderBy: 'submissionDate' });

  const models = data?.models ?? [];
  const pendingCasting = casting.items.filter(item => item.status === 'Nouveau').length;
  const pendingBookings = bookings.items.filter(item => item.status === 'Nouveau').length;
  const pendingMessages = messages.items.filter(item => item.status === 'Nouveau').length;
  const pendingRecoveries = recoveries.items.filter(item => item.status === 'Nouveau').length;
  const pendingPfd = pfdApplications.items.filter(item => item.status === 'Nouveau').length;
  const totalPending = pendingCasting + pendingBookings + pendingMessages + pendingRecoveries + pendingPfd;

  const profileQuality = useMemo(() => {
    if (!models.length) return { average: 0, incomplete: 0, publicCount: 0 };
    const scores = models.map(modelCompleteness);
    return {
      average: Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length),
      incomplete: scores.filter(score => score < 75).length,
      publicCount: models.filter(model => model.isPublic !== false).length,
    };
  }, [models]);

  const activities = useMemo<ActivityItem[]>(() => {
    const result: ActivityItem[] = [
      ...casting.items.map(item => ({
        id: `casting-${item.id}`,
        title: `${item.firstName} ${item.lastName}`.trim(),
        subtitle: `Candidature casting · ${item.status}`,
        date: item.submissionDate,
        link: '/admin/casting-applications',
        kind: 'casting' as const,
      })),
      ...bookings.items.map(item => ({
        id: `booking-${item.id}`,
        title: item.clientName || 'Demande booking',
        subtitle: `Booking · ${item.status}`,
        date: item.submissionDate,
        link: '/admin/bookings',
        kind: 'booking' as const,
      })),
      ...messages.items.map(item => ({
        id: `message-${item.id}`,
        title: item.subject || item.name || 'Nouveau message',
        subtitle: `${item.name} · ${item.status}`,
        date: item.submissionDate,
        link: '/admin/messages',
        kind: 'message' as const,
      })),
      ...recoveries.items.map(item => ({
        id: `recovery-${item.id}`,
        title: item.modelName || 'Récupération de compte',
        subtitle: `Accès mannequin · ${item.status}`,
        date: item.timestamp,
        link: '/admin/recovery-requests',
        kind: 'recovery' as const,
      })),
      ...pfdApplications.items.map(item => ({
        id: `pfd-${item.id}`,
        title: item.name || 'Candidature PFD',
        subtitle: `${item.role} · ${item.status}`,
        date: item.submissionDate,
        link: '/admin/fashion-day-applications',
        kind: 'pfd' as const,
      })),
    ];

    return result
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 7);
  }, [casting.items, bookings.items, messages.items, recoveries.items, pfdApplications.items]);

  const filteredModules = useMemo(() => {
    const query = moduleSearch.trim().toLowerCase();
    if (!query) return MODULES;
    return MODULES.filter(module =>
      `${module.title} ${module.description} ${module.group}`.toLowerCase().includes(query)
    );
  }, [moduleSearch]);

  const attentionItems = [
    { label: 'Candidatures casting', count: pendingCasting, link: '/admin/casting-applications', icon: ClipboardDocumentListIcon },
    { label: 'Demandes booking', count: pendingBookings, link: '/admin/bookings', icon: BriefcaseIcon },
    { label: 'Messages à lire', count: pendingMessages, link: '/admin/messages', icon: EnvelopeIcon },
    { label: 'Récupérations accès', count: pendingRecoveries, link: '/admin/recovery-requests', icon: KeyIcon },
    { label: 'Candidatures PFD', count: pendingPfd, link: '/admin/fashion-day-applications', icon: SparklesIcon },
  ].sort((a, b) => b.count - a.count);

  const quickActions = [
    { label: 'Ajouter un mannequin', link: '/admin/models', icon: PlusIcon },
    { label: 'Publier un article', link: '/admin/magazine', icon: NewspaperIcon },
    { label: 'Créer un briefing', link: '/admin/artistic-direction', icon: PaintBrushIcon },
    { label: 'Lancer un mailing', link: '/admin/mailing', icon: PaperAirplaneIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <SEO title="Centre de pilotage PMM" noIndex />

      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.45em] text-pm-gold/70">Perfect Models Management</p>
          <h1 className="mt-2 font-playfair text-4xl font-black text-white sm:text-5xl">Centre de pilotage</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
            Une vue opérationnelle des talents, candidatures, bookings, contenus et actions qui nécessitent votre attention.
          </p>
        </div>
        <button onClick={handleLogout} className="inline-flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-[0.25em] text-white/35 transition hover:text-red-400 xl:self-auto">
          <ArrowRightOnRectangleIcon className="h-5 w-5" /> Déconnexion
        </button>
      </div>

      <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="À traiter" value={totalPending} helper="Toutes files confondues" icon={BellAlertIcon} accent="text-pm-gold" />
        <MetricCard label="Mannequins" value={models.length} helper={`${profileQuality.publicCount} visibles publiquement`} icon={UsersIcon} accent="text-white" />
        <MetricCard label="Qualité profils" value={`${profileQuality.average}%`} helper={`${profileQuality.incomplete} profil(s) à compléter`} icon={CheckCircleIcon} accent={profileQuality.average >= 80 ? 'text-emerald-400' : 'text-amber-400'} />
        <MetricCard label="Articles publiés" value={(data?.articles ?? []).filter(article => article.status !== 'draft').length} helper={`${(data?.articles ?? []).filter(article => article.status === 'draft').length} brouillon(s)`} icon={NewspaperIcon} accent="text-blue-400" />
      </section>

      <section className="mb-10 grid grid-cols-1 gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Priorités</p>
              <h2 className="mt-1 text-lg font-bold text-white">À traiter maintenant</h2>
            </div>
            <span className="rounded-full border border-pm-gold/20 bg-pm-gold/10 px-3 py-1 text-xs font-black text-pm-gold">{totalPending}</span>
          </div>
          <div className="divide-y divide-white/5">
            {attentionItems.map(item => (
              <Link key={item.label} to={item.link} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/40 transition group-hover:bg-pm-gold/10 group-hover:text-pm-gold">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white/80 group-hover:text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs text-white/30">{item.count > 0 ? `${item.count} élément(s) en attente` : 'Aucune action urgente'}</p>
                </div>
                <span className={`text-xl font-playfair font-black ${item.count > 0 ? 'text-pm-gold' : 'text-white/15'}`}>{item.count}</span>
                <ArrowRightIcon className="h-4 w-4 text-white/15 transition group-hover:translate-x-1 group-hover:text-pm-gold" />
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-white/5 px-5 py-4 sm:px-6">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Flux</p>
            <h2 className="mt-1 text-lg font-bold text-white">Activité récente</h2>
          </div>
          <div className="divide-y divide-white/5">
            {activities.length ? activities.map(activity => (
              <Link key={activity.id} to={activity.link} className="block px-5 py-4 transition hover:bg-white/[0.025] sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white/80">{activity.title}</p>
                    <p className="mt-1 truncate text-xs text-white/35">{activity.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/20">{formatDate(activity.date)}</span>
                </div>
              </Link>
            )) : (
              <div className="px-6 py-12 text-center text-sm text-white/25">Aucune activité récente disponible.</div>
            )}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Actions rapides</p>
            <h2 className="mt-1 font-playfair text-2xl font-black text-white">Exécuter une action</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(action => (
            <Link key={action.link} to={action.link} className="group flex items-center gap-4 border border-white/7 bg-white/[0.02] p-4 transition hover:border-pm-gold/30 hover:bg-pm-gold/[0.04]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pm-gold/10 text-pm-gold"><action.icon className="h-5 w-5" /></div>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/55 transition group-hover:text-white">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-pm-gold">Administration</p>
            <h2 className="mt-1 font-playfair text-2xl font-black text-white">Tous les modules</h2>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input value={moduleSearch} onChange={event => setModuleSearch(event.target.value)} placeholder="Rechercher une fonction…" className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-pm-gold/50" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredModules.map(module => (
            <Link key={module.link} to={module.link} className="group glass-card p-5 transition hover:-translate-y-0.5 hover:border-pm-gold/25">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/35 transition group-hover:bg-pm-gold/10 group-hover:text-pm-gold"><module.icon className="h-5 w-5" /></div>
                <span className="text-[8px] font-black uppercase tracking-[0.25em] text-white/20">{module.group}</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white/80 transition group-hover:text-pm-gold">{module.title}</h3>
              <p className="mt-2 text-xs leading-5 text-white/30">{module.description}</p>
            </Link>
          ))}
        </div>

        {!filteredModules.length && (
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-10 text-center text-sm text-white/30">Aucun module ne correspond à cette recherche.</div>
        )}
      </section>
    </>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
  accent: string;
}> = ({ label, value, helper, icon: Icon, accent }) => (
  <div className="glass-card p-5">
    <div className="mb-5 flex items-start justify-between gap-4">
      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/30">{label}</p>
      <Icon className={`h-5 w-5 ${accent}`} />
    </div>
    <p className={`font-playfair text-4xl font-black ${accent}`}>{value}</p>
    <p className="mt-2 text-xs text-white/30">{helper}</p>
  </div>
);

export default Admin;
