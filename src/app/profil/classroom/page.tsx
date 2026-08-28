import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function ClassroomPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/classroom');
  if (profile.role === 'admin') redirect('/admin/classroom-progress');
  if (profile.role === 'manager') redirect('/manager');
  if (profile.role !== 'student') redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const [courses, progress, messages, requests] = await Promise.all([
    supabase.from('courses').select('id,title,description,position,updated_at').eq('is_active', true).order('position'),
    supabase.from('course_progress').select('course_id,progress,completed_at,updated_at').eq('user_id', profile.userId),
    supabase.from('classroom_messages').select('id,subject,body,status,created_at').eq('model_id', profile.profileId).order('created_at', { ascending: false }).limit(5),
    supabase.from('classroom_requests').select('id,request_type,status,message,created_at').eq('model_id', profile.profileId).order('created_at', { ascending: false }).limit(5),
  ]);
  const lessons = Array.isArray(courses.data) ? courses.data : [];
  const progressMap = new Map<string, number>((progress.data || []).map((row: any) => [String(row.course_id), Number(row.progress || (row.completed_at ? 100 : 0))]));
  const average = lessons.length ? Math.round(lessons.reduce((sum: number, lesson: any) => sum + Math.min(100, progressMap.get(lesson.id) || 0), 0) / lessons.length) : 0;
  const completed = lessons.filter((lesson: any) => (progressMap.get(lesson.id) || 0) >= 100).length;

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1450px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.3rem] bg-pm-sage p-6 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-pm-gold-light/55 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-teal">PMM Campus · Classroom personnelle</p><h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-6xl lg:text-7xl">Apprendre le métier.<br /><em className="font-normal text-pm-wine">Affirmer sa présence.</em></h1><p className="mt-5 max-w-2xl text-sm leading-7 text-pm-ink/55">Retrouvez vos cours théoriques, votre progression et les échanges pédagogiques avec l’équipe PMM.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/profil" className="control-button">← Mon tableau de bord</Link><Link href="/formations/forum" className="control-button control-button--soft">Forum de la classe</Link></div></div><div className="grid grid-cols-2 gap-3"><Stat value={`${average}%`} label="Progression" tone="bg-pm-teal text-white"/><Stat value={`${completed}/${lessons.length}`} label="Cours terminés" tone="bg-pm-coral text-white"/></div></div>
        </section>

        <section className="control-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="control-kicker">Programme théorique</p><h2 className="mt-2 font-playfair text-4xl font-semibold">Vos cours</h2></div><p className="text-xs font-bold uppercase tracking-[.15em] text-pm-ink/35">{lessons.length} module(s) disponible(s)</p></div>
          {lessons.length ? <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{lessons.map((lesson: any, index: number) => { const value = Math.min(100, progressMap.get(lesson.id) || 0); return <Link key={lesson.id} href={`/formation/module/${lesson.id}`} className={`group rounded-[1.7rem] p-5 transition hover:-translate-y-1 ${index % 3 === 0 ? 'bg-pm-peach' : index % 3 === 1 ? 'bg-pm-gold-light/40' : 'bg-pm-sage'}`}><div className="flex items-start justify-between"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine/60">Cours 0{index + 1}</span><span className="text-pm-coral transition group-hover:translate-x-1">↗</span></div><h3 className="mt-8 font-playfair text-3xl font-semibold leading-tight">{lesson.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-pm-ink/48">{lesson.description || 'Contenu pédagogique PMM.'}</p><div className="mt-8"><div className="mb-2 flex justify-between text-[9px] font-black uppercase tracking-[.13em] text-pm-ink/40"><span>Progression</span><span>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-pm-wine" style={{ width: `${value}%` }} /></div></div></Link>; })}</div> : <div className="mt-7 rounded-[1.7rem] border border-dashed border-pm-ink/15 bg-pm-paper p-10 text-center"><h3 className="font-playfair text-3xl font-semibold">Le programme se prépare.</h3><p className="mt-3 text-sm text-pm-ink/45">L’équipe pédagogique publiera les premiers cours dans cet espace.</p></div>}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Feed title="Messages de la Classroom" items={(messages.data || []).map((item: any) => ({ title: item.subject || 'Message pédagogique', body: item.body, status: item.status }))} empty="Aucun message pédagogique." />
          <Feed title="Mes demandes" items={(requests.data || []).map((item: any) => ({ title: item.request_type || 'Demande', body: item.message, status: item.status }))} empty="Aucune demande en cours." />
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) { return <div className={`rounded-[1.6rem] p-5 ${tone}`}><p className="font-playfair text-4xl font-semibold sm:text-5xl">{value}</p><p className="mt-3 text-[8px] font-black uppercase tracking-[.18em] opacity-70">{label}</p></div>; }
function Feed({ title, items, empty }: { title: string; items: Array<{ title: string; body?: string; status?: string }>; empty: string }) { return <section className="control-card"><p className="control-kicker">Échanges</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{title}</h2><div className="mt-5 divide-y divide-pm-ink/[.08]">{items.length ? items.map((item, index) => <article key={`${item.title}-${index}`} className="py-4"><div className="flex items-start justify-between gap-4"><p className="text-sm font-bold">{item.title}</p><span className="rounded-full bg-pm-peach px-2.5 py-1 text-[7px] font-black uppercase tracking-[.13em] text-pm-wine">{item.status || 'nouveau'}</span></div>{item.body && <p className="mt-2 line-clamp-2 text-xs leading-5 text-pm-ink/45">{item.body}</p>}</article>) : <p className="py-8 text-sm text-pm-ink/40">{empty}</p>}</div></section>; }
