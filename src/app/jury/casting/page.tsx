import { redirect } from 'next/navigation';
import JuryScoreForm from '@/components/casting/JuryScoreForm';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/jury/casting');
  if (!['jury', 'admin', 'manager'].includes(profile.role)) redirect('/profil');

  const supabase = createSupabaseAdminClient() as any;
  const [{ data: apps }, { data: scores }] = await Promise.all([
    supabase.from('casting_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('casting_scores').select('*').eq('jury_user_id', profile.userId),
  ]);

  const scoreMap = new Map<string, Record<string, any>>(
    (scores || []).map((score: Record<string, any>) => [String(score.casting_application_id), score]),
  );

  return (
    <main className="min-h-screen bg-pm-dark px-5 py-12 text-pm-off-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="border-b border-white/10 pb-8">
          <p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Jury Casting · Supabase</p>
          <h1 className="mt-3 font-playfair text-5xl font-bold">Évaluation des candidats</h1>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {apps?.map((app: any) => (
            <article key={app.id} className="border border-white/10 bg-black/20 p-6">
              <div className="flex gap-4">
                {Array.isArray(app.photos) && app.photos.find(Boolean) ? (
                  <img src={app.photos.find(Boolean)} alt={app.full_name || 'Candidat'} className="h-28 w-24 object-cover" />
                ) : null}
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-pm-gold">{app.status}</p>
                  <h2 className="mt-2 font-playfair text-2xl font-bold">{app.full_name || `${app.first_name || ''} ${app.last_name || ''}`}</h2>
                  <p className="mt-2 text-xs text-white/40">{app.gender || '—'} · {app.height_cm ? `${app.height_cm} cm` : '—'} · {app.city || '—'}</p>
                </div>
              </div>
              <JuryScoreForm applicationId={app.id} initial={scoreMap.get(String(app.id))} />
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
