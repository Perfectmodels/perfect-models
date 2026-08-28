import Link from 'next/link';
import { redirect } from 'next/navigation';
import FirstLoginSecurityPrompt from '@/components/auth/FirstLoginSecurityPrompt';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function formatDate(value?: string) {
  if (!value) return 'À définir';
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil');
  if (profile.role === 'admin') redirect('/admin');
  if (profile.role === 'manager') redirect('/manager');
  if (profile.role === 'jury') redirect('/jury/casting');
  if (profile.role === 'registration') redirect('/enregistrement/casting');

  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase.from('models').select('*').eq('id', profile.profileId).maybeSingle();
  const [images, courses, progress, notifications, bookings, absences, payments, events] = await Promise.all([
    model ? supabase.from('model_portfolio_images').select('id,url,position,caption').eq('model_id', profile.profileId).order('position') : Promise.resolve({ data: [] }),
    supabase.from('courses').select('id,title,description,position').eq('is_active', true).order('position'),
    supabase.from('course_progress').select('course_id,progress,completed_at,updated_at').eq('user_id', profile.userId),
    supabase.from('notifications').select('id,title,body,href,is_read,created_at').or(`recipient_user_id.eq.${profile.userId},audience_role.eq.student`).order('created_at', { ascending: false }).limit(5),
    model ? supabase.from('booking_requests').select('id,name,status,created_at').eq('model_id', profile.profileId).order('created_at', { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
    model ? supabase.from('absences').select('id,event_date,reason,status').eq('model_id', profile.profileId).order('event_date', { ascending: false }).limit(4) : Promise.resolve({ data: [] }),
    model ? supabase.from('monthly_payments').select('id,period,amount,currency,status,paid_at').eq('model_id', profile.profileId).order('created_at', { ascending: false }).limit(4) : Promise.resolve({ data: [] }),
    model ? supabase.from('model_events').select('id,name,event_date,date_label,location,role').eq('model_id', profile.profileId).order('event_date', { ascending: false }).limit(4) : Promise.resolve({ data: [] }),
  ]);

  const portfolio = Array.isArray(images.data) ? images.data : [];
  const activeCourses = Array.isArray(courses.data) ? courses.data : [];
  const progressRows = Array.isArray(progress.data) ? progress.data : [];
  const progressMap = new Map<string, number>(progressRows.map((row: any) => [String(row.course_id), Number(row.progress || (row.completed_at ? 100 : 0))]));
  const trainingProgress = activeCourses.length ? Math.round(activeCourses.reduce((total: number, course: any) => total + Math.min(100, progressMap.get(course.id) || 0), 0) / activeCourses.length) : 0;
  const readinessChecks = [model?.image_url, model?.phone, model?.email, model?.height, model?.location, model?.experience, model?.journey, Array.isArray(model?.categories) && model.categories.length, model?.measurements && Object.keys(model.measurements).length, portfolio.length];
  const profileScore = Math.round((readinessChecks.filter(Boolean).length / readinessChecks.length) * 100);
  const nextCourse = activeCourses.find((course: any) => (progressMap.get(course.id) || 0) < 100);

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-peach p-6 sm:p-9 lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-pm-gold-light/65 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
            <div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-wine">Mon espace mannequin · PMM Campus</p><h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.04em] sm:text-6xl lg:text-7xl">Bonjour, {model?.name || profile.name}.</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-pm-ink/58">Votre carrière, votre image et votre formation réunies dans un seul espace personnel.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/profil/classroom" className="control-button">Continuer ma formation ↗</Link><Link href={model?.id ? `/mannequins/${model.id}` : '/mannequins'} className="control-button control-button--soft">Voir mon profil public</Link></div></div>
            <div className="grid grid-cols-2 gap-3"><Score value={profileScore} label="Profil prêt" tone="bg-pm-coral text-white"/><Score value={trainingProgress} label="Formation" tone="bg-pm-wine text-white"/></div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]">
          <div className="control-card overflow-hidden !p-0">
            {model?.image_url ? <img src={model.image_url} alt={model.name || profile.name} className="aspect-[4/4.2] w-full object-cover" /> : <div className="grid aspect-[4/4.2] place-items-center bg-pm-sage text-sm font-semibold text-pm-ink/35">Photo de profil à ajouter</div>}
            <div className="p-6"><div className="flex items-start justify-between"><div><p className="control-kicker">Identité professionnelle</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{model?.name || profile.name}</h2></div><span className={`rounded-full px-3 py-2 text-[8px] font-black uppercase tracking-[.16em] ${model?.is_public ? 'bg-pm-sage text-pm-teal' : 'bg-pm-peach text-pm-wine'}`}>{model?.is_public ? 'Public' : 'Privé'}</span></div><div className="mt-5 grid grid-cols-2 gap-y-4 text-sm"><Data label="Taille" value={model?.height}/><Data label="Niveau" value={model?.level}/><Data label="Ville" value={model?.location}/><Data label="Statut" value={model?.status}/></div></div>
          </div>

          <div className="space-y-5">
            <section className="control-card">
              <div className="flex items-end justify-between gap-4"><div><p className="control-kicker">Classroom</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Votre parcours d’apprentissage</h2></div><Link href="/profil/classroom" className="text-xl text-pm-coral">↗</Link></div>
              <div className="mt-6 rounded-[1.5rem] bg-pm-sage p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-pm-teal">Prochaine étape</p><h3 className="mt-2 font-playfair text-2xl font-semibold">{nextCourse?.title || (activeCourses.length ? 'Parcours terminé' : 'Cours en préparation')}</h3></div><span className="font-playfair text-4xl font-semibold text-pm-teal">{trainingProgress}%</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-pm-teal" style={{ width: `${trainingProgress}%` }} /></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">{activeCourses.slice(0, 3).map((course: any, index: number) => { const value = Math.min(100, progressMap.get(course.id) || 0); return <Link key={course.id} href={`/formation/module/${course.id}`} className="rounded-[1.3rem] border border-pm-ink/[.07] bg-white/70 p-4 transition hover:-translate-y-0.5"><p className="text-[8px] font-black uppercase tracking-[.18em] text-pm-wine">Module 0{index + 1}</p><p className="mt-3 line-clamp-2 font-playfair text-xl font-semibold">{course.title}</p><p className="mt-4 text-xs font-bold text-pm-ink/40">{value}% complété</p></Link>; })}{!activeCourses.length && <p className="text-sm text-pm-ink/40">Les prochains cours seront publiés par l’agence.</p>}</div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              <MiniMetric label="Bookings" value={(bookings.data || []).length} description="Demandes liées à votre profil" tone="bg-pm-gold-light/45" />
              <MiniMetric label="Événements" value={(events.data || []).length} description="Expériences enregistrées" tone="bg-pm-peach" />
              <MiniMetric label="Portfolio" value={portfolio.length} description="Images professionnelles" tone="bg-pm-sage" />
            </section>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <div className="control-card"><div className="flex items-center justify-between"><div><p className="control-kicker">Portfolio</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Vos images</h2></div><span className="text-[9px] font-black uppercase tracking-[.18em] text-pm-ink/35">{portfolio.length} média(s)</span></div>{portfolio.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{portfolio.slice(0, 8).map((image: any) => <img key={image.id || `${image.position}-${image.url}`} src={image.url} alt={image.caption || 'Portfolio mannequin'} className="aspect-[3/4] w-full rounded-[1.2rem] object-cover" />)}</div> : <div className="mt-6 rounded-[1.5rem] border border-dashed border-pm-ink/15 bg-pm-ivory p-8 text-center text-sm text-pm-ink/40">Votre portfolio sera enrichi par l’équipe PMM.</div>}</div>
          <div className="control-card"><div className="flex items-center justify-between"><div><p className="control-kicker">Fil personnel</p><h2 className="mt-2 font-playfair text-3xl font-semibold">À retenir</h2></div><span className="h-3 w-3 rounded-full bg-pm-coral" /></div><div className="mt-5 divide-y divide-pm-ink/[.08]">{(notifications.data || []).map((item: any) => <div key={item.id} className="py-4"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${item.is_read ? 'bg-pm-sand' : 'bg-pm-coral'}`} /><div><p className="text-sm font-bold">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-pm-ink/45">{item.body}</p><p className="mt-2 text-[8px] font-black uppercase tracking-[.14em] text-pm-wine/45">{formatDate(item.created_at)}</p></div></div></div>)}{!(notifications.data || []).length && <p className="py-8 text-sm text-pm-ink/40">Aucune notification pour le moment.</p>}</div></div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Engagements" rows={(events.data || []).map((item: any) => ({ title: item.name, meta: `${item.role || 'Participation'} · ${formatDate(item.event_date || item.date_label)}` }))} empty="Aucun événement enregistré." />
          <RecordPanel title="Présences" rows={(absences.data || []).map((item: any) => ({ title: item.reason || 'Absence', meta: `${item.status || 'enregistrée'} · ${formatDate(item.event_date)}` }))} empty="Aucune absence enregistrée." />
          <RecordPanel title="Suivi financier" rows={(payments.data || []).map((item: any) => ({ title: `${item.amount || 0} ${item.currency || 'FCFA'}`, meta: `${item.period || 'Période'} · ${item.status || 'en attente'}` }))} empty="Aucun paiement enregistré." />
        </section>
      </div>
      <FirstLoginSecurityPrompt />
    </main>
  );
}

function Score({ value, label, tone }: { value: number; label: string; tone: string }) { return <div className={`rounded-[1.6rem] p-5 ${tone}`}><p className="font-playfair text-5xl font-semibold">{value}%</p><p className="mt-3 text-[8px] font-black uppercase tracking-[.18em] opacity-70">{label}</p></div>; }
function Data({ label, value }: { label: string; value?: unknown }) { return <div><p className="text-[8px] font-black uppercase tracking-[.15em] text-pm-wine/50">{label}</p><p className="mt-1 font-semibold">{String(value || '—')}</p></div>; }
function MiniMetric({ label, value, description, tone }: { label: string; value: number; description: string; tone: string }) { return <article className={`rounded-[1.5rem] p-5 ${tone}`}><p className="text-[8px] font-black uppercase tracking-[.18em] text-pm-wine/60">{label}</p><p className="mt-3 font-playfair text-4xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-pm-ink/45">{description}</p></article>; }
function RecordPanel({ title, rows, empty }: { title: string; rows: Array<{ title: string; meta: string }>; empty: string }) { return <section className="control-card"><p className="control-kicker">Historique</p><h2 className="mt-2 font-playfair text-2xl font-semibold">{title}</h2><div className="mt-4 divide-y divide-pm-ink/[.08]">{rows.length ? rows.map((row, index) => <div key={`${row.title}-${index}`} className="py-4"><p className="text-sm font-bold">{row.title}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.12em] text-pm-ink/38">{row.meta}</p></div>) : <p className="py-7 text-sm text-pm-ink/40">{empty}</p>}</div></section>; }
