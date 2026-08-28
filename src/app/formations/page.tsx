import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type CourseProgress = {
  course_id: string;
  completed_at?: string | null;
};

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/formations');
  if (!['student', 'admin', 'manager'].includes(profile.role)) redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const { data: courses } = await supabase.from('courses').select('*').eq('is_active', true).order('position');
  const { data: progress } = await supabase.from('course_progress').select('*').eq('user_id', profile.userId);
  const progressMap = new Map<string, CourseProgress>(
    (progress || []).map((item: CourseProgress) => [String(item.course_id), item]),
  );

  return (
    <main className="min-h-screen bg-pm-dark px-5 py-12 text-pm-off-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-white/10 pb-8">
          <p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Classroom · Supabase</p>
          <h1 className="mt-3 font-playfair text-5xl font-bold">Formations</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
            Les cours publiés apparaissent ici directement depuis la table <code>courses</code>. Aucun module de démonstration n’est injecté.
          </p>
        </div>

        {courses?.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => {
              const p = progressMap.get(String(course.id));
              return (
                <Link
                  key={course.id}
                  href={`/formations/module/${encodeURIComponent(course.id)}`}
                  className="border border-white/10 bg-black/20 p-6 transition hover:border-pm-gold/45"
                >
                  <p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold">
                    {p?.completed_at ? 'Terminé' : 'En cours'}
                  </p>
                  <h2 className="mt-3 font-playfair text-2xl font-bold">{course.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/40">{course.description || 'Cours PMM'}</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 border border-white/10 bg-black/20 p-12 text-center">
            <h2 className="font-playfair text-3xl font-bold">Aucun cours actif</h2>
            <p className="mt-3 text-sm text-white/40">L’administration peut publier les prochains modules depuis le nouveau back-office Supabase.</p>
          </div>
        )}

        <Link href="/formations/forum" className="mt-8 inline-flex border border-white/15 px-5 py-3 text-[9px] font-black uppercase tracking-wider">
          Accéder au forum
        </Link>
      </div>
    </main>
  );
}
