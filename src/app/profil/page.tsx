import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import FirstLoginSecurityPrompt from '@/components/auth/FirstLoginSecurityPrompt';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { readCourseProgress } from '@/lib/classroom-progress';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const LIST_SIZE = 4;
const PORTFOLIO_SIZE = 8;

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = { searchParams: Promise<SearchParams> };

function formatDate(value?: string) {
  if (!value) return 'À définir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function pageNumber(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(String(raw || '1'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function rangeFor(page: number, size: number) {
  const from = (page - 1) * size;
  return [from, from + size - 1] as const;
}

export default async function Page({ searchParams }: PageProps) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil');
  if (profile.role === 'admin') redirect('/admin');
  if (profile.role === 'manager') redirect('/manager');
  if (profile.role === 'jury') redirect('/jury/casting');
  if (profile.role === 'registration') redirect('/enregistrement/casting');

  const params = await searchParams;
  const pages = {
    portfolio: pageNumber(params.portfolioPage),
    notifications: pageNumber(params.notificationsPage),
    bookings: pageNumber(params.bookingsPage),
    events: pageNumber(params.eventsPage),
    absences: pageNumber(params.absencesPage),
    payments: pageNumber(params.paymentsPage),
  };

  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase.from('models').select('*').eq('id', profile.profileId).maybeSingle();
  const [portfolioRange, notificationRange, bookingRange, eventRange, absenceRange, paymentRange] = [
    rangeFor(pages.portfolio, PORTFOLIO_SIZE),
    rangeFor(pages.notifications, LIST_SIZE),
    rangeFor(pages.bookings, LIST_SIZE),
    rangeFor(pages.events, LIST_SIZE),
    rangeFor(pages.absences, LIST_SIZE),
    rangeFor(pages.payments, LIST_SIZE),
  ];

  const [images, courses, progress, notifications, bookings, absences, payments, events] = await Promise.all([
    model
      ? supabase.from('model_portfolio_images').select('id,url,position,caption', { count: 'exact' }).eq('model_id', profile.profileId).order('position').range(...portfolioRange)
      : Promise.resolve({ data: [], count: 0 }),
    supabase.from('courses').select('id,title,description,position').eq('is_active', true).order('position'),
    supabase.from('course_progress').select('course_id,progress,completed_at,updated_at').eq('user_id', profile.userId),
    supabase.from('notifications').select('id,title,body,href,is_read,created_at', { count: 'exact' }).or(`recipient_user_id.eq.${profile.userId},audience_role.eq.student`).order('created_at', { ascending: false }).range(...notificationRange),
    model
      ? supabase.from('booking_requests').select('id,name,status,created_at', { count: 'exact' }).eq('model_id', profile.profileId).order('created_at', { ascending: false }).range(...bookingRange)
      : Promise.resolve({ data: [], count: 0 }),
    model
      ? supabase.from('absences').select('id,event_date,reason,status', { count: 'exact' }).eq('model_id', profile.profileId).order('event_date', { ascending: false }).range(...absenceRange)
      : Promise.resolve({ data: [], count: 0 }),
    model
      ? supabase.from('monthly_payments').select('id,period,amount,currency,status,paid_at', { count: 'exact' }).eq('model_id', profile.profileId).order('created_at', { ascending: false }).range(...paymentRange)
      : Promise.resolve({ data: [], count: 0 }),
    model
      ? supabase.from('model_events').select('id,name,event_date,date_label,location,role', { count: 'exact' }).eq('model_id', profile.profileId).order('event_date', { ascending: false }).range(...eventRange)
      : Promise.resolve({ data: [], count: 0 }),
  ]);

  const portfolio = Array.isArray(images.data) ? images.data : [];
  const activeCourses = Array.isArray(courses.data) ? courses.data : [];
  const progressRows = Array.isArray(progress.data) ? progress.data : [];
  const progressMap = new Map<string, number>(progressRows.map((row: any) => [String(row.course_id), readCourseProgress(row)]));
  const trainingProgress = activeCourses.length
    ? Math.round(activeCourses.reduce((total: number, course: any) => total + Math.min(100, progressMap.get(course.id) || 0), 0) / activeCourses.length)
    : 0;

  const readinessChecks = [
    model?.image_url,
    model?.phone,
    model?.email,
    model?.height,
    model?.location,
    model?.experience,
    model?.journey,
    Array.isArray(model?.categories) && model.categories.length,
    model?.measurements && Object.keys(model.measurements).length,
    Number(images.count || 0) > 0,
  ];
  const profileScore = Math.round((readinessChecks.filter(Boolean).length / readinessChecks.length) * 100);
  const nextCourse = activeCourses.find((course: any) => (progressMap.get(course.id) || 0) < 100);

  const actionItems = [
    !model?.image_url ? { title: 'Photo principale manquante', body: 'Votre fiche publique a besoin d’une photo principale validée.', href: '/contact?subject=Photo%20profil%20mannequin', cta: 'Contacter l’agence' } : null,
    profileScore < 80 ? { title: `Profil complété à ${profileScore}%`, body: 'Certaines informations professionnelles sont encore à compléter.', href: '/contact?subject=Mise%20à%20jour%20profil%20mannequin', cta: 'Demander une mise à jour' } : null,
    nextCourse ? { title: 'Formation à poursuivre', body: nextCourse.title, href: `/formation/module/${nextCourse.id}`, cta: 'Continuer le module' } : null,
    Number(notifications.count || 0) > 0 ? { title: 'Consulter les informations récentes', body: `${notifications.count || 0} notification(s) disponibles dans votre fil personnel.`, href: '#notifications', cta: 'Voir le fil' } : null,
  ].filter(Boolean) as Array<{ title: string; body: string; href: string; cta: string }>;

  const queryState = {
    portfolioPage: pages.portfolio,
    notificationsPage: pages.notifications,
    bookingsPage: pages.bookings,
    eventsPage: pages.events,
    absencesPage: pages.absences,
    paymentsPage: pages.payments,
  };

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-peach p-6 sm:p-9 lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-pm-gold-light/55 blur-3xl motion-reduce:blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-pm-wine">Mon espace mannequin · PMM Campus</p>
              <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.04em] sm:text-6xl lg:text-7xl">Bonjour, {model?.name || profile.name}.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-pm-ink/65">Votre carrière, votre image et votre formation réunies dans un seul espace personnel.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/profil/classroom" className="control-button">Continuer ma formation ↗</Link>
                <Link href={model?.id ? `/mannequins/${model.id}` : '/mannequins'} className="control-button control-button--soft">Voir mon profil public</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3"><Score value={profileScore} label="Profil prêt" tone="bg-pm-coral text-white"/><Score value={trainingProgress} label="Formation" tone="bg-pm-wine text-white"/></div>
          </div>
        </section>

        <section className="control-card" aria-labelledby="action-center-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="control-kicker">Centre d’actions</p><h2 id="action-center-title" className="mt-2 font-playfair text-3xl font-semibold">Ce qui mérite votre attention</h2></div>
            <span className="rounded-full bg-pm-sage px-3 py-2 text-xs font-extrabold text-pm-teal">{actionItems.length} action{actionItems.length > 1 ? 's' : ''}</span>
          </div>
          {actionItems.length ? <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{actionItems.map((item, index) => <article key={`${item.title}-${index}`} className={`rounded-[1.4rem] p-5 ${index % 3 === 0 ? 'bg-pm-peach' : index % 3 === 1 ? 'bg-pm-sage' : 'bg-pm-gold-light/40'}`}><p className="text-sm font-extrabold">{item.title}</p><p className="mt-2 text-sm leading-6 text-pm-ink/60">{item.body}</p><Link href={item.href} className="mt-5 inline-flex min-h-11 items-center text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine underline decoration-pm-coral underline-offset-4">{item.cta} ↗</Link></article>)}</div> : <p className="mt-6 rounded-[1.4rem] bg-pm-sage p-5 text-sm font-semibold text-pm-teal">Votre espace ne signale aucune action prioritaire.</p>}
        </section>

        <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
          <div className="control-card overflow-hidden !p-0">
            <div className="relative aspect-[4/4.2] w-full bg-pm-sage">
              {model?.image_url ? <Image src={model.image_url} alt={model.name || profile.name} fill priority sizes="(max-width: 1280px) 100vw, 38vw" className="object-cover" /> : <div className="grid h-full place-items-center text-sm font-semibold text-pm-ink/45">Photo de profil à ajouter</div>}
            </div>
            <div className="p-6"><div className="flex items-start justify-between"><div><p className="control-kicker">Identité professionnelle</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{model?.name || profile.name}</h2></div><span className={`rounded-full px-3 py-2 text-xs font-extrabold uppercase tracking-[.08em] ${model?.is_public ? 'bg-pm-sage text-pm-teal' : 'bg-pm-peach text-pm-wine'}`}>{model?.is_public ? 'Public' : 'Privé'}</span></div><div className="mt-5 grid grid-cols-2 gap-y-4 text-sm"><Data label="Taille" value={model?.height}/><Data label="Niveau" value={model?.level}/><Data label="Ville" value={model?.location}/><Data label="Statut" value={model?.status}/></div></div>
          </div>

          <div className="space-y-5">
            <section className="control-card">
              <div className="flex items-end justify-between gap-4"><div><p className="control-kicker">Classroom</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Votre parcours d’apprentissage</h2></div><Link href="/profil/classroom" className="inline-flex min-h-11 items-center text-sm font-extrabold text-pm-coral underline underline-offset-4">Ouvrir la formation ↗</Link></div>
              <div className="mt-6 rounded-[1.5rem] bg-pm-sage p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.1em] text-pm-teal">Prochaine étape</p><h3 className="mt-2 font-playfair text-2xl font-semibold">{nextCourse?.title || (activeCourses.length ? 'Parcours terminé' : 'Cours en préparation')}</h3></div><span className="font-playfair text-4xl font-semibold text-pm-teal">{trainingProgress}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/65" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={trainingProgress} aria-label="Progression globale de formation"><div className="h-full rounded-full bg-pm-teal" style={{ width: `${trainingProgress}%` }} /></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">{activeCourses.slice(0, 3).map((course: any, index: number) => { const value = Math.min(100, progressMap.get(course.id) || 0); return <Link key={course.id} href={`/formation/module/${course.id}`} className="rounded-[1.3rem] border border-pm-ink/[.07] bg-white/70 p-4 transition hover:-translate-y-0.5 motion-reduce:transform-none"><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine">Module 0{index + 1}</p><p className="mt-3 line-clamp-2 font-playfair text-xl font-semibold">{course.title}</p><p className="mt-4 text-xs font-bold text-pm-ink/50">{value}% complété</p></Link>; })}{!activeCourses.length && <p className="text-sm text-pm-ink/45">Les prochains cours seront publiés par l’agence.</p>}</div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <MiniMetric label="Bookings" value={Number(bookings.count || 0)} description="Demandes liées à votre profil" tone="bg-pm-gold-light/45" />
              <MiniMetric label="Événements" value={Number(events.count || 0)} description="Expériences enregistrées" tone="bg-pm-peach" />
              <MiniMetric label="Portfolio" value={Number(images.count || 0)} description="Images professionnelles" tone="bg-pm-sage" />
            </section>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="control-card">
            <div className="flex items-center justify-between"><div><p className="control-kicker">Portfolio</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Vos images</h2></div><span className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/45">{Number(images.count || 0)} média(s)</span></div>
            {portfolio.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{portfolio.map((image: any, index: number) => <div key={image.id || `${image.position}-${image.url}`} className="relative aspect-[3/4] overflow-hidden rounded-[1.2rem] bg-pm-sand"><Image src={image.url} alt={image.caption || `Portfolio mannequin ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" /></div>)}</div> : <div className="mt-6 rounded-[1.5rem] border border-dashed border-pm-ink/15 bg-pm-ivory p-8 text-center text-sm text-pm-ink/45">Votre portfolio sera enrichi par l’équipe PMM.</div>}
            <Pager current={pages.portfolio} total={Number(images.count || 0)} size={PORTFOLIO_SIZE} param="portfolioPage" state={queryState} />
          </div>

          <div id="notifications" className="control-card scroll-mt-28">
            <div className="flex items-center justify-between"><div><p className="control-kicker">Fil personnel</p><h2 className="mt-2 font-playfair text-3xl font-semibold">À retenir</h2></div><span className="rounded-full bg-pm-peach px-3 py-2 text-xs font-extrabold text-pm-wine">{Number(notifications.count || 0)}</span></div>
            <div className="mt-5 divide-y divide-pm-ink/[.08]">{(notifications.data || []).map((item: any) => <div key={item.id} className="py-4"><div className="flex items-start gap-3"><span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 rounded-full ${item.is_read ? 'bg-pm-sand' : 'bg-pm-coral'}`} /><div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-pm-ink/55">{item.body}</p><p className="mt-2 text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine/55">{formatDate(item.created_at)}</p>{item.href && <Link href={item.href} className="mt-2 inline-flex min-h-10 items-center text-xs font-extrabold text-pm-coral underline underline-offset-4">Ouvrir ↗</Link>}</div></div></div>)}{!(notifications.data || []).length && <p className="py-8 text-sm text-pm-ink/45">Aucune notification pour le moment.</p>}</div>
            <Pager current={pages.notifications} total={Number(notifications.count || 0)} size={LIST_SIZE} param="notificationsPage" state={queryState} />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <RecordPanel title="Bookings" rows={(bookings.data || []).map((item: any) => ({ title: item.name || 'Demande de booking', meta: `${item.status || 'nouveau'} · ${formatDate(item.created_at)}` }))} empty="Aucun booking enregistré." current={pages.bookings} total={Number(bookings.count || 0)} param="bookingsPage" state={queryState} />
          <RecordPanel title="Engagements" rows={(events.data || []).map((item: any) => ({ title: item.name, meta: `${item.role || 'Participation'} · ${formatDate(item.event_date || item.date_label)}` }))} empty="Aucun événement enregistré." current={pages.events} total={Number(events.count || 0)} param="eventsPage" state={queryState} />
          <RecordPanel title="Présences" rows={(absences.data || []).map((item: any) => ({ title: item.reason || 'Absence', meta: `${item.status || 'enregistrée'} · ${formatDate(item.event_date)}` }))} empty="Aucune absence enregistrée." current={pages.absences} total={Number(absences.count || 0)} param="absencesPage" state={queryState} />
          <RecordPanel title="Suivi financier" rows={(payments.data || []).map((item: any) => ({ title: `${item.amount || 0} ${item.currency || 'FCFA'}`, meta: `${item.period || 'Période'} · ${item.status || 'en attente'}` }))} empty="Aucun paiement enregistré." current={pages.payments} total={Number(payments.count || 0)} param="paymentsPage" state={queryState} />
        </section>
      </div>
      <FirstLoginSecurityPrompt />
    </main>
  );
}

function Score({ value, label, tone }: { value: number; label: string; tone: string }) {
  return <div className={`rounded-[1.6rem] p-5 ${tone}`}><p className="font-playfair text-5xl font-semibold">{value}%</p><p className="mt-3 text-xs font-extrabold uppercase tracking-[.08em] opacity-80">{label}</p></div>;
}

function Data({ label, value }: { label: string; value?: unknown }) {
  return <div><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine/60">{label}</p><p className="mt-1 font-semibold">{String(value || '—')}</p></div>;
}

function MiniMetric({ label, value, description, tone }: { label: string; value: number; description: string; tone: string }) {
  return <article className={`rounded-[1.5rem] p-5 ${tone}`}><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine/65">{label}</p><p className="mt-3 font-playfair text-4xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-pm-ink/55">{description}</p></article>;
}

function RecordPanel({ title, rows, empty, current, total, param, state }: { title: string; rows: Array<{ title: string; meta: string }>; empty: string; current: number; total: number; param: keyof typeof state; state: Record<string, number> }) {
  return <section className="control-card"><p className="control-kicker">Historique</p><h2 className="mt-2 font-playfair text-2xl font-semibold">{title}</h2><div className="mt-4 divide-y divide-pm-ink/[.08]">{rows.length ? rows.map((row, index) => <div key={`${row.title}-${index}`} className="py-4"><p className="text-sm font-bold">{row.title}</p><p className="mt-1 text-xs font-bold uppercase tracking-[.08em] text-pm-ink/50">{row.meta}</p></div>) : <p className="py-7 text-sm text-pm-ink/45">{empty}</p>}</div><Pager current={current} total={total} size={LIST_SIZE} param={String(param)} state={state} /></section>;
}

function Pager({ current, total, size, param, state }: { current: number; total: number; size: number; param: string; state: Record<string, number> }) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  if (totalPages <= 1) return null;
  const hrefFor = (page: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) query.set(key, String(key === param ? page : value));
    return `/profil?${query.toString()}`;
  };
  return <nav className="mt-5 flex items-center justify-between border-t border-pm-ink/[.08] pt-4" aria-label="Pagination"><Link href={hrefFor(Math.max(1, current - 1))} aria-disabled={current <= 1} tabIndex={current <= 1 ? -1 : undefined} className={`inline-flex min-h-11 items-center rounded-full border border-pm-ink/15 px-4 text-xs font-extrabold ${current <= 1 ? 'pointer-events-none opacity-35' : 'hover:bg-pm-peach'}`}>← Précédent</Link><span className="text-xs font-extrabold text-pm-ink/55">Page {Math.min(current, totalPages)} / {totalPages}</span><Link href={hrefFor(Math.min(totalPages, current + 1))} aria-disabled={current >= totalPages} tabIndex={current >= totalPages ? -1 : undefined} className={`inline-flex min-h-11 items-center rounded-full border border-pm-ink/15 px-4 text-xs font-extrabold ${current >= totalPages ? 'pointer-events-none opacity-35' : 'hover:bg-pm-peach'}`}>Suivant →</Link></nav>;
}
