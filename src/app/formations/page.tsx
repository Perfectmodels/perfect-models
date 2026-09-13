import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type AcademyModule = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  position: number;
};

type AcademyChapter = { id: string; module_id: string };
type ChapterProgress = { chapter_id: string; read_percent: number; status: string };

const levelLabel: Record<string, string> = {
  foundation: 'Fondation',
  technical: 'Technique',
  industry: 'Industrie',
  professional: 'Professionnel',
  advanced: 'Advanced',
};

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const [{ data: modules }, { data: chapters }, { data: progress }] = await Promise.all([
    supabase.from('academy_modules').select('id,slug,title,description,level,position').eq('is_active', true).order('position'),
    supabase.from('academy_chapters').select('id,module_id').eq('is_active', true),
    supabase.from('academy_chapter_progress').select('chapter_id,read_percent,status').eq('user_id', profile.userId),
  ]);

  const moduleRows = (modules || []) as AcademyModule[];
  const chapterRows = (chapters || []) as AcademyChapter[];
  const progressRows = (progress || []) as ChapterProgress[];
  const progressMap = new Map(progressRows.map((item) => [item.chapter_id, item]));

  const moduleStats = moduleRows.map((module) => {
    const ownChapters = chapterRows.filter((chapter) => chapter.module_id === module.id);
    const values = ownChapters.map((chapter) => {
      const item = progressMap.get(chapter.id);
      return item?.status === 'passed' ? 100 : Math.min(90, Number(item?.read_percent || 0));
    });
    const completed = ownChapters.filter((chapter) => progressMap.get(chapter.id)?.status === 'passed').length;
    return {
      module,
      chapters: ownChapters.length,
      completed,
      progress: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
    };
  });

  const totalChapters = chapterRows.length;
  const passedChapters = chapterRows.filter((chapter) => progressMap.get(chapter.id)?.status === 'passed').length;
  const globalProgress = totalChapters ? Math.round((passedChapters / totalChapters) * 100) : 0;

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1450px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.4rem] bg-pm-wine p-7 text-white sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-pm-coral/45 blur-3xl" />
          <div className="relative grid gap-9 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold-light">Perfect Models Academy · 100 chapitres</p>
              <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-6xl lg:text-7xl">Du premier casting<br /><em className="font-normal text-pm-peach">à la carrière.</em></h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/62">Un parcours progressif en 10 modules : fondamentaux, corps, runway, photographie, casting, culture mode, mode gabonaise, droit, image et gestion de carrière.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={profile.role === 'student' ? '/profil/classroom' : '/admin/classroom'} className="rounded-full bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-pm-wine">{profile.role === 'student' ? '← Ma Classroom' : 'Gérer l’Academy'}</Link>
                <Link href="/formations/forum" className="rounded-full border border-white/25 px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-white">Forum</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat value={`${globalProgress}%`} label="Parcours validé" tone="bg-pm-coral" />
              <Stat value={`${passedChapters}/${totalChapters}`} label="Chapitres validés" tone="bg-white/10" />
            </div>
          </div>
        </section>

        <section className="control-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="control-kicker">Programme pédagogique</p><h2 className="mt-2 font-playfair text-4xl font-semibold sm:text-5xl">Les 10 modules PMM</h2></div>
            <p className="max-w-sm text-sm leading-6 text-pm-ink/42">Chaque module contient 10 chapitres. Un quiz de raisonnement de 30 questions valide chaque chapitre.</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {moduleStats.map(({ module, chapters: count, completed, progress }, index) => {
              const tones = ['bg-pm-peach', 'bg-pm-sage', 'bg-pm-gold-light/45'];
              return (
                <Link key={module.id} href={`/formations/module/${encodeURIComponent(module.slug)}`} className={`group flex min-h-[330px] flex-col rounded-[1.9rem] p-6 transition hover:-translate-y-1 ${tones[index % tones.length]}`}>
                  <div className="flex items-start justify-between"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine/60">Module {String(module.position).padStart(2, '0')} · {levelLabel[module.level] || module.level}</span><span className="text-xl text-pm-coral transition group-hover:translate-x-1">↗</span></div>
                  <h3 className="mt-10 font-playfair text-3xl font-semibold leading-tight">{module.title}</h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-pm-ink/50">{module.description}</p>
                  <div className="mt-auto pt-8">
                    <div className="mb-4 flex gap-2 text-[8px] font-black uppercase tracking-[.12em] text-pm-ink/40"><span>{count} chapitres</span><span>·</span><span>{completed} validés</span></div>
                    <div className="mb-2 flex justify-between text-[8px] font-black uppercase tracking-[.13em] text-pm-ink/40"><span>Progression</span><span>{progress}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-pm-wine" style={{ width: `${progress}%` }} /></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) {
  return <div className={`rounded-[1.6rem] p-5 ${tone}`}><p className="font-playfair text-4xl font-semibold sm:text-5xl">{value}</p><p className="mt-3 text-[8px] font-black uppercase tracking-[.18em] text-white/65">{label}</p></div>;
}
