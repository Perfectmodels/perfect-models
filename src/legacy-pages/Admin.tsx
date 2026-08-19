import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
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
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';
import { BookingRequest, CastingApplication, ContactMessage, FashionDayApplication, Model, RecoveryRequest } from '../types';

type ActivityItem = { id: string; title: string; context: string; date: string; link: string; tone: 'gold' | 'blue' | 'green' | 'warm' };
type Module = { title: string; summary: string; to: string; icon: React.ElementType; group: string };

const modules: Module[] = [
  { group: 'Talents', title: 'Mannequins', summary: 'Profils, portfolio et visibilité', to: '/admin/models', icon: UsersIcon },
  { group: 'Talents', title: 'Médiathèque', summary: 'Bibliothèque de contenus visuels', to: '/admin/media-library', icon: PhotoIcon },
  { group: 'Talents', title: 'Galerie', summary: 'Sélection visible sur le site', to: '/admin/gallery', icon: PhotoIcon },
  { group: 'Contenu', title: 'Magazine', summary: 'Articles et publications éditoriales', to: '/admin/magazine', icon: NewspaperIcon },
  { group: 'Contenu', title: 'Actualités', summary: 'Annonces courtes et agenda', to: '/admin/news', icon: CalendarDaysIcon },
  { group: 'Production', title: 'Perfect Fashion Day', summary: 'Éditions, programme et contenus', to: '/admin/fashion-day-events', icon: SparklesIcon },
  { group: 'Production', title: 'Candidatures PFD', summary: 'Talents et participants', to: '/admin/fashion-day-applications', icon: ClipboardDocumentListIcon },
  { group: 'Production', title: 'Direction artistique', summary: 'Briefs, shootings et livrables', to: '/admin/artistic-direction', icon: PaintBrushIcon },
  { group: 'Opérations', title: 'Bookings', summary: 'Demandes clients et réservations', to: '/admin/bookings', icon: BriefcaseIcon },
  { group: 'Opérations', title: 'Castings', summary: 'Candidatures et première sélection', to: '/admin/casting-applications', icon: ClipboardDocumentListIcon },
  { group: 'Opérations', title: 'Décisions casting', summary: 'Résultats, avis et validation', to: '/admin/casting-results', icon: ClipboardDocumentCheckIcon },
  { group: 'Opérations', title: 'Finances', summary: 'Paiements et suivi financier', to: '/admin/payments', icon: CurrencyDollarIcon },
  { group: 'Opérations', title: 'Présences', summary: 'Absences et disponibilité équipe', to: '/admin/absences', icon: CalendarDaysIcon },
  { group: 'Équipe', title: 'Formation', summary: 'Parcours professionnel', to: '/formation', icon: AcademicCapIcon },
  { group: 'Équipe', title: 'Progression', summary: 'Suivi pédagogique des talents', to: '/admin/classroom-progress', icon: PresentationChartLineIcon },
  { group: 'Équipe', title: 'Accès', summary: 'Comptes, rôles et identifiants', to: '/admin/model-access', icon: KeyIcon },
  { group: 'Équipe', title: 'Permissions', summary: 'Droits d'accès par utilisateur admin', to: '/admin/user-permissions', icon: ShieldCheckIcon },
  { group: 'Équipe', title: 'Récupérations', summary: 'Demandes de retour de compte', to: '/admin/recovery-requests', icon: ExclamationTriangleIcon },
  { group: 'Équipe', title: 'Messages', summary: 'Demandes reçues depuis le site', to: '/admin/messages', icon: EnvelopeIcon },
  { group: 'Équipe', title: 'Commentaires', summary: 'Modération éditoriale', to: '/admin/comments', icon: EnvelopeIcon },
  { group: 'Équipe', title: 'Mailing', summary: 'Campagnes et contacts', to: '/admin/mailing', icon: PaperAirplaneIcon },
];

const formatDate = (value?: string) => {
  if (!value) return 'À l’instant';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
};

const completeness = (model: Model) => {
  const fields = [model.email, model.phone, model.imageUrl, model.height, model.location, model.categories?.length, model.experience, model.journey, model.measurements?.chest, model.measurements?.waist, model.measurements?.hips, model.portfolioImages?.length];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data } = useData();
  const [query, setQuery] = useState('');
  const casting = useFirebaseCollection<CastingApplication>('castingApplications', { pageSize: 1000, orderBy: 'submissionDate' });
  const bookings = useFirebaseCollection<BookingRequest>('bookingRequests', { pageSize: 1000, orderBy: 'submissionDate' });
  const messages = useFirebaseCollection<ContactMessage>('contactMessages', { pageSize: 1000, orderBy: 'submissionDate' });
  const recoveries = useFirebaseCollection<RecoveryRequest>('recoveryRequests', { pageSize: 1000, orderBy: 'timestamp' });
  const pfd = useFirebaseCollection<FashionDayApplication>('fashionDayApplications', { pageSize: 1000, orderBy: 'submissionDate' });

  const models = data?.models ?? [];
  const pending = {
    casting: casting.items.filter(item => item.status === 'Nouveau').length,
    bookings: bookings.items.filter(item => item.status === 'Nouveau').length,
    messages: messages.items.filter(item => item.status === 'Nouveau').length,
    recoveries: recoveries.items.filter(item => item.status === 'Nouveau').length,
    pfd: pfd.items.filter(item => item.status === 'Nouveau').length,
  };
  const totalPending = Object.values(pending).reduce((total, value) => total + value, 0);
  const profileHealth = useMemo(() => models.length ? Math.round(models.reduce((total, model) => total + completeness(model), 0) / models.length) : 0, [models]);
  const publishedArticles = (data?.articles ?? []).filter(article => article.status !== 'draft').length;
  const activities = useMemo<ActivityItem[]>(() => [
    ...casting.items.map(item => ({ id: `casting-${item.id}`, title: `${item.firstName} ${item.lastName}`.trim() || 'Candidature casting', context: `Casting · ${item.status}`, date: item.submissionDate, link: '/admin/casting-applications', tone: 'gold' as const })),
    ...bookings.items.map(item => ({ id: `booking-${item.id}`, title: item.clientName || 'Demande de booking', context: `Booking · ${item.status}`, date: item.submissionDate, link: '/admin/bookings', tone: 'blue' as const })),
    ...messages.items.map(item => ({ id: `message-${item.id}`, title: item.subject || item.name || 'Nouveau message', context: `Message · ${item.status}`, date: item.submissionDate, link: '/admin/messages', tone: 'green' as const })),
    ...pfd.items.map(item => ({ id: `pfd-${item.id}`, title: item.name || 'Candidature PFD', context: `${item.role || 'Participation'} · ${item.status}`, date: item.submissionDate, link: '/admin/fashion-day-applications', tone: 'warm' as const })),
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 6), [bookings.items, casting.items, messages.items, pfd.items]);
  const visibleModules = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return term ? modules.filter(module => `${module.title} ${module.summary} ${module.group}`.toLocaleLowerCase('fr').includes(term)) : modules;
  }, [query]);
  const firstName = user?.displayName?.split(' ')[0] || 'équipe';
  const queue = [
    { label: 'Candidatures casting', count: pending.casting, to: '/admin/casting-applications', icon: ClipboardDocumentListIcon },
    { label: 'Bookings à confirmer', count: pending.bookings, to: '/admin/bookings', icon: BriefcaseIcon },
    { label: 'Messages à lire', count: pending.messages, to: '/admin/messages', icon: EnvelopeIcon },
    { label: 'Accès à récupérer', count: pending.recoveries, to: '/admin/recovery-requests', icon: KeyIcon },
    { label: 'Candidatures PFD', count: pending.pfd, to: '/admin/fashion-day-applications', icon: SparklesIcon },
  ];

  return <>
    <SEO title="Administration PMM" noIndex />
    <section className="mb-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-end">
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-pm-gold/65">Opérations · PMM</p>
        <h2 className="max-w-3xl font-playfair text-4xl font-bold tracking-[-0.025em] text-pm-off-white sm:text-5xl">Bonjour, {firstName}.<br /><span className="text-pm-gold-light">La maison est en mouvement.</span></h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Priorisez les demandes, gardez les profils irréprochables et passez d’un département à l’autre sans perdre le fil.</p>
      </div>
      <div className="flex flex-wrap gap-2 xl:justify-end">
        <Link to="/admin/models" className="inline-flex items-center gap-2 rounded-lg bg-pm-gold px-4 py-3 text-xs font-bold text-[#1d1607] transition hover:bg-pm-gold-light"><PlusIcon className="h-4 w-4" /> Ajouter un talent</Link>
        <button onClick={() => void logout().then(() => navigate('/login'))} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-xs font-medium text-white/50 transition hover:border-red-400/40 hover:text-red-300"><ArrowRightOnRectangleIcon className="h-4 w-4" /> Déconnexion</button>
      </div>
    </section>

    <section className="mb-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Insight label="À décider" value={totalPending} note="toutes les files" icon={ExclamationTriangleIcon} emphasis />
      <Insight label="Talents actifs" value={models.length} note={`${models.filter(model => model.isPublic !== false).length} visibles sur le site`} icon={UsersIcon} />
      <Insight label="Profils complets" value={`${profileHealth}%`} note={profileHealth >= 80 ? 'niveau de présentation solide' : 'des profils méritent attention'} icon={CheckCircleIcon} />
      <Insight label="Magazine" value={publishedArticles} note={`${(data?.articles ?? []).filter(article => article.status === 'draft').length} brouillons en attente`} icon={NewspaperIcon} />
    </section>

    <section className="mb-10 grid gap-6 2xl:grid-cols-[minmax(0,1.28fr)_minmax(19rem,0.72fr)]">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#17130e]/85">
        <div className="flex items-end justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pm-gold/60">Bureau de régie</p><h3 className="mt-1 font-playfair text-2xl font-bold">À traiter aujourd’hui</h3></div>
          <span className="rounded-full bg-pm-gold/[0.1] px-3 py-1 text-xs font-bold text-pm-gold-light">{totalPending} éléments</span>
        </div>
        <div className="divide-y divide-white/[0.07]">
          {queue.map(({ label, count, to, icon: Icon }) => <Link key={to} to={to} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-pm-gold/[0.055] sm:px-6">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/[0.045] text-pm-gold transition group-hover:bg-pm-gold group-hover:text-[#1d1607]"><Icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><b className="block text-sm font-semibold text-pm-off-white">{label}</b><small className="mt-0.5 block text-xs text-white/35">{count ? 'Ouvrir la file et décider' : 'Aucune action en attente'}</small></span>
            <strong className={`font-playfair text-3xl ${count ? 'text-pm-gold-light' : 'text-white/20'}`}>{count}</strong><ArrowRightIcon className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-pm-gold-light" />
          </Link>)}
        </div>
      </div>
      <div className="rounded-xl border border-pm-gold/20 bg-[linear-gradient(155deg,#20180c,#15110c_65%)] p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pm-gold/65">Raccourcis de production</p>
        <h3 className="mt-2 max-w-xs font-playfair text-3xl font-bold leading-tight text-pm-off-white">Commencer sans chercher.</h3>
        <div className="mt-7 space-y-2">
          {[
            { label: 'Publier un article', to: '/admin/magazine', icon: NewspaperIcon },
            { label: 'Créer une édition PFD', to: '/admin/fashion-day-events', icon: SparklesIcon },
            { label: 'Préparer un briefing', to: '/admin/artistic-direction', icon: PaintBrushIcon },
            { label: 'Lancer un mailing', to: '/admin/mailing', icon: PaperAirplaneIcon },
          ].map(({ label, to, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-black/15 px-3 py-3 text-sm text-white/65 transition hover:border-pm-gold/40 hover:bg-pm-gold/[0.08] hover:text-pm-gold-light"><Icon className="h-4 w-4 text-pm-gold" />{label}<ArrowRightIcon className="ml-auto h-4 w-4 text-white/30" /></Link>)}
        </div>
      </div>
    </section>

    <section className="mb-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#14110d]/80">
        <div className="flex items-end justify-between gap-4 border-b border-white/[0.08] px-5 py-5 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pm-gold/60">Flux de travail</p><h3 className="mt-1 font-playfair text-2xl font-bold">Activité récente</h3></div><span className="hidden text-xs text-white/30 sm:block">Derniers mouvements enregistrés</span></div>
        <div className="divide-y divide-white/[0.07]">
          {activities.length ? activities.map(activity => <Link key={activity.id} to={activity.link} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.035] sm:px-6"><span className={`h-2.5 w-2.5 rounded-full ${activity.tone === 'gold' ? 'bg-pm-gold' : activity.tone === 'blue' ? 'bg-sky-400' : activity.tone === 'green' ? 'bg-emerald-400' : 'bg-orange-300'}`} /><span className="min-w-0 flex-1"><b className="block truncate text-sm text-pm-off-white">{activity.title}</b><small className="mt-1 block truncate text-xs text-white/35">{activity.context}</small></span><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">{formatDate(activity.date)}</span><ArrowRightIcon className="h-4 w-4 text-white/15 transition group-hover:translate-x-1 group-hover:text-pm-gold" /></Link>) : <EmptyState title="Le flux est calme" description="Les nouvelles demandes et décisions apparaîtront ici dès leur arrivée." />}
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.08] bg-[#14110d]/80 p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pm-gold/60">Santé de l’agence</p><h3 className="mt-1 font-playfair text-2xl font-bold">Qualité des données</h3><div className="mt-7 space-y-5"><HealthRow label="Profils complets" value={profileHealth} /><HealthRow label="Visibilité publique" value={models.length ? Math.round((models.filter(model => model.isPublic !== false).length / models.length) * 100) : 0} /><HealthRow label="Articles publiables" value={(data?.articles ?? []).length ? Math.round((publishedArticles / (data?.articles ?? []).length) * 100) : 0} /></div><Link to="/admin/models" className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-pm-gold transition hover:text-pm-gold-light">Améliorer les profils <ArrowRightIcon className="h-4 w-4" /></Link></div>
    </section>

    <section>
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-pm-gold/60">Toutes les fonctions</p><h3 className="mt-1 font-playfair text-3xl font-bold">Les départements PMM</h3></div><label className="relative w-full md:max-w-sm"><MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pm-gold/60" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Trouver une fonctionnalité…" className="w-full rounded-lg border border-white/10 bg-[#18140f] py-3 pl-10 pr-4 text-sm text-pm-off-white outline-none transition placeholder:text-white/25 focus:border-pm-gold/55 focus:ring-2 focus:ring-pm-gold/10" /></label></div>
      <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 xl:grid-cols-4">
        {visibleModules.map(({ title, summary, to, icon: Icon, group }) => <Link key={to} to={to} className="group min-h-44 bg-[#15110d] p-5 transition hover:bg-[#1c160e]"><div className="mb-7 flex items-start justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-pm-gold/[0.1] text-pm-gold transition group-hover:bg-pm-gold group-hover:text-[#1d1607]"><Icon className="h-4 w-4" /></span><small className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">{group}</small></div><h4 className="text-sm font-semibold text-pm-off-white transition group-hover:text-pm-gold-light">{title}</h4><p className="mt-2 text-xs leading-5 text-white/38">{summary}</p></Link>)}
      </div>
      {!visibleModules.length && <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-10 text-center"><p className="font-playfair text-xl text-pm-off-white">Aucune fonction trouvée</p><p className="mt-2 text-sm text-white/35">Essayez un autre mot-clé ou naviguez avec le menu.</p></div>}
    </section>
  </>;
};

const Insight: React.FC<{ label: string; value: string | number; note: string; icon: React.ElementType; emphasis?: boolean }> = ({ label, value, note, icon: Icon, emphasis }) => <div className={`rounded-xl border p-5 ${emphasis ? 'border-pm-gold/30 bg-pm-gold/[0.09]' : 'border-white/[0.08] bg-[#15110d]/75'}`}><div className="flex items-center justify-between gap-4"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">{label}</p><Icon className={`h-5 w-5 ${emphasis ? 'text-pm-gold-light' : 'text-pm-gold/75'}`} /></div><p className={`mt-7 font-playfair text-4xl font-bold ${emphasis ? 'text-pm-gold-light' : 'text-pm-off-white'}`}>{value}</p><p className="mt-2 text-xs text-white/35">{note}</p></div>;
const HealthRow: React.FC<{ label: string; value: number }> = ({ label, value }) => <div><div className="mb-2 flex justify-between gap-3 text-xs"><span className="text-white/48">{label}</span><b className="text-pm-gold-light">{value}%</b></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-pm-gold transition-all" style={{ width: `${value}%` }} /></div></div>;
const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => <div className="p-10 text-center"><p className="font-playfair text-xl text-pm-off-white">{title}</p><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/35">{description}</p></div>;

export default Admin;
