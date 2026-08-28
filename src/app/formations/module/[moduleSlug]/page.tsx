import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import CourseProgressButton from '@/components/classroom/CourseProgressButton';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { readCourseProgress } from '@/lib/classroom-progress';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ moduleSlug: string }> };
type CourseSection = { title: string; body: string[]; keyPoints: string[] };

const strings = (value: unknown) => Array.isArray(value) ? value.map(String).filter(Boolean) : [];

function courseContent(value: unknown) {
  const data = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
  const sections: CourseSection[] = Array.isArray(data.sections) ? data.sections.map((section: any) => ({ title: String(section?.title || 'À retenir'), body: strings(section?.body), keyPoints: strings(section?.keyPoints) })) : [];
  const exercise = data.exercise && typeof data.exercise === 'object' ? { title: String(data.exercise.title || 'Mise en pratique'), instructions: strings(data.exercise.instructions), deliverable: String(data.exercise.deliverable || '') } : null;
  return { duration: String(data.duration || 'À votre rythme'), level: String(data.level || 'Fondamental'), objectives: strings(data.objectives), sections, exercise, takeaways: strings(data.takeaways) };
}

export default async function Page({ params }: Props) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');
  const { moduleSlug } = await params;
  const supabase = createSupabaseAdminClient() as any;
  const [{ data: course }, { data: progress }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', moduleSlug).eq('is_active', true).maybeSingle(),
    supabase.from('course_progress').select('*').eq('user_id', profile.userId).eq('course_id', moduleSlug).maybeSingle(),
  ]);
  if (!course) notFound();
  const content = courseContent(course.content);
  const progressValue = readCourseProgress(progress);

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <article className="mx-auto max-w-[1320px] space-y-7">
        <header className="relative overflow-hidden rounded-[2.4rem] bg-pm-sage p-7 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-pm-gold-light/60 blur-3xl" />
          <div className="relative max-w-4xl"><Link href="/formations" className="text-[9px] font-black uppercase tracking-[.22em] text-pm-teal">← Programme PMM</Link><div className="mt-7 flex flex-wrap gap-2"><Badge>{content.level}</Badge><Badge>{content.duration}</Badge><Badge>{progressValue >= 100 ? 'Terminé' : 'En apprentissage'}</Badge></div><h1 className="mt-5 font-playfair text-5xl font-semibold leading-[.94] tracking-[-.04em] sm:text-6xl lg:text-7xl">{course.title}</h1>{course.description && <p className="mt-6 max-w-3xl text-base leading-8 text-pm-ink/55">{course.description}</p>}</div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-6">
            {content.objectives.length > 0 && <section className="control-card"><p className="control-kicker">Objectifs</p><h2 className="mt-2 font-playfair text-4xl font-semibold">À la fin de ce cours</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{content.objectives.map((item, index) => <div key={item} className="rounded-[1.3rem] bg-pm-peach p-4"><span className="text-[8px] font-black uppercase tracking-[.18em] text-pm-coral">0{index + 1}</span><p className="mt-3 text-sm font-semibold leading-6">{item}</p></div>)}</div></section>}

            {content.sections.map((section, index) => <section key={`${section.title}-${index}`} className="control-card"><p className="control-kicker">Chapitre {String(index + 1).padStart(2, '0')}</p><h2 className="mt-2 font-playfair text-4xl font-semibold">{section.title}</h2><div className="mt-6 space-y-4">{section.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="text-[15px] leading-8 text-pm-ink/60">{paragraph}</p>)}</div>{section.keyPoints.length > 0 && <div className="mt-7 rounded-[1.5rem] bg-pm-sage p-5"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-teal">Points essentiels</p><ul className="mt-4 space-y-3">{section.keyPoints.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-pm-ink/60"><span className="mt-1 text-pm-coral">◆</span><span>{point}</span></li>)}</ul></div>}</section>)}

            {content.exercise && <section className="rounded-[2rem] bg-pm-coral p-7 text-white sm:p-9"><p className="text-[9px] font-black uppercase tracking-[.25em] text-white/65">Atelier pratique</p><h2 className="mt-3 font-playfair text-4xl font-semibold">{content.exercise.title}</h2><ol className="mt-6 space-y-4">{content.exercise.instructions.map((instruction, index) => <li key={instruction} className="flex gap-4 text-sm leading-7 text-white/82"><span className="font-playfair text-2xl text-pm-gold-light">{index + 1}</span><span>{instruction}</span></li>)}</ol>{content.exercise.deliverable && <p className="mt-7 rounded-[1.2rem] bg-white/12 p-4 text-sm leading-6"><strong>Livrable :</strong> {content.exercise.deliverable}</p>}</section>}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28">
            {profile.role === 'student' ? <CourseProgressButton courseId={String(course.id)} initialProgress={progressValue} /> : <div className="rounded-[1.7rem] bg-pm-ink p-5 text-white"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-gold-light">Mode supervision</p><p className="mt-3 text-sm leading-6 text-white/60">Vous consultez ce cours avec un accès {profile.role === 'admin' ? 'administrateur' : 'manager'}.</p><Link href="/admin/classroom" className="mt-5 inline-flex rounded-full bg-pm-coral px-5 py-3 text-[8px] font-black uppercase tracking-[.15em]">Gérer le contenu</Link></div>}
            {content.takeaways.length > 0 && <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white/75 p-5"><p className="control-kicker">Mémoriser</p><h2 className="mt-2 font-playfair text-2xl font-semibold">L’essentiel</h2><ul className="mt-5 space-y-4">{content.takeaways.map((item) => <li key={item} className="flex gap-3 text-xs leading-6 text-pm-ink/55"><span className="text-pm-coral">✓</span><span>{item}</span></li>)}</ul></section>}
          </aside>
        </div>
      </article>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) { return <span className="rounded-full border border-pm-ink/10 bg-white/55 px-3 py-2 text-[8px] font-black uppercase tracking-[.14em] text-pm-wine">{children}</span>; }
