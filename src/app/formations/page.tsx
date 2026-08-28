import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { readCourseProgress } from '@/lib/classroom-progress';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function metadata(content: unknown) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return { duration: 'À votre rythme', level: 'Fondamental' };
  const data = content as Record<string, unknown>;
  return { duration: String(data.duration || 'À votre rythme'), level: String(data.level || 'Fondamental') };
}

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const [{ data: courses }, { data: progress }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true).order('position'),
    supabase.from('course_progress').select('*').eq('user_id', profile.userId),
  ]);
  const progressMap = new Map<string, number>((progress || []).map((item: any) => [String(item.course_id), readCourseProgress(item)]));
  const lessons = Array.isArray(courses) ? courses : [];
  const completed = lessons.filter((course: any) => (progressMap.get(String(course.id)) || 0) >= 100).length;
  const average = lessons.length ? Math.round(lessons.reduce((sum: number, course: any) => sum + (progressMap.get(String(course.id)) || 0), 0) / lessons.length) : 0;

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1450px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.4rem] bg-pm-wine p-7 text-white sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-pm-coral/45 blur-3xl" />
          <div className="relative grid gap-9 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div><p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold-light">PMM Campus · Parcours fondamental</p><h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-6xl lg:text-7xl">La technique nourrit<br /><em className="font-normal text-pm-peach">la présence.</em></h1><p className="mt-6 max-w-2xl text-sm leading-7 text-white/62">Une formation structurée pour comprendre les codes du métier, travailler avec rigueur et développer une identité professionnelle durable.</p><div className="mt-7 flex flex-wrap gap-3"><Link href={profile.role === 'student' ? '/profil/classroom' : '/admin/classroom'} className="rounded-full bg-white px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-pm-wine">{profile.role === 'student' ? '← Ma Classroom' : 'Gérer les cours'}</Link><Link href="/formations/forum" className="rounded-full border border-white/25 px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-white">Forum</Link></div></div>
            <div className="grid grid-cols-2 gap-3"><Stat value={`${average}%`} label="Progression" tone="bg-pm-coral"/><Stat value={`${completed}/${lessons.length}`} label="Cours terminés" tone="bg-white/10"/></div>
          </div>
        </section>

        <section className="control-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="control-kicker">Programme pédagogique</p><h2 className="mt-2 font-playfair text-4xl font-semibold sm:text-5xl">Les fondamentaux PMM</h2></div><p className="max-w-sm text-sm leading-6 text-pm-ink/42">Progressez dans l’ordre conseillé, puis revenez sur chaque cours autant que nécessaire.</p></div>
          {lessons.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{lessons.map((course: any, index: number) => {
            const value = progressMap.get(String(course.id)) || 0;
            const info = metadata(course.content);
            const tones = ['bg-pm-peach', 'bg-pm-sage', 'bg-pm-gold-light/45'];
            return <Link key={course.id} href={`/formations/module/${encodeURIComponent(course.id)}`} className={`group flex min-h-[320px] flex-col rounded-[1.9rem] p-6 transition hover:-translate-y-1 ${tones[index % tones.length]}`}><div className="flex items-start justify-between"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine/60">Cours {String(index + 1).padStart(2, '0')}</span><span className="text-xl text-pm-coral transition group-hover:translate-x-1">↗</span></div><h3 className="mt-10 font-playfair text-3xl font-semibold leading-tight">{course.title}</h3><p className="mt-4 line-clamp-3 text-sm leading-6 text-pm-ink/50">{course.description || 'Contenu pédagogique PMM.'}</p><div className="mt-auto pt-8"><div className="mb-4 flex gap-2 text-[8px] font-black uppercase tracking-[.12em] text-pm-ink/40"><span>{info.duration}</span><span>·</span><span>{info.level}</span></div><div className="mb-2 flex justify-between text-[8px] font-black uppercase tracking-[.13em] text-pm-ink/40"><span>{value >= 100 ? 'Terminé' : 'Progression'}</span><span>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/65"><div className="h-full rounded-full bg-pm-wine" style={{ width: `${value}%` }} /></div></div></Link>;
          })}</div> : <div className="mt-8 rounded-[1.8rem] border border-dashed border-pm-ink/15 bg-pm-paper p-12 text-center"><h2 className="font-playfair text-3xl font-semibold">Le programme se prépare.</h2><p className="mt-3 text-sm text-pm-ink/40">Les premiers cours seront publiés ici par l’équipe pédagogique.</p></div>}
        </section>
      </div>
    </main>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: string }) { return <div className={`rounded-[1.6rem] p-5 ${tone}`}><p className="font-playfair text-4xl font-semibold sm:text-5xl">{value}</p><p className="mt-3 text-[8px] font-black uppercase tracking-[.18em] text-white/65">{label}</p></div>; }
