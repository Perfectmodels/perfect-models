import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminPagePermissions } from '@/types';

export const dynamic = 'force-dynamic';

function can(permissions: Record<string, boolean> | undefined, key: keyof AdminPagePermissions) {
  return Boolean(permissions?.[key]);
}

function formatDate(value?: string) {
  if (!value) return 'Date à définir';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/manager');
  if (profile.role === 'admin') redirect('/admin');
  if (profile.role !== 'manager') redirect('/profil');

  const permissions = profile.adminPermissions || {};
  const supabase = createSupabaseAdminClient() as any;
  const [models, bookings, pendingBookings, absences, briefs, classroom, requests, latestBookings, latestBriefs, needsAttention] = await Promise.all([
    supabase.from('models').select('*', { head: true, count: 'exact' }).eq('is_active', true),
    supabase.from('booking_requests').select('*', { head: true, count: 'exact' }),
    supabase.from('booking_requests').select('*', { head: true, count: 'exact' }).in('status', ['Nouveau', 'new', 'pending', 'en attente']),
    supabase.from('absences').select('*', { head: true, count: 'exact' }),
    supabase.from('photoshoot_briefs').select('*', { head: true, count: 'exact' }),
    supabase.from('course_progress').select('*', { head: true, count: 'exact' }),
    supabase.from('classroom_requests').select('*', { head: true, count: 'exact' }).in('status', ['new', 'pending', 'en attente']),
    supabase.from('booking_requests').select('id,name,model_id,status,created_at').order('created_at', { ascending: false }).limit(6),
    supabase.from('photoshoot_briefs').select('id,title,event_date,location,status,created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('models').select('id,name,image_url,level,status,location,email,phone,height,is_public').or('status.neq.active,image_url.is.null,email.is.null,phone.is.null,height.is.null,is_public.eq.false').order('name').limit(8),
  ]);

  const signals = [
    { label: 'Talents actifs', value: Number(models.count || 0), href: '/admin/models', permission: 'models' as const, tone: 'bg-pm-coral text-white', note: 'Profils suivis par l’agence' },
    { label: 'Bookings à traiter', value: Number(pendingBookings.count || 0), href: '/admin/bookings', permission: 'bookings' as const, tone: 'bg-pm-gold-light text-pm-ink', note: `${Number(bookings.count || 0)} demande(s) au total` },
    { label: 'Présences à suivre', value: Number(absences.count || 0), href: '/admin/absences', permission: 'absences' as const, tone: 'bg-pm-sage text-pm-ink', note: 'Absences et suivi terrain' },
    { label: 'Demandes Classroom', value: Number(requests.count || 0), href: '/admin/classroom-progress', permission: 'classroomProgress' as const, tone: 'bg-pm-wine text-white', note: 'Demandes en attente' },
  ].filter(item => can(permissions, item.permission));

  const actions = [
    ['Mettre à jour un talent', '/admin/models', 'models'],
    ['Traiter un booking', '/admin/bookings', 'bookings'],
    ['Préparer un brief', '/admin/artistic-direction', 'artisticDirection'],
    ['Suivre la formation', '/admin/classroom-progress', 'classroomProgress'],
    ['Consulter les paiements', '/admin/payments', 'payments'],
  ] as const;
  const visibleActions = actions.filter(([, , permission]) => can(permissions, permission));
  const attentionRows = Array.isArray(needsAttention.data) ? needsAttention.data : [];

  return (
    <div className="space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-teal px-6 py-9 text-white shadow-[0_28px_80px_rgba(45,117,108,.16)] sm:px-9 lg:px-12">
        <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-pm-gold-light/45 blur-3xl motion-reduce:blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
          <div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-pm-gold-light">Espace manager · Périmètre délégué</p><h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.04em] sm:text-6xl lg:text-7xl">Bonjour {profile.name?.split(' ')[0] || 'Manager'},<br /><em className="font-normal text-pm-peach">vos talents comptent sur vous.</em></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/78">Suivez les profils, bookings, présences et progressions pédagogiques uniquement dans le périmètre que l’administrateur vous a délégué.</p></div>
          <div className="rounded-[1.7rem] border border-white/25 bg-white/10 p-5 backdrop-blur-sm"><p className="text-xs font-extrabold uppercase tracking-[.1em] text-white/70">Périmètre actif</p><p className="mt-3 font-playfair text-5xl font-semibold">{visibleActions.length}</p><p className="mt-2 text-sm leading-5 text-white/70">module{visibleActions.length > 1 ? 's' : ''} de gestion accessible{visibleActions.length > 1 ? 's' : ''}</p></div>
        </div>
      </section>

      {signals.length > 0 && <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs manager">{signals.map(signal => <Link key={signal.label} href={signal.href} className={`group rounded-[1.7rem] p-5 shadow-[0_18px_50px_rgba(91,46,37,.07)] transition hover:-translate-y-0.5 motion-reduce:transform-none sm:p-6 ${signal.tone}`}><div className="flex items-start justify-between gap-3"><p className="max-w-[12rem] text-xs font-extrabold uppercase leading-5 tracking-[.08em] opacity-80">{signal.label}</p><span aria-hidden="true">↗</span></div><p className="mt-6 font-playfair text-6xl font-semibold leading-none">{signal.value}</p><p className="mt-3 text-xs font-semibold opacity-70">{signal.note}</p></Link>)}</section>}

      <section className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
        <div className="control-card"><p className="control-kicker">Outils autorisés</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Agir maintenant</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{visibleActions.map(([actionLabel, href], index) => <Link key={href} href={href} className={`group rounded-[1.35rem] p-4 transition hover:-translate-y-0.5 motion-reduce:transform-none ${index % 3 === 0 ? 'bg-pm-peach' : index % 3 === 1 ? 'bg-pm-sage' : 'bg-pm-gold-light/40'}`}><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine/65">Action 0{index + 1}</p><p className="mt-4 font-playfair text-xl font-semibold">{actionLabel}</p><p className="mt-3 text-xs font-extrabold text-pm-coral underline underline-offset-4">Ouvrir ↗</p></Link>)}{!visibleActions.length && <p className="text-sm text-pm-ink/45">Aucun module n’a encore été attribué à votre compte.</p>}</div></div>

        <div className="control-card">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="control-kicker">Accompagnement</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Talents à compléter ou surveiller</h2></div>{can(permissions, 'models') && <Link href="/admin/models" className="inline-flex min-h-11 items-center text-xs font-extrabold text-pm-coral underline underline-offset-4">Gérer les talents ↗</Link>}</div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{attentionRows.map((model: any) => <article key={model.id} className="flex items-center gap-3 rounded-[1.3rem] bg-pm-ivory p-3">{model.image_url ? <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-pm-sand"><Image src={model.image_url} alt={model.name || 'Mannequin'} fill sizes="48px" className="object-cover" /></div> : <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pm-peach font-playfair text-lg text-pm-wine">{String(model.name || '?').charAt(0)}</span>}<div className="min-w-0"><p className="truncate text-sm font-bold">{model.name}</p><p className="mt-1 truncate text-xs font-extrabold uppercase tracking-[.06em] text-pm-ink/50">{!model.image_url ? 'Photo manquante' : !model.email ? 'E-mail manquant' : !model.phone ? 'Téléphone manquant' : !model.height ? 'Taille manquante' : model.is_public === false ? 'Profil privé' : model.status || model.level || 'À vérifier'}</p></div></article>)}{!attentionRows.length && <p className="text-sm text-pm-ink/45">Tous les profils sont actuellement complets.</p>}</div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Timeline title="Derniers bookings" href={can(permissions, 'bookings') ? '/admin/bookings' : undefined} rows={(latestBookings.data || []).map((item: any) => ({ title: item.name || 'Demande de booking', meta: `${item.status || 'nouveau'} · ${formatDate(item.created_at)}` }))} empty="Aucun booking récent." />
        <Timeline title="Briefs de production" href={can(permissions, 'artisticDirection') ? '/admin/artistic-direction' : undefined} rows={(latestBriefs.data || []).map((item: any) => ({ title: item.title || 'Brief sans titre', meta: `${item.location || item.status || 'À préparer'} · ${formatDate(item.event_date || item.created_at)}` }))} empty="Aucun brief récent." />
      </section>

      <section className="grid gap-4 sm:grid-cols-3"><MiniStat label="Briefs enregistrés" value={Number(briefs.count || 0)} tone="bg-pm-peach"/><MiniStat label="Progressions suivies" value={Number(classroom.count || 0)} tone="bg-pm-sage"/><MiniStat label="Droits attribués" value={Object.values(permissions).filter(Boolean).length} tone="bg-pm-gold-light/45"/></section>
    </div>
  );
}

function Timeline({ title, href, rows, empty }: { title: string; href?: string; rows: Array<{ title: string; meta: string }>; empty: string }) {
  return <section className="control-card"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="control-kicker">Flux récent</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{title}</h2></div>{href && <Link href={href} className="inline-flex min-h-11 items-center text-xs font-extrabold text-pm-coral underline underline-offset-4">Voir tout ↗</Link>}</div><div className="mt-5 divide-y divide-pm-ink/[.08]">{rows.length ? rows.map((row, index) => <div key={`${row.title}-${index}`} className="flex items-start gap-3 py-4"><span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 rounded-full bg-pm-coral"/><div><p className="text-sm font-bold">{row.title}</p><p className="mt-1 text-xs font-bold uppercase tracking-[.06em] text-pm-ink/50">{row.meta}</p></div></div>) : <p className="py-8 text-sm text-pm-ink/45">{empty}</p>}</div></section>;
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <article className={`rounded-[1.7rem] p-5 ${tone}`}><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine/65">{label}</p><p className="mt-4 font-playfair text-5xl font-semibold">{value}</p></article>;
}
