import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon, ArrowRightOnRectangleIcon, BriefcaseIcon, CheckCircleIcon,
  ClipboardDocumentListIcon, EnvelopeIcon, ExclamationTriangleIcon, NewspaperIcon,
  PhotoIcon, PlusIcon, SparklesIcon, UsersIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';
import type { BookingRequest, CastingApplication, ContactMessage, FashionDayApplication, Model, RecoveryRequest } from '../types';

type EntityStat = { key: string; name: string; type: string; mentions: number; editions: number[]; roles: string[] };
type EntityPayload = { entities: EntityStat[]; summary: { totalEntities: number; recurringEntities: number; totalMentions: number; byType: Record<string, number> } };
type Activity = { id: string; title: string; context: string; date?: string; to: string };

const completeness = (model: Model) => {
  const fields = [model.email, model.phone, model.imageUrl, model.height, model.location, model.categories?.length, model.experience, model.measurements?.chest, model.measurements?.waist, model.measurements?.hips, model.portfolioImages?.length];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
};

const formatDate = (value?: string) => {
  if (!value) return 'À l’instant';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date);
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data } = useData();
  const casting = useFirebaseCollection<CastingApplication>('castingApplications', { pageSize: 1000, orderBy: 'submissionDate' });
  const bookings = useFirebaseCollection<BookingRequest>('bookingRequests', { pageSize: 1000, orderBy: 'submissionDate' });
  const messages = useFirebaseCollection<ContactMessage>('contactMessages', { pageSize: 1000, orderBy: 'submissionDate' });
  const recoveries = useFirebaseCollection<RecoveryRequest>('recoveryRequests', { pageSize: 1000, orderBy: 'timestamp' });
  const pfd = useFirebaseCollection<FashionDayApplication>('fashionDayApplications', { pageSize: 1000, orderBy: 'submissionDate' });
  const [entities, setEntities] = useState<EntityPayload | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/admin/entity-stats', { credentials: 'include', cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) setEntities(payload);
      } catch { /* analytics are supplementary */ }
    };
    void load();
    const interval = window.setInterval(() => void load(), 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const models = data?.models ?? [];
  const articles = data?.articles ?? [];
  const editions = data?.fashionDayEvents ?? [];
  const pending = {
    casting: casting.items.filter((item) => item.status === 'Nouveau').length,
    pfd: pfd.items.filter((item) => item.status === 'Nouveau').length,
    bookings: bookings.items.filter((item) => item.status === 'Nouveau').length,
    messages: messages.items.filter((item) => item.status === 'Nouveau').length,
    recoveries: recoveries.items.filter((item) => item.status === 'Nouveau').length,
  };
  const totalPending = Object.values(pending).reduce((sum, count) => sum + count, 0);
  const profileHealth = useMemo(() => models.length ? Math.round(models.reduce((sum, model) => sum + completeness(model), 0) / models.length) : 0, [models]);
  const publishedArticles = articles.filter((article) => article.status !== 'draft').length;
  const drafts = articles.filter((article) => article.status === 'draft').length;

  const activities = useMemo<Activity[]>(() => [
    ...casting.items.map((item) => ({ id: `casting-${item.id}`, title: `${item.firstName} ${item.lastName}`.trim() || 'Candidature mannequin', context: `Casting · ${item.status}`, date: item.submissionDate, to: '/admin/casting-applications' })),
    ...pfd.items.map((item) => ({ id: `pfd-${item.id}`, title: item.name || 'Candidature PFD', context: `${item.role || 'Participation'} · ${item.status}`, date: item.submissionDate, to: '/admin/fashion-day-applications' })),
    ...bookings.items.map((item) => ({ id: `booking-${item.id}`, title: item.clientName || 'Demande de booking', context: `Booking · ${item.status}`, date: item.submissionDate, to: '/admin/bookings' })),
    ...messages.items.map((item) => ({ id: `message-${item.id}`, title: item.subject || item.name || 'Message reçu', context: `Message · ${item.status}`, date: item.submissionDate, to: '/admin/messages' })),
  ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 8), [casting.items, pfd.items, bookings.items, messages.items]);

  const topEntities = entities?.entities.filter((item) => item.mentions > 1).slice(0, 8) ?? [];
  const firstName = user?.displayName?.split(' ')[0] || 'équipe';

  return <>
    <SEO title="Administration PMM" noIndex />
    <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold/60">Données temps réel · serveur</p><h2 className="mt-2 font-playfair text-4xl font-black text-white sm:text-5xl">Bonjour, {firstName}.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">Les indicateurs ci-dessous proviennent des collections actives. Aucun jeu de démonstration n’est utilisé pour compléter les statistiques.</p></div>
      <div className="flex gap-2"><Link to="/admin/models" className="inline-flex items-center gap-2 rounded-xl bg-pm-gold px-4 py-3 text-xs font-black text-pm-dark"><PlusIcon className="h-4 w-4" /> Ajouter un talent</Link><button onClick={() => void logout().then(() => navigate('/login'))} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-white/45 hover:text-white"><ArrowRightOnRectangleIcon className="h-4 w-4" /> Déconnexion</button></div>
    </section>

    <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <Metric label="Postulants casting" value={casting.items.length} note={`${pending.casting} nouveau${pending.casting > 1 ? 'x' : ''}`} icon={ClipboardDocumentListIcon} />
      <Metric label="Mannequins" value={models.length} note={`${models.filter((model) => model.isPublic !== false).length} publics`} icon={UsersIcon} />
      <Metric label="Candidatures PFD" value={pfd.items.length} note={`${pending.pfd} nouvelles`} icon={SparklesIcon} />
      <Metric label="Éditions PFD" value={editions.length} note={`${entities?.summary.totalMentions ?? 0} mentions d’entités`} icon={SparklesIcon} />
      <Metric label="Blog" value={publishedArticles} note={`${drafts} brouillon${drafts > 1 ? 's' : ''}`} icon={NewspaperIcon} />
      <Metric label="À traiter" value={totalPending} note="toutes les files" icon={ExclamationTriangleIcon} accent />
    </section>

    <section className="mb-8 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-5"><div><p className="text-[9px] font-black uppercase tracking-[0.28em] text-pm-gold/55">Flux entrant</p><h3 className="mt-1 font-playfair text-2xl font-bold">Activité récente</h3></div><span className="rounded-full border border-pm-gold/20 px-3 py-1 text-xs text-pm-gold">{totalPending} en attente</span></div>
        <div className="divide-y divide-white/[0.06]">{activities.length ? activities.map((activity) => <Link key={activity.id} to={activity.to} className="flex items-center gap-4 p-4 transition hover:bg-white/[0.03]"><span className="h-2 w-2 rounded-full bg-pm-gold" /><span className="min-w-0 flex-1"><b className="block truncate text-sm text-white/80">{activity.title}</b><small className="text-xs text-white/35">{activity.context}</small></span><time className="text-[10px] text-white/25">{formatDate(activity.date)}</time><ArrowRightIcon className="h-4 w-4 text-white/20" /></Link>) : <p className="p-8 text-center text-sm text-white/30">Aucune activité récente.</p>}</div>
      </div>

      <div className="rounded-2xl border border-pm-gold/15 bg-pm-gold/[0.035] p-5">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-pm-gold/60">Qualité des profils</p><div className="mt-4 flex items-end justify-between"><strong className="font-playfair text-5xl text-white">{profileHealth}%</strong><CheckCircleIcon className="h-8 w-8 text-pm-gold/40" /></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full bg-pm-gold" style={{ width: `${profileHealth}%` }} /></div><p className="mt-4 text-xs leading-5 text-white/35">Calculé à partir des coordonnées, photos, mensurations, catégories et portfolio réellement enregistrés.</p>
        <div className="mt-6 grid gap-2"><QuickLink to="/admin/casting-applications" label="Candidatures casting" count={pending.casting} icon={ClipboardDocumentListIcon} /><QuickLink to="/admin/bookings" label="Bookings" count={pending.bookings} icon={BriefcaseIcon} /><QuickLink to="/admin/messages" label="Messages" count={pending.messages} icon={EnvelopeIcon} /></div>
      </div>
    </section>

    <section className="mb-8 rounded-2xl border border-white/[0.08] bg-black/20 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.28em] text-pm-gold/55">Croisement des entités</p><h3 className="mt-1 font-playfair text-2xl font-bold">Présences récurrentes au Perfect Fashion Day</h3><p className="mt-2 text-xs text-white/35">Un même nom est normalisé et compté à travers toutes les éditions, sans créer de doublon artificiel.</p></div><div className="flex gap-2 text-xs"><span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">{entities?.summary.totalEntities ?? 0} entités</span><span className="rounded-full border border-pm-gold/20 px-3 py-1.5 text-pm-gold">{entities?.summary.recurringEntities ?? 0} récurrentes</span></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{topEntities.length ? topEntities.map((entity) => <div key={entity.key} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"><span className="text-[8px] font-black uppercase tracking-[0.24em] text-pm-gold/50">{entity.type}</span><p className="mt-1 truncate font-playfair text-lg font-bold text-white">{entity.name}</p><p className="mt-2 text-xs text-white/35">{entity.mentions} mentions · édition{entity.editions.length > 1 ? 's' : ''} {entity.editions.join(', ')}</p></div>) : <p className="col-span-full py-5 text-sm text-white/30">Aucune entité récurrente détectée pour le moment.</p>}</div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Action to="/admin/blog" label="Blog" description="Publications éditoriales" icon={NewspaperIcon} />
      <Action to="/admin/fashion-day-events" label="Perfect Fashion Day" description="Éditions et participants" icon={SparklesIcon} />
      <Action to="/admin/media-library" label="Médiathèque" description="Images réutilisables" icon={PhotoIcon} />
      <Action to="/admin/models" label="Mannequins" description="Profils et portfolios" icon={UsersIcon} />
    </section>
  </>;
};

const Metric: React.FC<{ label: string; value: string | number; note: string; icon: React.ElementType; accent?: boolean }> = ({ label, value, note, icon: Icon, accent }) => <div className={`rounded-xl border p-4 ${accent ? 'border-pm-gold/25 bg-pm-gold/[0.06]' : 'border-white/[0.08] bg-white/[0.025]'}`}><div className="flex items-start justify-between gap-2"><span className="text-[8px] font-black uppercase tracking-[0.22em] text-white/30">{label}</span><Icon className={`h-4 w-4 ${accent ? 'text-pm-gold' : 'text-white/25'}`} /></div><strong className={`mt-3 block font-playfair text-4xl ${accent ? 'text-pm-gold' : 'text-white'}`}>{value}</strong><small className="mt-1 block text-[10px] text-white/30">{note}</small></div>;
const QuickLink: React.FC<{ to: string; label: string; count: number; icon: React.ElementType }> = ({ to, label, count, icon: Icon }) => <Link to={to} className="flex items-center gap-3 rounded-lg border border-white/[0.06] p-3 text-sm text-white/55 hover:border-pm-gold/20 hover:text-white"><Icon className="h-4 w-4 text-pm-gold" /><span className="flex-1">{label}</span><b className={count ? 'text-pm-gold' : 'text-white/20'}>{count}</b></Link>;
const Action: React.FC<{ to: string; label: string; description: string; icon: React.ElementType }> = ({ to, label, description, icon: Icon }) => <Link to={to} className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition hover:border-pm-gold/25 hover:bg-pm-gold/[0.04]"><Icon className="h-5 w-5 text-pm-gold" /><b className="mt-4 block font-playfair text-lg text-white">{label}</b><small className="mt-1 block text-xs text-white/30">{description}</small><ArrowRightIcon className="mt-4 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-pm-gold" /></Link>;

export default Admin;
