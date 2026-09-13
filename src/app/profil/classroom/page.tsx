import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type AcademyModule = { id: string; slug: string; title: string; description: string; position: number };
type AcademyChapter = { id: string; module_id: string };
type ChapterProgress = { chapter_id: string; read_percent: number; status: string; best_score: number | null };

export default async function ClassroomPage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/classroom');
  if (profile.role === 'admin') redirect('/admin/classroom-progress');
  if (profile.role === 'manager') redirect('/manager');
  if (profile.role !== 'student') redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const [modulesRes, chaptersRes, progressRes, messages, requests] = await Promise.all([
    supabase.from('academy_modules').select('id,slug,title,description,position').eq('is_active', true).order('position'),
    supabase.from('academy_chapters').select('id,module_id').eq('is_active', true),
    supabase.from('academy_chapter_progress').select('chapter_id,read_percent,status,best_score').eq('user_id', profile.userId),
    supabase.from('classroom_messages').select('id,subject,body,status,created_at').eq('model_id', profile.profileId).order('created_at', { ascending: false }).limit(5),
    supabase.from('classroom_requests').select('id,request_type,status,message,created_at').eq('model_id', profile.profileId).order('created_at', { ascending: false }).limit(5),
  ]);

  const modules = (modulesRes.data || []) as AcademyModule[];
  const chapters = (chaptersRes.data || []) as AcademyChapter[];
  const progressRows = (progressRes.data || []) as ChapterProgress[];
  const progressMap = new Map(progressRows.map((row) => [row.chapter_id, row]));
  const totalChapters = chapters.length;
  const passedChapters = chapters.filter((chapter) => progressMap.get(chapter.id)?.status === 'passed').length;
  const readingAverage = totalChapters
    ? Math.round(chapters.reduce((sum, chapter) => sum + Math.min(100, Number(progressMap.get(chapter.id)?.read_percent || 0)), 0) / totalChapters)
    : 0;
  const validationProgress = totalChapters ? Math.round((passedChapters / totalChapters) * 100) : 0;

  const moduleStats = modules.map((module) => {
    const own = chapters.filter((chapter) => chapter.module_id === module.id);
    const passed = own.filter((chapter) => progressMap.get(chapter.id)?.status === 'passed').length;
    const reading = own.length
      ? Math.round(own.reduce((sum, chapter) => sum + Math.min(100, Number(progressMap.get(chapter.id)?.read_percent || 0)), 0) / own.length)
      : 0;
    return { module, chapterCount: own.length, passed, reading };
  });

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1450px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.3rem] bg-pm-sage p-6 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-pm-gold-light/55 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-teal">Perfect Models Academy · Classroom personnelle</p>
              <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-6xl lg:text-7xl">Lire. Comprendre.<br /><em className="font-normal text-pm-wine">Valider par le quiz.</em></h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-pm-ink/55">La lecture mesure votre progression, mais seul un quiz réussi valide un chapitre et déverrouille le suivant.</p>
              <div className="mt-7 flex flex-wrap gap-3"><Link href="/profil" className="control-button">← Mon tableau de bord</Link><Link href="/formations" className="control-button">Ouvrir l’Academy ↗</Link><Link href="/formations/forum" className="control-button control-button--soft">Forum de la classe</Link></div>
            </div>
            <div className="grid grid-cols-2 gap-3"><Stat value={`${readingAverage}%`} label="Lecture moyenne" tone="bg-pm-teal text-white"/><Stat value={`${validationProgress}%`} label="Chapitres validés" tone="bg-pm-coral text-white"/></div>
          </div>
        </section>

        <section className="control-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="control-kicker">Parcours pédagogique</p><h2 className="mt-2 font-playfair text-4xl font-semibold">Les 10 modules</h2></div><p className="text-xs font-bold uppercase tracking-[.15em] text-pm-ink/35">{passedChapters}/{totalChapters} chapitres validés</p></div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {moduleStats.map(({ module, chapterCount, passed, reading }, index) => (
              <Link key={module.id} href={`/formations/module/${encodeURIComponent(module.slug)}`} className={`group rounded-[1.7rem] p-5 transition hover:-translate-y-1 ${index % 3 === 0 ? 'bg-pm-peach' : index % 3 === 1 ? 'bg-pm-gold-light/40' : 'bg-pm-sage'}`}>
                <div className="flex items-start justify-between"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine/60">Module {String(module.position).padStart(2, '0')}</span><span className="text-pm-coral transition group-hover:translate-x-1">↗</span></div>
                <h3 className="mt-8 font-playfair text-3xl font-semibold leading-tight">{module.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-pm-ink/48">{module.description}</p>
                <div className="mt-8 space-y-3">
                  <div><div className="mb-2 flex justify-between text-[9px] font-black uppercase tracking-[.13em] text-pm-ink/40"><span>Lecture</span><span>{reading}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-pm-teal" style={{ width: `${reading}%` }} /></div></div>
                  <p className="text-[9px] font-black uppercase tracking-[.13em] text-pm-ink/40">{passed}/{chapterCount} chapitre(s) validé(s) par quiz</p>
                </div>
              </Link>
            ))}
          </div>
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
