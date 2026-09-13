import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ moduleSlug: string }> };

type Chapter = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  position: number;
  estimated_minutes: number;
};

type Progress = { chapter_id: string; read_percent: number; status: string; best_score: number | null };

export default async function Page({ params }: Props) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');

  const { moduleSlug } = await params;
  const supabase = createSupabaseAdminClient() as any;
  const { data: module } = await supabase.from('academy_modules').select('*').eq('slug', moduleSlug).eq('is_active', true).maybeSingle();
  if (!module) notFound();

  const { data: chapters } = await supabase.from('academy_chapters').select('id,slug,title,summary,position,estimated_minutes').eq('module_id', module.id).eq('is_active', true).order('position');
  const chapterRows = (chapters || []) as Chapter[];
  const chapterIds = chapterRows.map((chapter) => chapter.id);
  const { data: progress } = chapterIds.length
    ? await supabase.from('academy_chapter_progress').select('chapter_id,read_percent,status,best_score').eq('user_id', profile.userId).in('chapter_id', chapterIds)
    : { data: [] };
  const progressMap = new Map(((progress || []) as Progress[]).map((item) => [item.chapter_id, item]));
  const passed = chapterRows.filter((chapter) => progressMap.get(chapter.id)?.status === 'passed').length;

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1320px] space-y-7">
        <header className="relative overflow-hidden rounded-[2.4rem] bg-pm-sage p-7 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-pm-gold-light/60 blur-3xl" />
          <div className="relative max-w-4xl">
            <Link href="/formations" className="text-[9px] font-black uppercase tracking-[.22em] text-pm-teal">← Perfect Models Academy</Link>
            <p className="mt-8 text-[9px] font-black uppercase tracking-[.2em] text-pm-coral">Module {String(module.position).padStart(2, '0')} · {passed}/{chapterRows.length} validés</p>
            <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.94] tracking-[-.04em] sm:text-6xl lg:text-7xl">{module.title}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-pm-ink/55">{module.description}</p>
          </div>
        </header>

        <section className="control-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="control-kicker">Progression guidée</p><h2 className="mt-2 font-playfair text-4xl font-semibold">10 chapitres</h2></div>
            <p className="max-w-md text-sm leading-6 text-pm-ink/45">Lecture à 90 % + 60 secondes minimum, puis quiz de 30 questions. Validation à partir de 70 %.</p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {chapterRows.map((chapter, index) => {
              const item = progressMap.get(chapter.id);
              const previous = index > 0 ? progressMap.get(chapterRows[index - 1].id) : null;
              const locked = profile.role === 'student' && index > 0 && previous?.status !== 'passed';
              const status = item?.status === 'passed' ? 'Validé' : item?.status === 'quiz_unlocked' ? 'Quiz disponible' : item?.status === 'in_progress' ? 'En cours' : 'À commencer';
              const card = (
                <div className={`flex min-h-[225px] flex-col rounded-[1.7rem] border p-6 ${locked ? 'border-pm-ink/5 bg-pm-paper/60 opacity-55' : 'border-pm-ink/[.08] bg-white/75 transition hover:-translate-y-1'}`}>
                  <div className="flex items-start justify-between gap-4"><span className="text-[8px] font-black uppercase tracking-[.18em] text-pm-coral">Chapitre {String(chapter.position).padStart(2, '0')}</span><span className="rounded-full bg-pm-sage px-3 py-2 text-[8px] font-black uppercase tracking-[.12em] text-pm-teal">{locked ? 'Verrouillé' : status}</span></div>
                  <h3 className="mt-6 font-playfair text-3xl font-semibold leading-tight">{chapter.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-pm-ink/50">{chapter.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-6 text-[8px] font-black uppercase tracking-[.13em] text-pm-ink/40"><span>≈ {chapter.estimated_minutes} min</span><span>{item?.best_score != null ? `Meilleur score ${Math.round(Number(item.best_score))}%` : locked ? 'Validez le précédent' : 'Ouvrir →'}</span></div>
                </div>
              );
              return locked ? <div key={chapter.id}>{card}</div> : <Link key={chapter.id} href={`/formations/${encodeURIComponent(module.slug)}/${encodeURIComponent(chapter.slug)}`}>{card}</Link>;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
