import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import AcademyChapterClient from '@/components/classroom/AcademyChapterClient';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ moduleSlug: string; chapterSlug: string }> };
type Section = { title?: string; content?: string };
type Question = { id: string; question_type: string; prompt: string; choices: Record<string, string>; difficulty: number; position: number };

export default async function Page({ params }: Props) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');

  const { moduleSlug, chapterSlug } = await params;
  const supabase = createSupabaseAdminClient() as any;
  const { data: module } = await supabase.from('academy_modules').select('*').eq('slug', moduleSlug).eq('is_active', true).maybeSingle();
  if (!module) notFound();
  const { data: chapter } = await supabase.from('academy_chapters').select('*').eq('module_id', module.id).eq('slug', chapterSlug).eq('is_active', true).maybeSingle();
  if (!chapter) notFound();

  const { data: siblings } = await supabase.from('academy_chapters').select('id,slug,title,position').eq('module_id', module.id).eq('is_active', true).order('position');
  const chapterList = siblings || [];
  const currentIndex = chapterList.findIndex((item: any) => item.id === chapter.id);
  const previous = currentIndex > 0 ? chapterList[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < chapterList.length - 1 ? chapterList[currentIndex + 1] : null;

  if (profile.role === 'student' && previous) {
    const { data: previousProgress } = await supabase.from('academy_chapter_progress').select('status').eq('user_id', profile.userId).eq('chapter_id', previous.id).maybeSingle();
    if (previousProgress?.status !== 'passed') redirect(`/formations/module/${encodeURIComponent(module.slug)}`);
  }

  if (profile.role === 'student' && !previous && Number(module.position) > 1) {
    const { data: previousModule } = await supabase.from('academy_modules').select('id,slug').eq('position', Number(module.position) - 1).eq('is_active', true).maybeSingle();
    if (previousModule) {
      const { data: previousModuleChapters } = await supabase.from('academy_chapters').select('id').eq('module_id', previousModule.id).eq('is_active', true);
      const ids = (previousModuleChapters || []).map((item: any) => item.id);
      const { data: previousModuleProgress } = ids.length ? await supabase.from('academy_chapter_progress').select('chapter_id,status').eq('user_id', profile.userId).in('chapter_id', ids) : { data: [] };
      const passed = new Set((previousModuleProgress || []).filter((item: any) => item.status === 'passed').map((item: any) => item.chapter_id));
      if (!ids.length || !ids.every((id: string) => passed.has(id))) redirect(`/formations/module/${encodeURIComponent(previousModule.slug)}`);
    }
  }

  const [{ data: questions }, { data: progress }] = await Promise.all([
    supabase.from('academy_quiz_questions').select('id,question_type,prompt,choices,difficulty,position').eq('chapter_id', chapter.id).eq('is_active', true).order('position'),
    supabase.from('academy_chapter_progress').select('*').eq('user_id', profile.userId).eq('chapter_id', chapter.id).maybeSingle(),
  ]);

  const objectives = Array.isArray(chapter.objectives) ? chapter.objectives.map(String) : [];
  const sections = Array.isArray(chapter.sections) ? chapter.sections as Section[] : [];
  const keyPoints = Array.isArray(chapter.key_points) ? chapter.key_points.map(String) : [];
  const questionRows = (questions || []) as Question[];
  const nextHref = next ? `/formations/${encodeURIComponent(module.slug)}/${encodeURIComponent(next.slug)}` : null;

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <article className="mx-auto max-w-[1180px] space-y-7">
        <header className="relative overflow-hidden rounded-[2.4rem] bg-pm-wine p-7 text-white sm:p-10 lg:p-12">
          <div className="relative max-w-4xl">
            <Link href={`/formations/module/${encodeURIComponent(module.slug)}`} className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">← {module.title}</Link>
            <p className="mt-8 text-[9px] font-black uppercase tracking-[.2em] text-pm-peach">Module {String(module.position).padStart(2, '0')} · Chapitre {String(chapter.position).padStart(2, '0')}</p>
            <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.94] tracking-[-.04em] sm:text-6xl lg:text-7xl">{chapter.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62">{chapter.summary}</p>
          </div>
        </header>
        {objectives.length > 0 && <section className="control-card"><p className="control-kicker">Objectifs pédagogiques</p><h2 className="mt-2 font-playfair text-4xl font-semibold">Ce que vous devez savoir faire</h2><div className="mt-6 grid gap-3 md:grid-cols-3">{objectives.map((objective, index) => <div key={objective} className="rounded-[1.4rem] bg-pm-peach p-5"><span className="text-[8px] font-black uppercase tracking-[.18em] text-pm-coral">0{index + 1}</span><p className="mt-3 text-sm font-semibold leading-6">{objective}</p></div>)}</div></section>}
        <div className="space-y-5">{sections.map((section, index) => <section key={`${section.title}-${index}`} className="control-card"><p className="control-kicker">Partie {String(index + 1).padStart(2, '0')}</p><h2 className="mt-2 font-playfair text-4xl font-semibold">{section.title || 'À retenir'}</h2><p className="mt-6 text-[15px] leading-8 text-pm-ink/62">{section.content || chapter.summary}</p></section>)}</div>
        {keyPoints.length > 0 && <section className="rounded-[2rem] bg-pm-sage p-7 sm:p-9"><p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-teal">Mémoriser</p><h2 className="mt-2 font-playfair text-4xl font-semibold">Les points essentiels</h2><ul className="mt-6 grid gap-3 md:grid-cols-3">{keyPoints.map((item) => <li key={item} className="rounded-[1.2rem] bg-white/60 p-4 text-sm leading-6 text-pm-ink/60">✓ {item}</li>)}</ul></section>}
        {chapter.practical_exercise && <section className="rounded-[2rem] bg-pm-coral p-7 text-white sm:p-9"><p className="text-[9px] font-black uppercase tracking-[.22em] text-white/65">Atelier pratique</p><h2 className="mt-2 font-playfair text-4xl font-semibold">Passer de la théorie au geste</h2><p className="mt-5 max-w-3xl text-sm leading-7 text-white/82">{chapter.practical_exercise}</p></section>}
        <AcademyChapterClient chapterId={chapter.id} questions={questionRows} initialProgress={progress} minimumReadPercent={Number(chapter.minimum_read_percent)} minimumReadSeconds={Number(chapter.minimum_read_seconds)} passScore={Number(chapter.pass_score)} supervision={profile.role !== 'student'} nextHref={nextHref} />
        <nav className="grid gap-3 sm:grid-cols-2">
          {previous ? <Link href={`/formations/${encodeURIComponent(module.slug)}/${encodeURIComponent(previous.slug)}`} className="rounded-[1.5rem] border border-pm-ink/10 bg-white p-5"><span className="text-[8px] font-black uppercase tracking-[.15em] text-pm-ink/35">← Chapitre précédent</span><p className="mt-2 font-playfair text-2xl font-semibold">{previous.title}</p></Link> : <Link href="/formations" className="rounded-[1.5rem] border border-pm-ink/10 bg-white p-5"><p className="font-playfair text-2xl font-semibold">Perfect Models Academy</p></Link>}
          {next ? <div className="rounded-[1.5rem] border border-pm-ink/10 bg-white p-5 text-right"><span className="text-[8px] font-black uppercase tracking-[.15em] text-pm-ink/35">Déverrouillé uniquement après réussite du quiz →</span><p className="mt-2 font-playfair text-2xl font-semibold">{next.title}</p></div> : <div className="rounded-[1.5rem] bg-pm-wine p-5 text-right text-white"><p className="font-playfair text-2xl font-semibold">Validation & certificat</p></div>}
        </nav>
      </article>
    </main>
  );
}
